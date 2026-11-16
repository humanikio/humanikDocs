import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import Link from 'next/link';
import { appName } from './shared';
import { SectionNav } from '@/components/section-nav';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            src="/logo.png"
            alt=""
            width={26}
            height={26}
            priority
            className="size-[26px] object-contain"
          />
          <span className="font-semibold">{appName} Docs</span>
        </>
      ),
      url: '/docs',
    },
    links: [
      // The section switcher. Rendered as `custom` so it can own its own active
      // state — see the note in section-nav.tsx.
      {
        type: 'custom',
        // Header only. In the phone drawer this row did not fit, so the drawer
        // gets MobileSectionMenu (the sidebar banner in docs/layout.tsx) instead.
        on: 'nav',
        children: <SectionNav />,
      },
      // A filled pill, not a muted text link — the one place in the header that
      // should read as an action rather than another page to read, the same
      // weight platform.claude.com gives "Console" next to its own API reference.
      {
        type: 'custom',
        on: 'nav',
        children: (
          <Link
            href="https://www.humanik.io"
            target="_blank"
            rel="noreferrer"
            className="ms-1 inline-flex items-center rounded-full bg-fd-primary px-4 py-1.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Main site
          </Link>
        ),
      },
    ],
    // `githubUrl` is intentionally unset. The docs repo does not exist yet, and
    // linking to a 404 is worse than showing no link. Restore it once
    // `gitConfig` in ./shared.ts points at a real repository.
  };
}
