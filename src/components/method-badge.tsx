import { cn } from '@/lib/cn';

/**
 * HTTP method badge shown beside a page title in the sidebar.
 *
 * Driven by the `status` field in page frontmatter, via `statusBadgesPlugin` in
 * `src/lib/source.ts`. Set `status: POST` on an endpoint page and the badge
 * appears automatically.
 *
 * Colour carries meaning and is consistent with how the rest of the industry
 * codes methods: reads are green, creates are blue, updates are amber,
 * deletes are red. Anything unrecognised falls back to neutral rather than
 * being dropped, so a typo is visible instead of silent.
 */
const METHOD_STYLES: Record<string, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  POST: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25',
  PUT: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
  PATCH: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
  DELETE: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/25',
};

const NEUTRAL = 'text-fd-muted-foreground bg-fd-muted border-fd-border';

export function MethodBadge({ method }: { method: string }) {
  const key = method.toUpperCase();

  return (
    <span
      aria-label={`HTTP ${key}`}
      className={cn(
        'ms-auto shrink-0 rounded border px-1.5 py-0.5',
        'font-mono text-[10px] font-semibold leading-none tracking-wide',
        METHOD_STYLES[key] ?? NEUTRAL,
      )}
    >
      {key}
    </span>
  );
}
