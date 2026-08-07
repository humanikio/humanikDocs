# humanik-docs

Public documentation for HumanikOS. Deploys to **docs.humanik.io**.

Built on [Fumadocs](https://fumadocs.dev) — Next.js App Router with MDX.

```bash
pnpm install
pnpm dev            # http://localhost:3005
pnpm build
```

Port 3005 avoids clashing with other apps in this workspace.

## Stack

Next 16 · React 19 · TypeScript 6 · Tailwind v4 · Fumadocs 16
(`fumadocs-ui` resolves to `@fumadocs/base-ui`).

## Where things live

| Path | What it is |
| --- | --- |
| `content/docs/**/*.mdx` | Hand-written guides. Order comes from each `meta.json`. |
| `openapi/*.yaml` | The API reference. **Generated into pages at build time** — nothing is written to `content/`. |
| `src/lib/openapi.ts` | One OpenAPI server per system. Add a system here. |
| `src/lib/source.ts` | Content source: merges the MDX and the generated pages. |
| `src/lib/shared.ts` | App name, site URL, and the API base URL. |
| `src/components/api-page.tsx` | How an operation renders: two columns, sample panel on the right. |
| `src/app/api/search/route.ts` | Search. Local, no external service. |
| `scripts/` | The three checks below. |

## Guides are written. Reference is generated.

Anything under `/docs/api-reference` comes from `openapi/*.yaml`. To change an
endpoint's documentation, edit the spec, not a page. Everything else is MDX.

Adding a system: drop its spec in `openapi/`, add one line to `apis` in
`src/lib/openapi.ts`, and add its folder to
`content/docs/api-reference/meta.json`.

## Checks

```bash
pnpm spec:check     # specs parse, $refs resolve, operationIds unique
pnpm ids:check      # every identifier has a description or a lookup
pnpm links:check    # every internal link and anchor resolves (needs the site running)
pnpm type-check
pnpm lint
```

`links:check` expects a running server:

```bash
pnpm start &
pnpm links:check
```

All three run clean on `main`. `spec:check` and `ids:check` need no server and
are worth running before every commit.

## Configuration

The API base URL the docs quote comes from one environment variable, so moving
the host is a one-line change rather than an edit across every spec and page:

```bash
cp .env.example .env
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_HOS_API_URL` | Base URL shown in the reference, the playground, and every cURL sample |
| `NEXT_PUBLIC_HOS_API_URL_LOCAL` | Optional second server in the playground's picker |

Specs carry no host of their own. `servers` is injected at load time in
`src/lib/openapi.ts`.

## Notes for contributors

- **Components used in MDX must be registered** in `src/components/mdx.tsx`, or
  the build fails at prerender. Available without import: `Callout`, `Cards`,
  `Card`, `Steps`, `Step`, `Tabs`, `Tab`, `Accordions`, `Accordion`,
  `EndpointHeader`, `ApiSetup`.
- **Code samples are cURL only.** The generator supports more languages; they go
  in when there is an SDK to generate them from.
- **URLs are permanent.** Reference URLs derive from a spec's `tag` and
  `operationId`, so renaming either moves pages. Add a redirect in
  `next.config.mjs` if you must.
- **The build is strict.** Type and lint errors fail it, deliberately.
