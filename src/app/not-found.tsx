import Link from 'next/link';
import { docsRoute } from '@/lib/shared';

/**
 * Replaces Next's built-in 404, which renders an inline style and script and so
 * trips React's "encountered a script tag while rendering" warning on a client
 * side navigation. A branded page avoids that and is a better dead end.
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <p className="font-mono text-sm text-fd-muted-foreground">404</p>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">This page does not exist</h1>
        <p className="max-w-md text-fd-muted-foreground">
          It may have moved. The API reference is generated from the OpenAPI spec, so endpoint
          pages are named after their operation.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={docsRoute}
          className="rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
        >
          Documentation
        </Link>
        <Link
          href={`${docsRoute}/api-reference`}
          className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          API reference
        </Link>
      </div>
    </main>
  );
}
