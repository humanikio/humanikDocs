#!/usr/bin/env node
/**
 * Verifies every internal link in content/ resolves against a running site.
 *
 * Covers all three forms, because checking only the first has already missed a
 * real break in this repo:
 *   - markdown links    ](/docs/...)
 *   - JSX Card hrefs    href="/docs/..."
 *   - anchor fragments  /docs/page#heading  and  ](#heading)
 *
 * Usage:
 *   pnpm start &        # or pnpm dev
 *   pnpm links:check
 *
 * Point it elsewhere with BASE=https://docs.humanik.io pnpm links:check
 *
 * This was a bash script first. It kept reporting false negatives on anchors
 * that demonstrably existed, and debugging shell quoting through curl and grep
 * cost more than rewriting it. Node fetches each page once and caches it, which
 * is also several times faster across 200 pages.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CONTENT = path.join(ROOT, 'content/docs');
const BASE = process.env.BASE || 'http://localhost:3005';

const pageCache = new Map();

async function getPage(url) {
  if (pageCache.has(url)) return pageCache.get(url);
  let result;
  try {
    const res = await fetch(BASE + url);
    result = { status: res.status, html: res.ok ? await res.text() : '' };
  } catch (err) {
    result = { status: 0, html: '', error: err.message };
  }
  pageCache.set(url, result);
  return result;
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

/** content/docs/a/b.mdx -> /docs/a/b   ·   content/docs/a/index.mdx -> /docs/a */
function urlForFile(file) {
  const rel = path.relative(CONTENT, file).replace(/\.mdx$/, '');
  const parts = rel.split(path.sep);
  if (parts[parts.length - 1] === 'index') parts.pop();
  return '/docs' + (parts.length ? '/' + parts.join('/') : '');
}

(async () => {
  const files = walk(CONTENT);
  const checks = [];

  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const from = path.relative(ROOT, file);

    // markdown links and JSX hrefs, both absolute /docs paths
    for (const m of src.matchAll(/\]\((\/docs[^)\s]*)\)/g)) checks.push({ from, target: m[1] });
    for (const m of src.matchAll(/href="(\/docs[^"]*)"/g)) checks.push({ from, target: m[1] });

    // in-page anchors
    for (const m of src.matchAll(/\]\((#[a-z0-9-]+)\)/g)) {
      checks.push({ from, target: urlForFile(file) + m[1] });
    }
  }

  const seen = new Set();
  const unique = checks.filter((c) => {
    const key = `${c.from}|${c.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`Checking ${unique.length} link(s) against ${BASE}`);

  const broken = [];
  for (const { from, target } of unique) {
    const [urlPath, anchor] = target.split('#');
    const page = await getPage(urlPath);

    if (page.status !== 200) {
      broken.push(`${page.status || 'ERR'}  ${target}   (in ${from})`);
      continue;
    }
    if (anchor && !page.html.includes(`id="${anchor}"`)) {
      broken.push(`anchor  ${target}   (in ${from})`);
    }
  }

  for (const b of broken) console.error('  x ' + b);
  console.log(`\n${unique.length} checked, ${broken.length} broken`);
  process.exit(broken.length === 0 ? 0 : 1);
})();
