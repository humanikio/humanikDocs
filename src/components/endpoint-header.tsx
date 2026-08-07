import { cn } from '@/lib/cn';

/**
 * The method + path line that opens every endpoint page.
 *
 * Deliberately shows the path with the `/api/v1` prefix omitted, matching the
 * cURL examples which build the full URL from `$HOS_API`. Showing both would
 * invite someone to concatenate them.
 */
const METHOD_STYLES: Record<string, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  POST: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25',
  PUT: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
  PATCH: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
  DELETE: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/25',
};

const NEUTRAL = 'text-fd-muted-foreground bg-fd-muted border-fd-border';

export function EndpointHeader({
  method,
  path,
  permission,
}: {
  method: string;
  path: string;
  permission?: string;
}) {
  const key = method.toUpperCase();

  return (
    <div className="not-prose mb-8 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={cn(
            'rounded border px-2 py-1 font-mono text-xs font-semibold tracking-wide',
            METHOD_STYLES[key] ?? NEUTRAL,
          )}
        >
          {key}
        </span>
        <code className="font-mono text-sm text-fd-foreground">{path}</code>
      </div>
      {permission ? (
        <p className="text-xs text-fd-muted-foreground">
          Requires <code className="font-mono text-fd-foreground">{permission}</code>
        </p>
      ) : null}
    </div>
  );
}
