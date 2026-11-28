import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import { appName } from './shared';

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
    // The section switcher, the API reference link and the Main site pill are laid out by
    // DocsHeader (src/components/docs-header.tsx), which replaces the layout's header, and on
    // phones by MobileSectionMenu in the drawer. Nothing goes in `links`, or it would show
    // a second time in the drawer.
    links: [],
    // `githubUrl` is intentionally unset. The docs repo does not exist yet, and
    // linking to a 404 is worse than showing no link. Restore it once
    // `gitConfig` in ./shared.ts points at a real repository.
  };
}
