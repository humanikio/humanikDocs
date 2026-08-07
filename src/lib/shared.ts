export const appName = 'HumanikOS';
export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

export const siteUrl = 'https://docs.humanik.io';

export const gitConfig = {
  user: 'humanikio',
  repo: 'humanik-docs',
  branch: 'main',
};

/**
 * The one source for every base URL the docs quote.
 *
 * Set in `.env`, injected into the OpenAPI spec's `servers` at load time
 * (`src/lib/openapi.ts`), so the spec file itself carries no host. Change the
 * env var and the reference, the playground, and every generated cURL sample
 * all move together.
 *
 * The variable name matches the one `hos-frontend` uses, so the same value can
 * be set the same way across repos.
 *
 * The production default is the current host. It is moving to a subdomain,
 * which is the reason this is an env var rather than a literal: the move should
 * be one line in `.env`.
 *
 * The local default matches what the API listens on in development.
 */
const PRODUCTION_FALLBACK = 'https://hos-api-1.onrender.com/api/v1';
const LOCAL_FALLBACK = 'http://localhost:6070/api/v1';

export const apiConfig = {
  production: process.env.NEXT_PUBLIC_HOS_API_URL || PRODUCTION_FALLBACK,
  local: process.env.NEXT_PUBLIC_HOS_API_URL_LOCAL || LOCAL_FALLBACK,
  version: 'v1',
} as const;
