import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { MobileSectionMenu } from '@/components/mobile-section-menu';

// The `notebook` layout puts a persistent full width header above the sidebar,
// which is what lets the header own section switching. The default `docs`
// layout folds the nav into the sidebar on desktop, leaving nowhere to put it.
export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      // The header switches sections, so the sidebar's own tab dropdown would be
      // a second control doing the same job.
      // On phones the drawer switches sections with MobileSectionMenu instead.
      sidebar={{ tabs: false, banner: <MobileSectionMenu key="section-menu" /> }}
    >
      {children}
    </DocsLayout>
  );
}
