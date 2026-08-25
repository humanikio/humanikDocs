import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Diagrams for the phone section.
 *
 * These are HTML rather than images for three reasons that all bite eventually:
 * they inherit the theme, they reflow on a narrow screen, and their text is
 * selectable and indexable. A screenshot of a flow chart is none of those.
 *
 * The visual grammar is one idea: **a filled marker means we own that step, an
 * outlined one means it happens somewhere we do not.** The call path is mostly
 * filled, and that is the argument the page is making, made without a sentence.
 *
 * Data lives beside each component rather than in MDX. A diagram whose labels
 * are passed in from a page is a diagram that drifts between pages.
 */

// ============================================================
// Primitives
// ============================================================

function Figure({
  caption,
  label,
  children,
}: {
  caption?: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <figure className="not-prose my-8" role="group" aria-label={label}>
      {children}
      {caption ? (
        <figcaption className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** The small uppercase line above a node title, naming who is acting. */
function Actor({ children, ours }: { children: ReactNode; ours: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider',
        ours ? 'text-fd-foreground' : 'text-fd-muted-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-1.5 rounded-full',
          ours ? 'bg-fd-foreground' : 'border border-fd-muted-foreground/60',
        )}
      />
      {children}
    </span>
  );
}

/** A labelled connector between two stacked nodes. */
function Wire({ label }: { label?: string }) {
  return (
    <div className="flex items-stretch gap-3 ps-[7px]" aria-hidden>
      <div className="w-px shrink-0 bg-fd-border" />
      {label ? (
        <div className="py-1.5 text-[11px] leading-snug text-fd-muted-foreground">{label}</div>
      ) : (
        <div className="py-1.5" />
      )}
    </div>
  );
}

function Node({
  actor,
  ours,
  title,
  body,
}: {
  actor: string;
  ours: boolean;
  title: string;
  body: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3.5',
        ours ? 'border-fd-foreground/25 bg-fd-card' : 'border-fd-border bg-fd-muted/40',
      )}
    >
      <Actor ours={ours}>{actor}</Actor>
      <p className="mt-1.5 text-sm font-medium text-fd-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">{body}</p>
    </div>
  );
}

// ============================================================
// The call path
// ============================================================

interface Stage {
  actor: string;
  ours: boolean;
  title: string;
  body: string;
  /** What travels from this stage to the next. */
  wire?: string;
}

const CALL_PATH: Stage[] = [
  {
    actor: 'The caller',
    ours: false,
    title: 'Someone dials your number',
    body: 'A person with a phone, waiting for an answer right now.',
    wire: 'their voice, over the phone network',
  },
  {
    actor: 'The phone network',
    ours: false,
    title: 'The call reaches the number',
    body: 'The number is one you bought inside the product, so the call comes to us and not to a general inbox.',
    wire: 'the number that was dialled, and nothing else',
  },
  {
    actor: 'HumanikOS',
    ours: true,
    title: 'We decide who answers',
    body: 'The dialled number resolves to one workspace, then to the one employee set to receive on it. If that employee is asleep, waking it starts here.',
    wire: 'a session address we sign, good for sixty seconds',
  },
  {
    actor: 'HumanikOS',
    ours: true,
    title: 'The live session opens on our servers',
    body: 'One connection, held open for the length of the call. The caller is on our infrastructure from this point until they hang up.',
    wire: "the caller's words, as text, one turn at a time",
  },
  {
    actor: 'Humanik Cloud',
    ours: true,
    title: 'The turn reaches your employee',
    body: "The employee is a machine of its own, with your data, your tools and this call's memory. It answers, or it goes and does the work first.",
    wire: 'the reply, streaming out as it is written',
  },
  {
    actor: 'HumanikOS',
    ours: true,
    title: 'Words leave before the sentence is finished',
    body: 'Each piece of the reply is sent onward the moment it exists, rather than waiting for the whole answer.',
    wire: 'text, in pieces',
  },
  {
    actor: 'The phone network',
    ours: false,
    title: 'The words become a voice',
    body: 'Speech is produced from the text as it arrives, so the answer starts playing while the rest is still being written.',
    wire: 'audio',
  },
  {
    actor: 'The caller',
    ours: false,
    title: 'The caller hears the answer',
    body: 'Then they speak again, and the whole path runs once more. A call is this loop, repeated.',
  },
];

export function CallPath() {
  return (
    <Figure
      label="The path of a phone call"
      caption="Four of the eight steps are ours, and they are every step where a decision gets made. That is the difference between running a phone system and pointing a number at somebody else's."
    >
      <div className="flex flex-col">
        {CALL_PATH.map((stage, i) => (
          <div key={stage.title}>
            <Node actor={stage.actor} ours={stage.ours} title={stage.title} body={stage.body} />
            {i < CALL_PATH.length - 1 ? <Wire label={stage.wire} /> : null}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-fd-border p-3.5">
        <Actor ours>Throughout</Actor>
        <p className="mt-1.5 text-sm font-medium text-fd-foreground">
          Every turn is written into the contact&apos;s conversation as it happens
        </p>
        <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
          Not at the end. A call that is cut off halfway still leaves everything said up to that
          point in the record.
        </p>
      </div>
    </Figure>
  );
}

// ============================================================
// The allocation chain
// ============================================================

export function AllocationChain() {
  return (
    <Figure
      label="How a number reaches an employee"
      caption="Inbound follows a single pointer. Outbound fans out: any employee holding the number can call and text from it."
    >
      <div className="flex flex-col">
        <Node
          actor="Organization"
          ours
          title="You own the number"
          body="Bought once, at the top. It is yours the way a workspace is yours, and it costs money every month whether or not anyone answers it."
        />
        <Wire label="allocate to exactly one workspace" />
        <Node
          actor="Workspace"
          ours
          title="The number belongs to one workspace"
          body="Not two. Moving it somewhere else means taking it back first."
        />
        <Wire label="allocate to as many employees as you like" />

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border-2 border-fd-foreground/40 bg-fd-card p-3">
            <Actor ours>Employee</Actor>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm font-medium text-fd-foreground">
              Answers the phone
              <span className="rounded border border-fd-foreground/30 px-1 py-px font-mono text-[9px] font-semibold uppercase tracking-wide text-fd-muted-foreground">
                primary
              </span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
              And calls and texts out from it.
            </p>
          </div>
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg border border-fd-border bg-fd-card p-3">
              <Actor ours>Employee</Actor>
              <p className="mt-1.5 text-sm font-medium text-fd-foreground">Calls and texts out</p>
              <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
                Never receives on it.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-lg border border-dashed border-fd-border px-3.5 py-2.5 text-xs leading-relaxed text-fd-muted-foreground">
          An incoming call goes to the primary employee and only the primary employee. Exactly one
          holds that flag, and promoting a different one moves it rather than adding a second.
        </div>
      </div>
    </Figure>
  );
}

// ============================================================
// The speech pipeline
// ============================================================

export function VoicePipeline() {
  return (
    <Figure
      label="How speech becomes an answer and an answer becomes speech"
      caption="The fast half and the thorough half are two different things, and separating them is what keeps a caller from listening to silence."
    >
      <div className="grid gap-2 lg:grid-cols-3">
        <div className="rounded-lg border border-fd-border bg-fd-muted/40 p-3.5">
          <Actor ours={false}>1 &middot; Hearing</Actor>
          <p className="mt-1.5 text-sm font-medium text-fd-foreground">Speech becomes text</p>
          <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
            Transcription runs in the media path, live, while the caller is still talking. We
            receive finished sentences, not audio.
          </p>
        </div>
        <div className="rounded-lg border border-fd-foreground/25 bg-fd-card p-3.5">
          <Actor ours>2 &middot; Answering</Actor>
          <p className="mt-1.5 text-sm font-medium text-fd-foreground">
            A fast model writes the words
          </p>
          <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
            It owns the opening of every turn: the immediate reply, the small talk, anything already
            said on this call.
          </p>
        </div>
        <div className="rounded-lg border border-fd-border bg-fd-muted/40 p-3.5">
          <Actor ours={false}>3 &middot; Speaking</Actor>
          <p className="mt-1.5 text-sm font-medium text-fd-foreground">Text becomes a voice</p>
          <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
            A voice provider speaks each piece as it arrives, so the answer begins before it is
            finished.
          </p>
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-fd-foreground/25 bg-fd-card p-3.5">
        <Actor ours>2b &middot; When the answer needs work</Actor>
        <p className="mt-1.5 text-sm font-medium text-fd-foreground">
          The employee takes over the microphone
        </p>
        <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">
          Anything the fast model could not know is handed to the employee, which looks it up, does
          it, and then speaks its own answer. It talks while it works rather than putting the caller
          into silence, and there is no second model repeating it afterwards. One mouth at a time.
        </p>
      </div>
    </Figure>
  );
}

// ============================================================
// Answer modes
// ============================================================

const ANSWER_MODES: { mode: string; label: string; steps: string[] }[] = [
  {
    mode: 'ai',
    label: 'The employee answers',
    steps: ['Your employee picks up', 'Voicemail, if it cannot'],
  },
  {
    mode: 'staff-first',
    label: 'Your people first',
    steps: [
      'Ring the first person on the list',
      'Then the next, in the order you set',
      'Then your employee',
      'Then voicemail',
    ],
  },
  {
    mode: 'staff-only',
    label: 'Only your people',
    steps: ['Ring each person in order', 'Then voicemail. The employee never picks up'],
  },
];

export function AnswerModes() {
  return (
    <Figure
      label="The three answer modes"
      caption="Set per number, so one line can go to a person and another to an employee."
    >
      <div className="grid gap-2 sm:grid-cols-3">
        {ANSWER_MODES.map(({ mode, label, steps }) => (
          <div key={mode} className="rounded-lg border border-fd-border bg-fd-card p-3.5">
            <code className="font-mono text-[11px] text-fd-muted-foreground">{mode}</code>
            <p className="mt-1 text-sm font-medium text-fd-foreground">{label}</p>
            <ol className="mt-2.5 space-y-1.5">
              {steps.map((step, i) => (
                <li key={step} className="flex gap-2 text-xs leading-relaxed text-fd-muted-foreground">
                  <span
                    aria-hidden
                    className="mt-px inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-fd-border text-[9px] font-semibold"
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </Figure>
  );
}
