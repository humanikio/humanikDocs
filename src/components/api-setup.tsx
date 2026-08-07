import { apiConfig } from '@/lib/shared';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

/**
 * The two exports every cURL example in these docs assumes.
 *
 * Rendered from `apiConfig` rather than written into each page, because the
 * host is moving from its Render URL to a subdomain. A literal repeated across
 * four guide pages is four places to miss.
 *
 * Usage in MDX: `<ApiSetup />`
 */
export function ApiSetup({ keyPlaceholder = 'hsk_4f8a....hss_...' }: { keyPlaceholder?: string }) {
  const code = [`export HOS_API="${apiConfig.production}"`, `export HOS_KEY="${keyPlaceholder}"`].join(
    '\n',
  );

  return <DynamicCodeBlock lang="bash" code={code} />;
}
