import { source } from '@/lib/source';
import { llms } from 'fumadocs-core/source';
import accessControlMeta from '../../../content/docs/access-control/meta.json';
import devicesMeta from '../../../content/docs/devices/meta.json';
import apiReferenceMeta from '../../../content/docs/api-reference/meta.json';

export const revalidate = false;

/**
 * The docs index, read by people's AI tools and by Nova (hos-api `src/lib/docs`).
 *
 * `llms(source).index()` only walks the main sidebar tree. Access control, Devices
 * and the API reference are separate sidebar roots, so they were missing from this
 * file until 2026-10-14. They are appended here in their own meta.json order.
 *
 * The API reference lists one page per system, not the ~400 generated endpoint
 * pages: endpoint pages have no markdown body, and each system page links them.
 */

type Page = ReturnType<typeof source.getPages>[number];

const OVERVIEW = `> The public documentation for HumanikOS, the operating system for AI employees.
> In Humanik an AI employee is called a huma (plural humi). An office is the computer a huma
> works in. Some pages still say "employee" for a huma.

What is in these docs:
- First steps: what HumanikOS is, a first API request, and API keys.
- Building with HumanikOS: Nova, offices, HumaChat, frameworks and models, skills, contacts,
  phone, calendars, the bulletin, data (namespaces, tables, files), workflows, notifications,
  delegation, integrations, Humanik Cloud, and billing and budgets.
- Platform behaviour: the response format, errors, pagination and rate limits.
- Access control: roles, permissions, workspaces, service accounts and how Nova acts for you.
- Devices: connecting a computer you own so work can run on it.
- API reference: one page per system, each with its permissions and its endpoints.

Every page is also available as markdown at /llms.mdx/docs/<path>/content.md.`;

function line(page: Page, indent = ''): string {
  const description = page.data.description?.trim();
  const link = `[${page.data.title}](${page.url})`;
  return description ? `${indent}- ${link}: ${description}` : `${indent}- ${link}`;
}

function section(dir: string, meta: { title?: string; description?: string; pages?: string[] }): string {
  const pages = source.getPages().filter((p) => p.slugs[0] === dir);
  const bySlug = new Map(pages.map((p) => [p.slugs.slice(1).join('/') || 'index', p]));
  const out = [`\n- **${meta.title ?? dir}**`];

  for (const name of meta.pages ?? []) {
    const separator = /^---(.*)---$/.exec(name);
    if (separator) {
      out.push(`  - ${separator[1]}`);
      continue;
    }
    // A folder entry (an API system) is listed by its own index page.
    const page = bySlug.get(name) ?? bySlug.get(`${name}/index`) ?? bySlug.get(name.replace(/\/index$/, ''));
    if (page) out.push(line(page, separatorOpen(out) ? '    ' : '  '));
  }
  return out.join('\n');
}

// Pages under a separator heading are indented one level further.
function separatorOpen(out: string[]): boolean {
  for (let i = out.length - 1; i >= 1; i--) {
    if (out[i].startsWith('  - ') && !out[i].includes('](')) return true;
  }
  return false;
}

export function GET() {
  const main = llms(source).index();
  const [title, ...rest] = main.split('\n');
  const body = [
    title,
    '',
    OVERVIEW,
    rest.join('\n'),
    section('access-control', accessControlMeta),
    section('devices', devicesMeta),
    section('api-reference', apiReferenceMeta),
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
