/**
 * The documentation sections, shared by DocsHeader (pills and the md to xl dropdown) and
 * MobileSectionMenu (the phone drawer). The row itself moved into docs-header.tsx on 2026-11-27.
 *
 * **These are product areas, not document types.** "Get started" used to sit
 * here, which made it a peer of "API reference" when it is really the first
 * group *inside* the platform section. Renaming it to the product name puts all
 * four on the same footing, and the reading order is: what it is, who may do
 * what, your own hardware.
 *
 * The API reference is deliberately not in this list — it is rendered apart, on
 * the right, because it is a different kind of document rather than another
 * product area.
 *
 * Active state cannot use Fumadocs' `active: 'nested-url'`, because that cannot
 * express "active for /docs except when a more specific section matches" and
 * would leave HumanikOS lit while you read the API reference. Matching
 * therefore runs longest-URL-first, independently of display order.
 */
export const SECTIONS = [
  { text: 'HumanikOS', url: '/docs' },
  { text: 'Access Control (IAM)', url: '/docs/access-control' },
  { text: 'Devices', url: '/docs/devices' },
];

export const REFERENCE = { text: 'API reference', url: '/docs/api-reference' };

const BY_SPECIFICITY = [...SECTIONS, REFERENCE].sort((a, b) => b.url.length - a.url.length);

/** The section the reader is in: the most specific URL that prefixes the path. */
export function activeSectionUrl(pathname: string) {
  return BY_SPECIFICITY.find((s) => pathname.startsWith(s.url))?.url;
}
