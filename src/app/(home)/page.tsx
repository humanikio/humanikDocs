import { redirect } from 'next/navigation';
import { docsRoute } from '@/lib/shared';

// docs.humanik.io serves documentation and nothing else, so the root is not a
// landing page. Marketing lives on the main site.
export default function HomePage() {
  redirect(docsRoute);
}
