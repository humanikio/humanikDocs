import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Diagrams for the Devices section.
 *
 * Same grammar as `diagrams.tsx`: a filled marker is HumanikOS, an outlined one
 * is somewhere we do not own. On this section that grammar carries the argument
 * rather than just decorating it, because the customer's machine is the only
 * outlined box in the transport figure and it is also the only box that opens a
 * connection. The picture says "we cannot reach in" before the prose does.
 *
 * `BoardNodes` deliberately reproduces the real node styling from the command
 * board (`OfficeNode.tsx`): the asymmetric corner radii, the sky and purple
 * borders, the laptop and cloud marks. A figure that approximates the UI is
 * worse than no figure, because the reader compares it to their screen.
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

function Wire({ label, note }: { label?: string; note?: string }) {
  return (
    <div className="flex items-stretch gap-3 ps-[7px]">
      <div className="w-px shrink-0 bg-fd-border" aria-hidden />
      <div className="py-1.5">
        {label ? (
          <p className="text-[11px] leading-snug text-fd-muted-foreground">{label}</p>
        ) : null}
        {note ? (
          <p className="mt-0.5 font-mono text-[10px] leading-snug text-fd-muted-foreground/70">
            {note}
          </p>
        ) : null}
      </div>
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
        ours ? 'border-fd-foreground/25 bg-fd-card' : 'border-dashed border-fd-border bg-fd-muted/40',
      )}
    >
      <Actor ours={ours}>{actor}</Actor>
      <p className="mt-1.5 text-sm font-medium text-fd-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">{body}</p>
    </div>
  );
}

// ============================================================
// One job, end to end
// ============================================================

interface Hop {
  actor: string;
  ours: boolean;
  title: string;
  body: string;
  wire?: string;
  note?: string;
}

const HOPS: Hop[] = [
  {
    actor: 'HumanikOS',
    ours: true,
    title: 'Work appears for an employee',
    body: 'Somebody messages it, a schedule fires, or a workflow reaches a step. The employee is pointed at your machine, so this job has to get there.',
    wire: 'first, look up where that machine currently is',
    note: 'GET device:{deviceId} -> instanceId',
  },
  {
    actor: 'The pointer',
    ours: true,
    title: 'One instance holds the connection',
    body: 'Your machine is connected to exactly one gateway instance, and only that instance can reach it. The lookup returns which one.',
    wire: 'subscribe to the answer channel, then add the job to that instance mailbox',
    note: 'SUBSCRIBE reply:{jobId}  ->  XADD relay:inbox:{instanceId}',
  },
  {
    actor: 'Ingress gateway',
    ours: true,
    title: 'The instance reads its mailbox',
    body: 'A stream, read by a consumer group, so the job is handed to one reader and no other instance can also run it.',
    wire: 'down the connection your machine opened',
    note: 'ws.send(job)',
  },
  {
    actor: 'Your machine',
    ours: false,
    title: 'The daemon runs the job',
    body: 'It intersects what the job asks for with what you allowed, runs it locally, and streams the output back without reading it.',
    wire: 'output, in pieces, as it is produced',
    note: 'chunk frames',
  },
  {
    actor: 'Ingress gateway',
    ours: true,
    title: 'Each piece is published',
    body: 'Upward is a broadcast on a channel named for this one job. Nothing is stored, because the listener was already there before the job was sent.',
    wire: 'to whoever asked for this job',
    note: 'PUBLISH reply:{jobId}',
  },
  {
    actor: 'HumanikOS',
    ours: true,
    title: 'The answer arrives where it was needed',
    body: 'The pieces are assembled into the shape the caller expected, and the employee carries on with its turn.',
  },
];

export function DeviceTransport() {
  return (
    <Figure
      label="How one job reaches your machine and the answer comes back"
      caption="Your machine is the only box here we do not own, and it is the only one that opens a connection. Everything else is a consequence of that."
    >
      <div className="flex flex-col">
        {HOPS.map((hop, i) => (
          <div key={hop.title}>
            <Node actor={hop.actor} ours={hop.ours} title={hop.title} body={hop.body} />
            {i < HOPS.length - 1 ? <Wire label={hop.wire} note={hop.note} /> : null}
          </div>
        ))}
      </div>
    </Figure>
  );
}

// ============================================================
// Down is a stream, up is a broadcast
// ============================================================

const DIRECTIONS = [
  {
    dir: 'Down',
    what: 'Jobs',
    mechanism: 'A stream',
    why: 'The reader might not be there. A gateway instance can be restarting or mid deploy at the moment a job is sent, and a stream holds the entry until something reads it. It also hands each entry to exactly one reader, which a broadcast cannot do: fanning a job out would run it several times, and an agent turn has side effects.',
  },
  {
    dir: 'Up',
    what: 'Answers',
    mechanism: 'A broadcast',
    why: 'The listener is always there, because whoever sent the job subscribed before sending it. Nothing needs to be stored, so nothing is. The cost is that a broadcast cannot be replayed.',
  },
];

export function TransportDirections() {
  return (
    <Figure
      label="Why the two directions use different mechanisms"
      caption="They are never swapped. Each direction uses the mechanism whose guarantee matches what is actually true about the receiver."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {DIRECTIONS.map(({ dir, what, mechanism, why }) => (
          <div key={dir} className="rounded-lg border border-fd-foreground/25 bg-fd-card p-3.5">
            <Actor ours>
              {dir} &middot; {what}
            </Actor>
            <p className="mt-1.5 text-sm font-medium text-fd-foreground">{mechanism}</p>
            <p className="mt-1 text-xs leading-relaxed text-fd-muted-foreground">{why}</p>
          </div>
        ))}
      </div>
    </Figure>
  );
}

// ============================================================
// Two registries
// ============================================================

const PLANES = [
  {
    plane: 'Routing',
    question: 'Which instance holds this machine?',
    written: 'By the gateway instance holding the socket, every 25 seconds',
    keys: ['device:{deviceId} -> instanceId', 'device:{deviceId}:caps'],
    ttl: '90 seconds',
    broken: 'Machines become unreachable',
  },
  {
    plane: 'Fleet',
    question: 'How many gateway instances exist, and how loaded are they?',
    written: 'By each instance about itself, every 10 seconds',
    keys: ['machines:{serviceId}:{instanceId}', 'machines:{serviceId}:active'],
    ttl: '30 seconds',
    broken: 'The fleet is sized wrongly. Machines keep working',
  },
];

export function DeviceRegistries() {
  return (
    <Figure
      label="The two registries a gateway instance writes to"
      caption="Both are heartbeats and they answer different questions. Confusing them is the most common wrong conclusion about this system."
    >
      <div className="grid gap-2 sm:grid-cols-2">
        {PLANES.map(({ plane, question, written, keys, ttl, broken }) => (
          <div key={plane} className="rounded-lg border border-fd-foreground/25 bg-fd-card p-3.5">
            <Actor ours>{plane} registry</Actor>
            <p className="mt-1.5 text-sm font-medium text-fd-foreground">{question}</p>
            <dl className="mt-2.5 space-y-1.5 text-xs leading-relaxed text-fd-muted-foreground">
              <div>
                <dt className="inline font-medium text-fd-foreground">Written </dt>
                <dd className="inline">{written}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-fd-foreground">Expires after </dt>
                <dd className="inline">{ttl}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-fd-foreground">If it stops </dt>
                <dd className="inline">{broken}</dd>
              </div>
            </dl>
            <ul className="mt-2.5 space-y-1">
              {keys.map((k) => (
                <li
                  key={k}
                  className="truncate rounded border border-fd-border bg-fd-muted/50 px-1.5 py-1 font-mono text-[10px] text-fd-muted-foreground"
                >
                  {k}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Figure>
  );
}

// ============================================================
// One turn, two places
// ============================================================

export function ToolSplit() {
  return (
    <Figure
      label="Where each half of a turn runs"
      caption="One agent, one turn, two execution environments. It cannot tell them apart, and it does not need to: they are all just tools with names."
    >
      <div className="rounded-lg border border-dashed border-fd-border bg-fd-muted/40 p-3.5">
        <Actor ours={false}>Your machine</Actor>
        <p className="mt-1.5 text-sm font-medium text-fd-foreground">
          The agent thinks here, and does the local half here
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-fd-muted-foreground">
          <li>Reads and writes files, inside a directory the daemon derives</li>
          <li>Uses the connectors you signed this machine into</li>
          <li>Bounded by the ceiling in your config, which nothing upstream can widen</li>
        </ul>
      </div>

      <div className="flex items-stretch gap-3 ps-[7px]">
        <div className="w-px shrink-0 bg-fd-border" aria-hidden />
        <div className="py-2">
          <p className="text-[11px] leading-snug text-fd-muted-foreground">
            mid turn, the agent calls a tool it does not hold. The call goes up, not sideways
          </p>
          <p className="mt-0.5 font-mono text-[10px] leading-snug text-fd-muted-foreground/70">
            tool_call -&gt; gateway -&gt; HumanikOS -&gt; the office machine -&gt; tool_result
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-fd-foreground/25 bg-fd-card p-3.5">
        <Actor ours>The office</Actor>
        <p className="mt-1.5 text-sm font-medium text-fd-foreground">
          The credentialed half runs where the credentials already are
        </p>
        <ul className="mt-2 space-y-1 text-xs leading-relaxed text-fd-muted-foreground">
          <li>The office reads the secret from its own vault and makes the call itself</li>
          <li>Only the response travels back to your machine</li>
          <li>Bounded by what the office was granted, not by your ceiling</li>
        </ul>
      </div>

      <div className="mt-2 rounded-lg border border-dashed border-fd-border px-3.5 py-2.5 text-xs leading-relaxed text-fd-muted-foreground">
        The agent is blocked on its own turn while this happens, and picks up exactly where it
        left off when the result arrives. No key is ever written to your machine.
      </div>
    </Figure>
  );
}

// ============================================================
// The command board
// ============================================================

function CloudMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.5 19a4.5 4.5 0 0 0 0-9h-1.8A7 7 0 1 0 4 16.9" />
      <path d="M4 16.9h13.5" />
    </svg>
  );
}

function LaptopMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 5h18v11H3z" />
      <path d="M1.5 19h21" />
    </svg>
  );
}

export function BoardNodes() {
  return (
    <Figure
      label="How an employee appears on the board when it runs on your machine"
      caption="Both states are marked, not only the exception. An unmarked node would leave you unable to tell a cloud employee from one whose mark failed to load."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <div className="rounded-2xl border border-purple-500/70 bg-fd-card p-3">
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400">
                <CloudMark />
              </span>
              <p className="text-sm font-medium text-fd-foreground">Dispatch</p>
            </div>
            <p className="mt-2 text-[11px] text-fd-muted-foreground">
              Model
              <span className="ms-1.5 font-mono text-fd-foreground">claude-opus-5</span>
            </p>
          </div>
          <ul className="mt-2.5 space-y-1 text-xs leading-relaxed text-fd-muted-foreground">
            <li>Soft rectangle, purple outline</li>
            <li>Cloud mark, muted, because this is the ordinary case</li>
            <li>The model row names the model</li>
          </ul>
        </div>

        <div>
          <div className="rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-bl-none rounded-tr-none border border-sky-500/70 bg-fd-card p-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sky-400">
                <LaptopMark />
              </span>
              <p className="text-sm font-medium text-fd-foreground">Dispatch</p>
            </div>
            <p className="mt-2 text-[11px] text-fd-muted-foreground">
              Model &middot; your machine
              <span className="ms-1.5 font-mono text-fd-foreground">tylers-mac-mini</span>
            </p>
          </div>
          <ul className="mt-2.5 space-y-1 text-xs leading-relaxed text-fd-muted-foreground">
            <li>Two corners cut square, sky outline</li>
            <li>Laptop mark, accented, because this changes what to expect</li>
            <li>The model row names the machine, and says whose it is</li>
          </ul>
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-dashed border-fd-border px-3.5 py-2.5 text-xs leading-relaxed text-fd-muted-foreground">
        Shape carries the difference as well as colour, so the two are still
        distinguishable to a reader who cannot separate blue from purple.
      </div>
    </Figure>
  );
}
