import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Figures for the HumaDocs (document signing) section.
 *
 * HTML rather than images, for the same reasons as diagrams.tsx: they follow the light and dark
 * toggle, reflow on a narrow screen, and their text is selectable and indexable.
 *
 * The visual grammar: each stage names who acts (the sender, the signer, HumanikOS, anyone), and
 * carries small tags for the protection that applies at that step. The tags are the argument the
 * page makes: every step that touches a person's data has one.
 *
 * Data lives beside each component rather than in MDX, so the two pages that use a figure
 * cannot drift apart.
 */

// ============================================================
// Primitives
// ============================================================

function Figure({ caption, label, children }: { caption?: string; label: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-8" role="group" aria-label={label}>
      {children}
      {caption ? (
        <figcaption className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

type Who = 'sender' | 'signer' | 'humanikos' | 'anyone';

const WHO_LABEL: Record<Who, string> = {
  sender: 'You, the sender',
  signer: 'The signer',
  humanikos: 'HumanikOS',
  anyone: 'Anyone with the file',
};

function Actor({ who }: { who: Who }) {
  const ours = who === 'humanikos';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider',
        ours ? 'text-fd-foreground' : 'text-fd-muted-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn('size-1.5 rounded-full', ours ? 'bg-fd-foreground' : 'border border-fd-muted-foreground/60')}
      />
      {WHO_LABEL[who]}
    </span>
  );
}

type Guard = 'access' | 'link' | 'turn' | 'consent' | 'encrypted' | 'checked' | 'audit' | 'seal' | 'fingerprint';

const GUARD_LABEL: Record<Guard, string> = {
  access: 'Permission checked',
  link: 'Secret link',
  turn: 'Order enforced',
  consent: 'Consent recorded',
  encrypted: 'Encrypted',
  checked: 'Checked again',
  audit: 'Audit record',
  seal: 'Digital seal',
  fingerprint: 'SHA-256 fingerprint',
};

function Tag({ guard }: { guard: Guard }) {
  return (
    <span className="inline-flex items-center rounded-full border border-fd-border bg-fd-background px-2 py-0.5 text-[10px] font-medium text-fd-foreground">
      {GUARD_LABEL[guard]}
    </span>
  );
}

function Wire({ label }: { label?: string }) {
  return (
    <div className="flex items-stretch gap-3 ps-[7px]" aria-hidden>
      <div className="w-px shrink-0 bg-fd-border" />
      <div className="py-1.5 text-[11px] leading-snug text-fd-muted-foreground">{label ?? ''}</div>
    </div>
  );
}

// ============================================================
// The lifecycle, with what protects each step
// ============================================================

interface Stage {
  who: Who;
  title: string;
  body: string;
  guards: Guard[];
  /** What travels from this stage to the next. */
  wire?: string;
}

const LIFECYCLE: Stage[] = [
  {
    who: 'sender',
    title: 'Prepare the document',
    body: 'A PDF, the roles who sign it, and the fields each role fills in. Only people with the right permission in the workspace can make, change or send it.',
    guards: ['access'],
    wire: 'one copy of the template, frozen for this document',
  },
  {
    who: 'humanikos',
    title: 'Send',
    body: 'Each person gets their own private link, by email, text message, or handed over by you. We keep only a fingerprint to look the link up, and the current link encrypted so you can copy it.',
    guards: ['link', 'audit'],
    wire: 'a private link, to one person',
  },
  {
    who: 'signer',
    title: 'Open the link',
    body: 'The link is checked: it must be the newest one for that person, the document must still be out, and in a signing order it must be their turn. Before filling anything in, they agree to sign electronically.',
    guards: ['turn', 'consent', 'audit'],
  },
  {
    who: 'signer',
    title: 'Fill in and sign',
    body: 'Only their own fields are shown. Every value and every signature image is encrypted the moment it is saved, and can only be read back as part of this one document.',
    guards: ['encrypted'],
    wire: 'Finish',
  },
  {
    who: 'humanikos',
    title: 'Check before accepting',
    body: 'The server checks every required field again. The page only helps a person see a problem first; the server decides. The time, address, browser and time zone are recorded.',
    guards: ['checked', 'audit'],
    wire: 'when the last person finishes',
  },
  {
    who: 'humanikos',
    title: 'Make the finished document',
    body: 'Values and signatures are drawn onto the PDF, audit pages are added, the digital seal is applied, and the SHA-256 fingerprint of the result is recorded. The file is stored encrypted.',
    guards: ['audit', 'seal', 'fingerprint', 'encrypted'],
    wire: 'a download link for each signer, never an attachment',
  },
  {
    who: 'anyone',
    title: 'Verify, at any time',
    body: 'Any PDF reader checks the seal offline. The verify page checks the fingerprint, without the file leaving the computer. Change one byte and both checks fail.',
    guards: ['seal', 'fingerprint'],
  },
];

export function SigningLifecycle() {
  return (
    <Figure
      label="How a document moves from prepared to signed, and what protects each step"
      caption="Each step names who acts. The tags are the protections that apply at that step. Encryption covers every value and signature a signer enters, and the finished file."
    >
      <ol className="space-y-0">
        {LIFECYCLE.map((s, i) => (
          <li key={s.title}>
            <div
              className={cn(
                'rounded-lg border p-3.5',
                s.who === 'humanikos' ? 'border-fd-foreground/25 bg-fd-card' : 'border-fd-border bg-fd-muted/40',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Actor who={s.who} />
                <span className="text-[10px] tabular-nums text-fd-muted-foreground">Step {i + 1}</span>
              </div>
              <p className="mt-1.5 text-sm font-medium text-fd-foreground">{s.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">{s.body}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {s.guards.map((g) => (
                  <Tag key={g} guard={g} />
                ))}
              </div>
            </div>
            {i < LIFECYCLE.length - 1 ? <Wire label={s.wire} /> : null}
          </li>
        ))}
      </ol>
    </Figure>
  );
}

// ============================================================
// How the seal is checked
// ============================================================

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-fd-border text-[10px] tabular-nums text-fd-muted-foreground">
        {n}
      </span>
      <span className="text-xs leading-relaxed text-fd-muted-foreground">{children}</span>
    </li>
  );
}

export function SealCheck() {
  return (
    <Figure
      label="How the digital seal is made by HumanikOS and checked by any PDF reader"
      caption="Only HumanikOS holds the private key, so only HumanikOS can make a seal. The public certificate travels inside the PDF, so anyone can check it without contacting us."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-fd-foreground/25 bg-fd-card p-3.5">
          <Actor who="humanikos" />
          <p className="mt-1.5 text-sm font-medium text-fd-foreground">Making the seal</p>
          <ol className="mt-2 space-y-2">
            <Step n={1}>Take the SHA-256 fingerprint of every byte of the finished PDF, except the space kept for the seal.</Step>
            <Step n={2}>Sign that fingerprint with the private key. The result is the seal.</Step>
            <Step n={3}>Put the seal and the public certificate into the PDF.</Step>
          </ol>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-muted/40 p-3.5">
          <Actor who="anyone" />
          <p className="mt-1.5 text-sm font-medium text-fd-foreground">Checking it, offline</p>
          <ol className="mt-2 space-y-2">
            <Step n={1}>The reader takes the fingerprint of the same bytes, itself.</Step>
            <Step n={2}>It uses the public certificate in the PDF to read the fingerprint inside the seal.</Step>
            <Step n={3}>The two match: unchanged. They differ: the file was changed after it was sealed.</Step>
          </ol>
        </div>
      </div>
    </Figure>
  );
}
