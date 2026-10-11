'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { REFERENCE, SECTIONS, activeSectionUrl } from '@/components/section-nav';

/**
 * Section switching inside the phone drawer, modelled on Anthropic's docs
 * (platform.claude.com/docs at phone width, checked 2026-10-10).
 *
 * The header's SectionNav is a horizontal row, which does not fit the drawer:
 * the sections wrapped and ran off the edge. So on phones the drawer shows the
 * current section as one row with a back arrow. Tapping it covers the page tree
 * with every section as a vertical list with chevrons; picking one opens it.
 *
 * Rendered as the sidebar `banner` and hidden from lg up, where the header row
 * does this job. The overlay is positioned against the drawer, which is
 * `position: fixed`.
 */
const ALL = [...SECTIONS, REFERENCE];

export function MobileSectionMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeUrl = activeSectionUrl(pathname);
  const current = ALL.find((s) => s.url === activeUrl) ?? SECTIONS[0];

  // Close the list after navigating, so the new section's pages show.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${current.text}, back to all sections`}
        className="flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-start text-sm font-medium text-fd-foreground hover:bg-fd-accent/50"
      >
        <ChevronLeft className="size-4 shrink-0 text-fd-muted-foreground" aria-hidden />
        <span className="flex-1 truncate">{current.text}</span>
        <span className="text-xs font-normal text-fd-muted-foreground">All sections</span>
      </button>

      {open && (
        <div className="absolute inset-0 z-50 flex flex-col bg-fd-background">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Back to this section's pages"
              className="inline-flex size-8 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent/50"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <p className="text-sm font-medium text-fd-foreground">All sections</p>
          </div>
          <nav className="flex flex-col gap-0.5 overflow-y-auto p-3" aria-label="Documentation sections">
            {ALL.map((s) => {
              const active = s.url === activeUrl;
              return (
                <Link
                  key={s.url}
                  href={s.url}
                  onClick={() => setOpen(false)}
                  data-active={active}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-3 text-[0.9375rem] transition-colors',
                    'text-fd-muted-foreground hover:bg-fd-accent/50 hover:text-fd-accent-foreground',
                    'data-[active=true]:bg-fd-accent data-[active=true]:font-medium data-[active=true]:text-fd-foreground',
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    {s.url === REFERENCE.url && (
                      <span aria-hidden className="font-mono text-xs opacity-70">
                        {'{}'}
                      </span>
                    )}
                    {s.text}
                  </span>
                  <ChevronRight className="size-4 opacity-60" aria-hidden />
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
