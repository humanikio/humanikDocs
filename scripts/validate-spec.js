#!/usr/bin/env node
/**
 * Validates every OpenAPI spec in `openapi/`.
 *
 * Checks that each file parses, that every `$ref` resolves, that every
 * operation carries the fields the reference renderer depends on, and that
 * `operationId` is unique across all specs — generated SDK method names come
 * from it, so a collision is a silent bug.
 *
 * Run before committing a spec change:  pnpm spec:check
 *
 * Uses the `yaml` package that ships inside fumadocs-mdx, so it adds no
 * dependency of its own.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SPEC_DIR = path.join(ROOT, 'openapi');
const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

function findYaml() {
  const direct = path.join(ROOT, 'node_modules/yaml');
  if (fs.existsSync(direct)) return direct;

  const pnpm = path.join(ROOT, 'node_modules/.pnpm');
  if (fs.existsSync(pnpm)) {
    for (const dir of fs.readdirSync(pnpm)) {
      if (!dir.startsWith('yaml@')) continue;
      const candidate = path.join(pnpm, dir, 'node_modules/yaml');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  throw new Error('no yaml package found; run pnpm install');
}

const YAML = require(findYaml());

let failures = 0;
const seenOperationIds = new Map();

function fail(msg) {
  console.error(`  x ${msg}`);
  failures += 1;
}

function resolveRefs(doc, file) {
  (function walk(node, trail) {
    if (node === null || typeof node !== 'object') return;
    for (const [k, v] of Object.entries(node)) {
      if (k === '$ref' && typeof v === 'string') {
        // External refs are resolved at build time, not here.
        if (!v.startsWith('#/')) continue;
        let cur = doc;
        for (const seg of v.replace(/^#\//, '').split('/')) cur = cur?.[seg];
        if (cur === undefined) fail(`${file}: unresolved $ref ${v} at ${trail}`);
      } else {
        walk(v, `${trail}/${k}`);
      }
    }
  })(doc, '');
}

const specs = fs.existsSync(SPEC_DIR)
  ? fs.readdirSync(SPEC_DIR).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
  : [];

if (specs.length === 0) {
  console.error('No specs found in openapi/');
  process.exit(1);
}

let totalOps = 0;

for (const file of specs) {
  let doc;
  try {
    doc = YAML.parse(fs.readFileSync(path.join(SPEC_DIR, file), 'utf8'));
  } catch (err) {
    fail(`${file}: does not parse - ${err.message}`);
    continue;
  }

  if (!doc.openapi || !doc.openapi.startsWith('3.')) {
    fail(`${file}: missing or unsupported "openapi" version`);
  }
  if (!doc.info || !doc.info.title) fail(`${file}: missing info.title`);

  resolveRefs(doc, file);

  const byTag = {};
  let ops = 0;

  for (const [route, item] of Object.entries(doc.paths || {})) {
    for (const method of METHODS) {
      const op = item[method];
      if (!op) continue;
      ops += 1;

      const where = `${file} ${method.toUpperCase()} ${route}`;

      // `summary` becomes the sidebar label and the page title.
      if (!op.summary) fail(`${where}: missing summary`);

      // `operationId` becomes the URL slug and the generated SDK method name.
      if (!op.operationId) {
        fail(`${where}: missing operationId`);
      } else {
        const prev = seenOperationIds.get(op.operationId);
        if (prev) fail(`${where}: duplicate operationId "${op.operationId}" (also ${prev})`);
        else seenOperationIds.set(op.operationId, where);
      }

      if (!op.responses || Object.keys(op.responses).length === 0) {
        fail(`${where}: no responses declared`);
      }

      const tag = (op.tags || ['untagged'])[0];
      byTag[tag] = (byTag[tag] || 0) + 1;
    }
  }

  totalOps += ops;
  const tags = Object.entries(byTag)
    .map(([t, n]) => `${t} ${n}`)
    .join(' | ');
  console.log(`${file}  -  ${Object.keys(doc.paths || {}).length} paths, ${ops} operations`);
  console.log(`  ${tags}`);
}

console.log(`\n${specs.length} spec(s), ${totalOps} operations, ${failures} problem(s)`);
process.exit(failures === 0 ? 0 : 1);
