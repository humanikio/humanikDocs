'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, PanelLeft } from 'lucide-react';
import { useNotebookLayout } from 'fumadocs-ui/layouts/notebook';
import { cn } from '@/lib/cn';
import { REFERENCE, SECTIONS, activeSectionUrl } from '@/components/section-nav';

/**
 * The docs header, modelled on platform.claude.com/docs (checked 2026-11-27).
 *
 * One full width row above the sidebar (the layout runs with `nav.mode: 'top'`):
 *
 *   logo + title │ section pills │ ...  search │ {} API reference │ Main site │ theme │ ⫶
 *
 * The same pieces as before, rearranged. What changed and why:
 * - The title moved from the sidebar into the header, so the header reads left to right as
 *   "where am I, which section, what can I do" instead of starting halfway across the page.
 * - Sections are pills with a filled active state, never wrapped. "Access Control (IAM)" used
 *   to break onto two lines.
 * - Between `md` and `xl` the pills do not fit next to search and the right-hand links, so they
 *   become one dropdown showing the current section.
 * - On phones the row is title, search and the menu button. Sections, the API reference and
 *   Main site are in the drawer (MobileSectionMenu).
 *
 * Search, the theme switch and the sidebar buttons are Fumadocs' own slots, taken from the
 * layout context, so their behaviour (⌘K, the drawer, collapse) is unchanged.
 */
export function DocsHeader() {
  const { slots } = useNotebookLayout();
  const pathname = usePathname();
  const activeUrl = activeSectionUrl(pathname);

  return (
    <header
      id="nd-subnav"
      className="sticky top-(--fd-docs-row-1) z-30 flex flex-col bg-fd-background/80 backdrop-blur-sm [grid-area:header] layout:[--fd-header-height:--spacing(14)]"
    >
      <div className="flex h-14 items-center gap-3 border-b px-4 md:px-6">
        {/* Title */}
        {slots.navTitle && (
          <slots.navTitle className="inline-flex shrink-0 items-center gap-2.5 font-semibold" />
        )}

        {/* Sections: pills from xl, one dropdown from md to xl, drawer below md */}
        <nav aria-label="Documentation sections" className="ms-4 hidden items-center gap-1 xl:flex">
          {SECTIONS.map((s) => (
            <SectionPill key={s.url} href={s.url} active={s.url === activeUrl}>
              {s.text}
            </SectionPill>
          ))}
        </nav>
        <SectionDropdown activeUrl={activeUrl} className="ms-2 hidden md:flex xl:hidden" />

        <div className="flex-1" />

        {/* Search: full field from md, icon below */}
        {slots.searchTrigger && (
          <slots.searchTrigger.full hideIfDisabled className="hidden w-56 rounded-xl ps-2.5 md:flex lg:w-64" />
        )}

        <Link
          href={REFERENCE.url}
          data-active={REFERENCE.url === activeUrl}
          className={cn(
            'hidden h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-sm text-fd-muted-foreground transition-colors md:inline-flex',
            'hover:text-fd-accent-foreground',
            'data-[active=true]:bg-fd-accent data-[active=true]:font-medium data-[active=true]:text-fd-foreground',
          )}
        >
          <span aria-hidden className="font-mono text-xs opacity-70">
            {'{}'}
          </span>
          {REFERENCE.text}
        </Link>

        {/* A filled pill: the one action in the header rather than another page to read, the
            same weight platform.claude.com gives "Console". Sized to huma.solidButton. */}
        <Link
          href="https://www.humanik.io"
          target="_blank"
          rel="noreferrer"
          className="hidden h-9 shrink-0 items-center whitespace-nowrap rounded-full bg-fd-primary px-4 text-[13px] font-medium text-fd-primary-foreground transition-opacity hover:opacity-90 md:inline-flex"
        >
          Main site
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {slots.themeSwitch && <slots.themeSwitch />}
          {slots.sidebar && (
            <slots.sidebar.collapseTrigger
              className="inline-flex size-8 items-center justify-center rounded-full bg-fd-secondary text-fd-muted-foreground hover:bg-fd-accent"
              aria-label="Collapse sidebar"
            >
              <PanelLeft className="size-4" />
            </slots.sidebar.collapseTrigger>
          )}
        </div>

        {/* Phones: search icon and the drawer button */}
        <div className="flex items-center md:hidden">
          {slots.searchTrigger && <slots.searchTrigger.sm hideIfDisabled className="p-2" />}
          {slots.sidebar && (
            <slots.sidebar.trigger
              className="-me-1.5 inline-flex size-9 items-center justify-center rounded-md text-fd-muted-foreground hover:bg-fd-accent"
              aria-label="Open navigation"
            >
              <PanelLeft className="size-4.5" />
            </slots.sidebar.trigger>
          )}
        </div>
      </div>
    </header>
  );
}

function SectionPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      data-active={active}
      className={cn(
        'inline-flex h-8 items-center whitespace-nowrap rounded-full px-3 text-sm text-fd-muted-foreground transition-colors',
        'hover:text-fd-accent-foreground',
        'data-[active=true]:bg-fd-accent data-[active=true]:font-medium data-[active=true]:text-fd-foreground',
      )}
    >
      {children}
    </Link>
  );
}

/** The sections as one control, for widths where the pills do not fit. */
function SectionDropdown({ activeUrl, className }: { activeUrl?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const current = SECTIONS.find((s) => s.url === activeUrl);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-fd-accent px-3 text-sm font-medium text-fd-foreground"
      >
        {current?.text ?? 'Sections'}
        <ChevronDown className={cn('size-3.5 opacity-70 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute start-0 top-full z-50 mt-2 flex min-w-56 flex-col rounded-xl border bg-fd-popover p-1 shadow-lg"
        >
          {SECTIONS.map((s) => (
            <Link
              key={s.url}
              href={s.url}
              role="menuitem"
              data-active={s.url === activeUrl}
              className={cn(
                'rounded-lg px-3 py-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground',
                'data-[active=true]:font-medium data-[active=true]:text-fd-foreground',
              )}
            >
              {s.text}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
