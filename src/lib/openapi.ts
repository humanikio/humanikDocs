import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import { createOpenAPI } from 'fumadocs-openapi/server';
import { apiConfig } from './shared';

/**
 * The API reference is generated from the specs in `openapi/`, not hand written.
 * See AUTHORING.md — "Reference pages are generated. Guides are written."
 *
 * **One server per system, not one server with many inputs.** The generator can
 * group operations by tag, but the `groupBy` callback only receives an entry's
 * path and method, never its tag — so a single server cannot produce
 * system-then-tag nesting. Giving each spec its own server and `baseDir` does:
 * each system becomes a folder, and its tags become section headings inside it.
 *
 * **Specs carry no host.** `servers` is injected here from `apiConfig`, which
 * reads `.env`. The API is moving from its Render URL to a subdomain, so the
 * host has to be one value that can be swapped, not a literal repeated across
 * 65 paths.
 *
 * To add a system: drop its spec in `openapi/` and add one entry to `apis`.
 */
const SPEC_DIR = path.join(process.cwd(), 'openapi');

function loadSpec(file: string) {
  return () => {
    const doc = parse(fs.readFileSync(path.join(SPEC_DIR, file), 'utf8'));

    doc.servers = [
      { url: apiConfig.production, description: 'Production' },
      { url: apiConfig.local, description: 'Local' },
    ];

    return doc;
  };
}

function system(id: string, file: string) {
  return {
    id,
    baseDir: `api-reference/${id}`,
    server: createOpenAPI({ input: { [id]: loadSpec(file) } }),
  };
}

/** Order here is the order systems appear in the API reference sidebar. */
export const apis = [
  system('offices', 'offices.yaml'),
  system('crm', 'crm.yaml'),
  system('browsers', 'browsers.yaml'),
  system('cloud', 'cloud.yaml'),
];
