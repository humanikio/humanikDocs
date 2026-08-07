#!/usr/bin/env node
/**
 * Audits every spec for identifiers the caller must supply but is never told
 * how to obtain.
 *
 * An operation that takes an ID it did not issue is incomplete until the
 * reference says where that ID comes from. This finds the ones that do not.
 *
 * Flags an ID-shaped parameter or body field when its operation's description
 * neither links to another operation nor shows a fetch snippet.
 *
 * Run:  pnpm ids:check
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SPEC_DIR = path.join(ROOT, 'openapi');
const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

function findYaml() {
  const direct = path.join(ROOT, 'node_modules/yaml');
  if (fs.existsSync(direct)) return direct;
  const pnpm = path.join(ROOT, 'node_modules/.pnpm');
  for (const dir of fs.readdirSync(pnpm)) {
    if (!dir.startsWith('yaml@')) continue;
    const c = path.join(pnpm, dir, 'node_modules/yaml');
    if (fs.existsSync(c)) return c;
  }
  throw new Error('no yaml package found');
}
const YAML = require(findYaml());

/** Reads like an identifier the caller has to source from somewhere. */
const looksLikeId = (name) =>
  /(^|[a-z])(Id|Ids|Sid)$/.test(name) ||
  name === 'id' ||
  // Name-suffixed fields are display names, not identifiers — except these two,
  // which name an existing vault group or field definition.
  name === 'secretName' ||
  name === 'fieldName';

/**
 * Identifiers the caller already has, or that this operation is about to
 * create. These need a description but not a lookup.
 */
const SELF_EVIDENT = new Set([
  'workspaceId', // the caller's own scope, explained once per spec
  'name', // a value being set, not looked up
  'displayName',
  'fieldName',
  'secretName', // named by the caller on create; the exception is on delete
  'localPart',
  'domain',
]);

function resolveRef(doc, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return undefined;
  let cur = doc;
  for (const seg of ref.replace(/^#\//, '').split('/')) cur = cur?.[seg];
  return cur;
}

/** Does this description tell the reader where to get something? */
function hasGuidance(text) {
  if (!text) return false;
  const linksOut = /\]\(\/docs\//.test(text);
  const showsFetch = /```bash/.test(text);
  return linksOut || showsFetch;
}

let flagged = 0;
let checked = 0;

for (const file of fs.readdirSync(SPEC_DIR).filter((f) => /\.ya?ml$/.test(f))) {
  const doc = YAML.parse(fs.readFileSync(path.join(SPEC_DIR, file), 'utf8'));
  const rows = [];

  for (const [route, item] of Object.entries(doc.paths ?? {})) {
    const shared = item.parameters ?? [];

    for (const method of METHODS) {
      const op = item[method];
      if (!op) continue;

      const where = `${method.toUpperCase()} ${route}`;
      const desc = op.description ?? '';
      const guided = hasGuidance(desc);

      // --- path and query parameters -----------------------------------
      for (const raw of [...shared, ...(op.parameters ?? [])]) {
        const p = raw.$ref ? resolveRef(doc, raw.$ref) : raw;
        if (!p?.name || !looksLikeId(p.name) || SELF_EVIDENT.has(p.name)) continue;
        checked += 1;
        const described = Boolean(p.description);
        if (!described && !guided) {
          rows.push(`${where} — path/query "${p.name}" has no description and no lookup`);
        }
      }

      // --- request body fields ------------------------------------------
      const schema = op.requestBody?.content?.['application/json']?.schema;
      const props = schema?.$ref ? resolveRef(doc, schema.$ref)?.properties : schema?.properties;
      for (const [field, def] of Object.entries(props ?? {})) {
        if (!looksLikeId(field) || SELF_EVIDENT.has(field)) continue;
        checked += 1;
        const described = Boolean(def?.description);
        if (!described && !guided) {
          rows.push(`${where} — body "${field}" has no description and no lookup`);
        }
      }
    }
  }

  if (rows.length) {
    console.log(`\n${file}`);
    rows.forEach((r) => console.log(`  x ${r}`));
    flagged += rows.length;
  }
}

console.log(`\n${checked} identifier(s) checked, ${flagged} undocumented`);
process.exit(flagged === 0 ? 0 : 1);
