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
const SECTIONS = [
  { text: 'HumanikOS', url: '/docs' },
  { text: 'Access control', url: '/docs/access-control' },
  { text: 'Devices', url: '/docs/devices' },
];

const REFERENCE = { text: 'API reference', url: '/docs/api-reference' };

const BY_SPECIFICITY = [...SECTIONS, REFERENCE].sort((a, b) => b.url.length - a.url.length);

export function SectionNav() {
  const pathname = usePathname();
  const activeUrl = BY_SPECIFICITY.find((s) => pathname.startsWith(s.url))?.url;

  return (
    <nav className="flex flex-row items-center gap-1">
      {SECTIONS.map((section) => (
        <Link
          key={section.url}
          href={section.url}
          data-active={section.url === activeUrl}
          className={cn(
            'rounded-md px-2.5 py-1.5 text-sm transition-colors',
            'text-fd-muted-foreground hover:text-fd-accent-foreground hover:bg-fd-accent/50',
            'data-[active=true]:text-fd-primary data-[active=true]:font-medium',
          )}
        >
          {section.text}
        </Link>
      ))}

      {/* Rendered apart, with a bracket marker, because it is a different kind
          of document rather than another product area. */}
      <Link
        href={REFERENCE.url}
        data-active={REFERENCE.url === activeUrl}
        className={cn(
          'ms-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors',
          'text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground',
          'data-[active=true]:border-fd-primary/30 data-[active=true]:bg-fd-primary/10',
          'data-[active=true]:font-medium data-[active=true]:text-fd-primary',
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
