import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
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
        children: <SectionNav />,
      },
      {
        text: 'Main site',
        url: 'https://www.humanik.io',
        external: true,
        secondary: true,
      },
    ],
    // `githubUrl` is intentionally unset. The docs repo does not exist yet, and
    // linking to a 404 is worse than showing no link. Restore it once
    // `gitConfig` in ./shared.ts points at a real repository.
  };
}
