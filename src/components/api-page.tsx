'use client';
import { createOpenAPIPage } from 'fumadocs-openapi/ui';
import { createCodeUsageGeneratorRegistry } from 'fumadocs-openapi/requests/generators';
import { curl } from 'fumadocs-openapi/requests/generators/curl';
import { cn } from '@/lib/cn';

/**
 * Renders one operation from the OpenAPI spec: the method and path header, the
 * parameter and body tables, the response schemas, and the code sample panel.
 *
 * **cURL only, deliberately.** A cURL snippet documents the wire contract; an
 * SDK snippet documents the client library. Until an SDK exists there is nothing
 * for a JavaScript or Python sample to be generated *from*, and a hand-shaped
 * one would be a second source of truth that drifts.
 *
 * Adding a language later is one import and one `.add()`. The generators ship
 * with the package:
 *
 *   import { javascript } from 'fumadocs-openapi/requests/generators/javascript';
 *   registry.add('javascript', javascript);
 *
 * Available: curl, javascript, python, go, java, csharp, rust. Or call
 * `registerDefault(registry)` from `fumadocs-openapi/requests/generators/all`
 * to enable every one at once.
 */
const codeUsages = createCodeUsageGeneratorRegistry();
codeUsages.add('curl', curl);

const METHOD_STYLES: Record<string, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
  POST: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/25',
  PUT: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
  PATCH: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25',
  DELETE: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/25',
};

/**
 * Names the sample panel, so it reads as "this is the request you are looking
 * at" rather than an unlabelled code block. Same method colours as the sidebar,
 * so the two agree at a glance.
 */
function ExampleHeader({ method, title }: { method: string; title: string }) {
  const key = method.toUpperCase();

  return (
    <div className="flex items-center gap-2.5 rounded-t-xl border border-b-0 bg-fd-card px-3 py-2.5">
      <span
        aria-label={`HTTP ${key}`}
        className={cn(
          'shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none tracking-wide',
          METHOD_STYLES[key] ?? 'text-fd-muted-foreground bg-fd-muted border-fd-border',
        )}
      >
        {key}
      </span>
      <span className="truncate text-sm font-medium text-fd-foreground">{title}</span>
    </div>
  );
}

export const APIPage = createOpenAPIPage({
  codeUsages,
  // Show the full response schema rather than only an example plus generated
  // TypeScript. An integrator reading a reference wants the field list.
  showResponseSchema: true,

  content: {
    /**
     * Two column layout: prose and schemas on the left, the request sample
     * pinned on the right.
     *
     * The default stacks everything in one column, which puts the cURL sample
     * below the full response schema — the thing most readers came for ends up
     * furthest from the top. Splitting it out also keeps the sample in view
     * while scrolling the parameter tables, which is the point of the layout.
     *
     * `slots.description` is rendered here rather than through the page's
     * `DocsDescription`. Operation descriptions contain markdown, and
     * `DocsDescription` prints it raw — literal `**` and backticks on screen.
     * This slot processes it. The page skips `DocsDescription` for OpenAPI
     * pages so it is not printed twice.
     */
    renderOperationLayout: (slots, { operation, method }) => (
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {slots.header}
          {slots.description}
          {slots.authSchemes}
          {slots.parameters}
          {slots.body}
          {slots.responses}
          {slots.callbacks}
        </div>

        <div className="w-full shrink-0 xl:w-[440px]">
          <div className="flex flex-col gap-4 xl:sticky xl:top-24">
            <div className="flex flex-col">
              <ExampleHeader method={method} title={operation.summary ?? 'Request'} />
              <div className="[&>*:first-child]:rounded-t-none">{slots.apiExample}</div>
            </div>
            {slots.apiPlayground}
          </div>
        </div>
      </div>
    ),
  },
});
