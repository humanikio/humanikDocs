import { AppWindow, Terminal } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * The install figures for Devices: the OS marks and the two programs, drawn the way
 * the console's Resources → Devices → Install tab draws them, so a reader moving
 * between the two sees the same thing.
 *
 * KEEP IN STEP with hos-frontend src/app/(dashboard)/devices/components/installPlatforms.tsx
 * (OsMark, OS_LABEL) and InstallTab.tsx (OS_SUB). The marks are copied, not shared:
 * the docs are a separate public repo.
 *
 * Facts (what installs where, which systems get the app) come from the humanikd
 * README and docs/public/desktop-app.md.
 */

export type OsId = 'macos' | 'windows' | 'linux';

const OS_LABEL: Record<OsId, string> = { macos: 'macOS', windows: 'Windows', linux: 'Linux' };
const OS_SUB: Record<OsId, string> = {
  macos: 'Apple silicon and Intel',
  windows: 'Windows 10 and 11, x64',
  linux: 'x86_64 and ARM64',
};
const OS_GETS: Record<OsId, string> = {
  macos: 'humanikd and the Humanik OS app',
  windows: 'humanikd and the Humanik OS app',
  linux: 'humanikd only. There is no Linux app',
};

/** Small monochrome marks in currentColor, the same paths as the console's. */
export function OsMark({ os, className }: { os: OsId; className?: string }) {
  if (os === 'macos') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
        <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.72-1.35-.14-2.65.8-3.33.8-.7 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.1 8.79.74 1.06 1.61 2.25 2.75 2.2 1.11-.04 1.52-.71 2.86-.71 1.33 0 1.71.71 2.87.69 1.19-.02 1.94-1.07 2.66-2.14.84-1.23 1.19-2.42 1.2-2.48-.03-.01-2.3-.88-2.32-3.55ZM14.2 6.13c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.55 1.31-.56.64-1.05 1.68-.92 2.67.97.08 1.96-.49 2.57-1.21Z" />
      </svg>
    );
  }
  if (os === 'windows') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
        <path d="M3 5.5 10.5 4.4v7.1H3V5.5Zm0 13 7.5 1.1v-7.1H3v6Zm8.5 1.25L21 21v-8.5h-9.5v7.25Zm0-15.5v7.25H21V3l-9.5 1.25Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path
        fillRule="evenodd"
        d="M12 2c-2.2 0-3.6 1.8-3.6 4.2 0 1.1.2 1.9-.5 3.1C6.6 11.4 5 13.6 5 16.3c0 1 .2 1.9.6 2.6L4.2 20c-.4.4-.1 1 .4 1h3.6c.6.6 2 1 3.8 1s3.2-.4 3.8-1h3.6c.5 0 .8-.6.4-1l-1.4-1.1c.4-.7.6-1.6.6-2.6 0-2.7-1.6-4.9-2.9-7-.7-1.2-.5-2-.5-3.1C15.6 3.8 14.2 2 12 2Zm0 9c-1.9 0-3.4 2.2-3.4 4.9 0 2.2 1.5 3.4 3.4 3.4s3.4-1.2 3.4-3.4C15.4 13.2 13.9 11 12 11Zm-1.3-6.2a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Zm2.6 0a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z"
      />
    </svg>
  );
}

/** The three systems, each with what the install command puts on it. */
export function Platforms() {
  return (
    <div className="not-prose my-6 grid gap-2.5 sm:grid-cols-3" role="list" aria-label="Supported systems">
      {(['macos', 'windows', 'linux'] as OsId[]).map((os) => (
        <div key={os} role="listitem" className="flex items-start gap-3 rounded-2xl border border-fd-border bg-fd-card px-4 py-4">
          <OsMark os={os} className="mt-0.5 h-7 w-7 shrink-0 text-fd-foreground" />
          <div className="min-w-0">
            <p className="text-[15px] font-medium text-fd-foreground">{OS_LABEL[os]}</p>
            <p className="text-xs text-fd-muted-foreground">{OS_SUB[os]}</p>
            <p className="mt-2 text-xs text-fd-muted-foreground">Gets {OS_GETS[os]}.</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Program({ icon, name, kind, children, href }: { icon: ReactNode; name: string; kind: string; children: ReactNode; href: string }) {
  return (
    <a href={href} className="flex flex-col gap-2 rounded-2xl border border-fd-border bg-fd-card px-5 py-5 no-underline transition-colors hover:bg-fd-accent">
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fd-muted text-fd-foreground">{icon}</span>
        <span className="min-w-0">
          <span className="block font-mono text-[15px] font-medium text-fd-foreground">{name}</span>
          <span className="block text-xs text-fd-muted-foreground">{kind}</span>
        </span>
      </span>
      <span className="text-sm text-fd-muted-foreground">{children}</span>
    </a>
  );
}

/** humanikd and the app, side by side: what each one is. */
export function TwoPrograms() {
  return (
    <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      <Program icon={<Terminal className="h-5 w-5" />} name="humanikd" kind="The program that does the work · macOS, Windows, Linux" href="/docs/devices/humanikd">
        Runs in the background on your computer. It connects out to HumanikOS, receives jobs, and runs them here with Ollama,
        Claude Code or OpenClaw. You drive it from a terminal.
      </Program>
      <Program icon={<AppWindow className="h-5 w-5" />} name="Humanik OS" kind="The desktop app · macOS and Windows" href="/docs/devices/desktop-app">
        A window on top of humanikd: chats with your employees, this machine&apos;s status, settings and log, updates, and
        notifications. Optional. humanikd runs the same without it.
      </Program>
    </div>
  );
}
