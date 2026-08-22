import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/**
 * Deliberately stricter than `zyloBoilerplates/next.jsBoilerplateZylo`.
 *
 * That boilerplate sets `typescript.ignoreBuildErrors` and
 * `eslint.ignoreDuringBuilds` to true because an agent-authored Zylo container
 * must never fail to boot over a type error. This is a public documentation
 * site publishing an API contract, so the opposite is correct: a broken build
 * should stop the deploy. Both flags are therefore left at their defaults.
 *
 * Also intentionally omitted from the boilerplate:
 *   - `productionBrowserSourceMaps` — only needed for Designer Mode correlation
 *   - `images.unoptimized`          — containers lack sharp; Vercel does not
 *   - CSP `frame-ancestors *`       — that opens the editor preview iframe;
 *                                     public docs should not be embeddable
 */

/**
 * Pages that have moved.
 *
 * Note what is NOT here: any path that is now a real generated folder. The
 * reference moved to `api-reference/{system}/{tag}/{operationId}`, so
 * `/api-reference/offices/integrations` is a live tag folder, not a stale page,
 * and redirecting it would shadow 13 real operations. AUTHORING.md says docs URLs are permanent, so a page
 * that moves keeps its old address working rather than 404ing.
 *
 * These all point at the generated reference, which replaced the hand written
 * offices pages when the OpenAPI spec landed.
 */
const movedPages = [
  // Integrations became a folder: the two standalone pages moved under it and a
  // third joined them. Both old addresses stay live.
  ['/docs/tools-and-secrets', '/docs/integrations'],
  ['/docs/creating-integrations', '/docs/integrations/creating'],
  [
    '/docs/api-reference/tenant-libraries',
    '/docs/api-reference/offices/tenant-libraries/listGlobalIntegrations',
  ],
  ['/docs/api-reference/offices/create-an-office', '/docs/api-reference/offices/offices/createOffice'],
  ['/docs/api-reference/offices/list-offices', '/docs/api-reference/offices/offices/listOffices'],
  ['/docs/api-reference/offices/get-an-office', '/docs/api-reference/offices/offices/getOffice'],
  ['/docs/api-reference/offices/update-an-office', '/docs/api-reference/offices/offices/updateOffice'],
  ['/docs/api-reference/offices/delete-an-office', '/docs/api-reference/offices/offices/deleteOffice'],
  [
    '/docs/api-reference/offices/get-office-cloud-config',
    '/docs/api-reference/offices/offices/getOfficeCloudConfig',
  ],
  [
    '/docs/api-reference/offices/skills-and-protocols',
    '/docs/api-reference/offices/skills/listOfficeSkills',
  ],
  [
    '/docs/api-reference/offices/identity-and-secrets',
    '/docs/api-reference/offices/identity/listOfficeApiKeys',
  ],
];

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,

  async redirects() {
    return movedPages.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default withMDX(config);
