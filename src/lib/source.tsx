import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { statusBadgesPlugin } from 'fumadocs-core/source/status-badges';
import { MethodBadge } from '@/components/method-badge';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { openapiPlugin } from 'fumadocs-openapi/server';
import { apis } from './openapi';

/**
 * `pageSchema` is a Zod object, so it strips any frontmatter key it does not
 * declare. Endpoint pages carry `status: POST` for the sidebar method badge,
 * which would be silently dropped. Passing it through explicitly keeps the
 * validation `pageSchema` provides and adds the one field we need.
 */
const docsPageSchema = pageSchema.extend({
  status: pageSchema.shape.icon,
});

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: docsPageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

/**
 * One virtual page set per system, merged with the hand written MDX. Nothing is
 * written to `content/` — pages exist only at build time, so the spec stays the
 * single source of truth and there is no generated output to edit by mistake.
 *
 * `groupBy: 'tag'` turns each spec's tags into sidebar section headings. The
 * per-system folder comes from each server's own `baseDir` (see openapi.ts).
 */
const openapiPageSets = await Promise.all(
  apis.map(({ server, baseDir }) =>
    server.staticSource({
      baseDir,
      groupBy: 'tag',
      meta: { folderStyle: 'separator' },
    }),
  ),
);

const mdxPages = docs.toFumadocsSource();

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: {
    files: [...mdxPages.files, ...openapiPageSets.flatMap((set) => set.files)],
  },
  plugins: [
    lucideIconsPlugin(),
    // Endpoint pages carry `status: POST` (or GET, PATCH, DELETE) in frontmatter.
    // This renders it as a colour coded method badge in the sidebar.
    statusBadgesPlugin({
      renderBadge: (status) => <MethodBadge method={status} />,
    }),
    // ONE plugin, not one per server. `server.loaderPlugin()` appends a method
    // badge to every generated page, so registering it per system rendered the
    // badge once per system — three servers, three badges on every row. The
    // standalone plugin is server agnostic and does the job once.
    openapiPlugin(),
  ],
});

export function getPageImageUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'image.png'];

  return {
    segments,
    url: '/' + [page.locale, ...docsImageRoute.split('/'), ...segments].filter(Boolean).join('/'),
  };
}

export function getPageMarkdownUrl(page: (typeof source)['$inferPage']) {
  const segments = [...page.slugs, 'content.md'];

  return {
    segments,
    url: '/' + [page.locale, ...docsContentRoute.split('/'), ...segments].filter(Boolean).join('/'),
  };
}

export async function getLLMText(page: (typeof source)['$inferPage']) {
  // Only MDX pages carry `getText`. Generated OpenAPI pages have no markdown
  // source, so they contribute their title and description rather than a body.
  const data = page.data as { getText?: (mode: 'processed') => Promise<string> };
  const processed = data.getText ? await data.getText('processed') : (page.data.description ?? '');

  return `# ${page.data.title} (${page.url})

${processed}`;
}
