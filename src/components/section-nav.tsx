'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

/**
 * Header level section switcher.
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

export function SectionNav() {
  const pathname = usePathname();
  const activeUrl = activeSectionUrl(pathname);

  return (
    <nav className="flex flex-row items-center gap-5">
      <div className="flex flex-row items-center gap-5">
        {SECTIONS.map((section) => (
          <Link
            key={section.url}
            href={section.url}
            data-active={section.url === activeUrl}
            className={cn(
              'text-sm text-fd-muted-foreground transition-colors hover:text-fd-accent-foreground',
              'data-[active=true]:font-medium data-[active=true]:text-fd-foreground',
            )}
          >
            {section.text}
          </Link>
        ))}
      </div>

      {/* A thin rule, not a box: the API reference sits apart as its own kind of
          document, the same way platform.claude.com sets "API reference" off
          from its product nav with space and a divider rather than a border. */}
      <span aria-hidden className="h-4 w-px bg-fd-border" />

      <Link
        href={REFERENCE.url}
        data-active={REFERENCE.url === activeUrl}
        className={cn(
          'inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground transition-colors',
          'hover:text-fd-accent-foreground',
          'data-[active=true]:font-medium data-[active=true]:text-fd-foreground',
        )}
      >
        <span aria-hidden className="font-mono text-xs opacity-70">
          {'{}'}
        </span>
        {REFERENCE.text}
      </Link>
    </nav>
  );
}
