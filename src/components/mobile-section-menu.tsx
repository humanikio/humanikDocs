'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { REFERENCE, SECTIONS, activeSectionUrl } from '@/components/section-nav';

/**
 * Section switching at the top of the phone drawer (rewritten 2026-11-27, modelled on
 * platform.claude.com/docs).
 *
 * Below `md` the header is only the title, search and the menu button (DocsHeader), so this is
 * where a phone reader changes section. The current section is one row with a chevron; tapping it
 * opens every section, the API reference and Main site as a list in place, above the page tree.
 * Picking a section closes the list and shows that section's pages.
 *
 * The earlier version covered the whole drawer with a second screen and a back arrow. In place is
 * one tap shorter and keeps the reader's place in the tree visible.
 *
 * Rendered as the sidebar `banner` and hidden from `md` up, where the header does this job.
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
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-sections"
        className="flex w-full items-center gap-2 rounded-xl border bg-fd-card px-3 py-2.5 text-start text-sm font-medium text-fd-foreground"
      >
        <span className="flex-1 truncate">{current.text}</span>
        <span className="text-xs font-normal text-fd-muted-foreground">Sections</span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-fd-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <nav
          id="mobile-sections"
          aria-label="Documentation sections"
          className="mt-1.5 flex flex-col gap-0.5 rounded-xl border bg-fd-card p-1.5"
        >
          {ALL.map((s) => {
            const active = s.url === activeUrl;
            return (
              <Link
                key={s.url}
                href={s.url}
                onClick={() => setOpen(false)}
                data-active={active}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-[0.9375rem] transition-colors',
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
                {active && <Check className="size-4" aria-hidden />}
              </Link>
            );
          })}
          <div className="my-1 h-px bg-fd-border" aria-hidden />
          <Link
            href="https://www.humanik.io"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[0.9375rem] text-fd-muted-foreground hover:bg-fd-accent/50 hover:text-fd-accent-foreground"
          >
            Main site
            <ArrowUpRight className="size-4 opacity-60" aria-hidden />
          </Link>
        </nav>
      )}
    </div>
  );
}
