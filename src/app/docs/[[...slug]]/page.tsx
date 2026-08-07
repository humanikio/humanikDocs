import { getPageImageUrl, getPageMarkdownUrl, source } from '@/lib/source';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/components/mdx';
import type { Metadata } from 'next';
import type { TOCItemType } from 'fumadocs-core/toc';
import type { OpenAPIPageData } from 'fumadocs-openapi/server';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { APIPage } from '@/components/api-page';
import { gitConfig } from '@/lib/shared';

type AnyPage = NonNullable<ReturnType<typeof source.getPage>>;

/**
 * The page tree mixes two kinds of page: hand written MDX from `content/`, and
 * virtual pages generated from `openapi/*.yaml`. Merging the two sources widens
 * `page.data` to the base `PageData`, so the two have to be told apart at
 * runtime. `getOpenAPIPageProps` exists only on generated pages.
 */
function isOpenAPIPage(data: unknown): data is OpenAPIPageData {
  return typeof data === 'object' && data !== null && 'getOpenAPIPageProps' in data;
}

export default async function Page(props: PageProps<'/docs/[[...slug]]'>) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const data = page.data;

  if (isOpenAPIPage(data)) {
    return (
      <DocsPage toc={data.toc} full>
        <DocsTitle>{data.title}</DocsTitle>
        {/* No DocsDescription here: operation descriptions are markdown, and
            the generated layout renders them processed. See api-page.tsx. */}
        <DocsBody>
          <APIPage {...data.getOpenAPIPageProps()} />
        </DocsBody>
      </DocsPage>
    );
  }

  // Both page kinds carry these; only the merged static type has lost them.
  const toc = ('toc' in data ? data.toc : undefined) as TOCItemType[] | undefined;
  const full = 'full' in data ? Boolean(data.full) : false;

  return (
    <DocsPage toc={toc} full={full}>
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription className="mb-0">{data.description}</DocsDescription>
      <MdxContent page={page} />
    </DocsPage>
  );
}

function MdxContent({ page }: { page: AnyPage }) {
  if (!('body' in page.data)) return null;

  const MDX = page.data.body as React.ComponentType<{ components?: object }>;
  const markdownUrl = getPageMarkdownUrl(page).url;

  return (
    <>
      <div className="flex flex-row gap-2 items-center border-b pb-6">
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover
          markdownUrl={markdownUrl}
          githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${page.path}`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps<'/docs/[[...slug]]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImageUrl(page).url,
    },
  };
}
