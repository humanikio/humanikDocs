import { useId, type ReactNode } from 'react';
import { SHAPES, shapeByKey } from '@/lib/huma-shapes';

/**
 * The HumanikOS characters, drawn the way the product draws them, for the docs.
 *
 *   employee   an abstract gradient shape with eyes, inside a halo   (app: HumaAvatar)
 *   person     a candy-coloured bean with a face window              (app: PersonAvatar)
 *   workspace  a gradient squircle with a building, no face          (app: WorkspaceAvatar)
 *
 * STILL on purpose: the app animates (glances, blinks, a spinning halo while working). The docs
 * describe the motion in words and show the frames side by side. Shapes come from the copied
 * `lib/huma-shapes.ts`; colours are the Humanik logo gradient, the same in both themes; anything
 * that sits on the page (halo ring, captions, the person's backdrop) uses the site's theme
 * colours so it follows the light and dark toggle.
 *
 * The figures pick explicit shapes and colours (not ids) so each one shows the variety it is
 * about. None of them is anybody's real face.
 */

const RAMP = ['#36D1F4', '#4C7BF3', '#6A5CFF', '#9B4DFF', '#D65CF2', '#F27AD8'] as const;
const INK = '#17171A';
const RED = '#ef4444';

type FaceState = 'idle' | 'working' | 'waking' | 'asleep' | 'error';

function uid(): string {
  return useId().replace(/:/g, '');
}

// ============================================================
// Employee
// ============================================================

export function EmployeeFace({
  shape = 'soft-circle',
  colour = 1,
  state = 'idle',
  ovalEyes = false,
  size = 56,
  label = 'AI employee',
}: {
  shape?: string;
  /** First of two neighbouring stops of the logo gradient, 0 to 4. */
  colour?: number;
  state?: FaceState;
  ovalEyes?: boolean;
  size?: number;
  label?: string;
}) {
  const id = uid();
  const s = (shapeByKey(shape) ?? SHAPES[0]).build(`docs|${shape}`);
  const from = RAMP[Math.max(0, Math.min(4, colour))];
  const to = RAMP[Math.max(0, Math.min(4, colour)) + 1];
  const l = 24 - s.eyeSpacing;
  const r = 24 + s.eyeSpacing;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label} className="shrink-0">
      <title>{label}</title>
      <defs>
        <linearGradient id={`f${id}`} gradientUnits="userSpaceOnUse" x1={6} y1={4} x2={42} y2={44}>
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`h${id}`} x1={0} y1={0} x2={1} y2={0}>
          <stop offset="0" stopColor={from} stopOpacity={0} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      {/* Halo: the ring every employee sits in, and what it does in each state. */}
      <circle cx={24} cy={24} r={23} fill="none" stroke="var(--color-fd-border)" strokeWidth={1.2} strokeDasharray={state === 'asleep' ? '2 4' : undefined} />
      {state === 'working' && (
        <circle cx={24} cy={24} r={23} fill="none" stroke={`url(#h${id})`} strokeWidth={1.8} strokeDasharray="34 111" strokeLinecap="round" transform="rotate(-30 24 24)" />
      )}
      {state === 'waking' && (
        <circle cx={24} cy={24} r={23} fill="none" stroke={`url(#h${id})`} strokeWidth={1.8} strokeDasharray="70 75" strokeLinecap="round" transform="rotate(-90 24 24)" />
      )}
      {state === 'error' && (
        <circle cx={24} cy={24} r={23} fill="none" stroke={RED} strokeWidth={2.2} strokeDasharray="30 115" strokeDashoffset={-58} strokeLinecap="round" />
      )}
      <g transform="translate(24 24) scale(0.8) translate(-24 -24)">
        <g opacity={state === 'asleep' ? 0.55 : 1} style={state === 'asleep' ? { filter: 'saturate(0.45)' } : undefined}>
          <g fill={`url(#f${id})`}>
            {s.parts.map((d, i) => <path key={i} d={d} />)}
          </g>
          {s.inset && <path d={s.inset} fill="#fff" fillOpacity={0.16} />}
          {state === 'asleep' ? (
            <path d={`M${l - 2.6} ${s.eyeY}q2.6 2.4 5.2 0M${r - 2.6} ${s.eyeY}q2.6 2.4 5.2 0`} stroke={INK} strokeWidth={1.9} strokeLinecap="round" fill="none" />
          ) : ovalEyes ? (
            <>
              <ellipse cx={l} cy={s.eyeY} rx={1.9} ry={3} fill={INK} />
              <ellipse cx={r} cy={s.eyeY} rx={1.9} ry={3} fill={INK} />
            </>
          ) : (
            <>
              <circle cx={l} cy={s.eyeY} r={2.3} fill={INK} />
              <circle cx={r} cy={s.eyeY} r={2.3} fill={INK} />
            </>
          )}
        </g>
      </g>
      {state === 'asleep' && (
        <g fill="var(--color-fd-foreground)" fontFamily="ui-sans-serif, system-ui, sans-serif" fontWeight={700}>
          <text x={33} y={17} fontSize={7} opacity={0.75}>z</text>
          <text x={37} y={11} fontSize={8.5} opacity={0.6}>z</text>
          <text x={41.5} y={5.5} fontSize={10} opacity={0.45}>z</text>
        </g>
      )}
    </svg>
  );
}

// ============================================================
// Person
// ============================================================

const BEAN = 'M24 6.5C33.5 6.5 38.5 13 38.5 22.5C38.5 30 40 38 40.5 49H7.5C8 38 9.5 30 9.5 22.5C9.5 13 14.5 6.5 24 6.5Z';
const BELLY = 'M8 40C16 44 32 44 40 40L40.5 49H7.5Z';
const WINDOW = 'M24 12C29 12 32.5 15.5 32.5 20S29 28 24 28 15.5 24.5 15.5 20 19 12 24 12Z';
const ARMS = [
  'M10.5 28.5C6.5 29 4 33.5 5 37.5C5.8 40.2 8.8 40 10 37.6Z',
  'M37 27C41.5 25 43.5 19.5 41.8 16C40.6 13.6 37.5 14.3 37 17Z',
];

export function PersonFace({ colour = '#FFB547', size = 56, label = 'A person' }: { colour?: string; size?: number; label?: string }) {
  const id = uid();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label} className="shrink-0">
      <title>{label}</title>
      <defs>
        <clipPath id={`c${id}`}><circle cx={24} cy={24} r={24} /></clipPath>
        <radialGradient id={`g${id}`} cx="35%" cy="25%" r="85%">
          <stop offset="0" stopColor="#fff" stopOpacity={0.35} />
          <stop offset="0.55" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g clipPath={`url(#c${id})`}>
        <rect width={48} height={48} fill="var(--color-fd-muted)" />
        {ARMS.map((d) => <path key={d} d={d} fill={colour} />)}
        <path d={BEAN} fill={colour} />
        <path d={BEAN} fill={`url(#g${id})`} />
        <path d={BELLY} fill="#000" opacity={0.1} />
        <path d={WINDOW} fill="#FFF6EC" />
        <rect x={20.6} y={18.1} width={1.9} height={4} rx={0.95} fill="#1B1A20" transform="rotate(-8 21.5 20)" />
        <rect x={25.5} y={18.3} width={1.9} height={4} rx={0.95} fill="#1B1A20" transform="rotate(8 26.5 20)" />
      </g>
    </svg>
  );
}

// ============================================================
// Workspace
// ============================================================

type Win = [x: number, y: number, w: number, h: number]

interface BuildingForm {
  key: string
  /** Solid parts, in ink. */
  body: string[]
  /** Window slots; the id decides which are lit. */
  windows: Win[]
}

/** A grid of windows inside a block. */
function grid(x: number, y: number, cols: number, rows: number, w = 2.6, h = 2.8, gx = 2.4, gy = 2.4): Win[] {
  const out: Win[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push([x + c * (w + gx), y + r * (h + gy), w, h])
  return out
}

const rect = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`

const FORMS: BuildingForm[] = [
  {
    key: 'tower',
    body: [rect(17, 9, 14, 29), rect(22.5, 6, 3, 3)],
    windows: grid(19.2, 12, 2, 5, 3, 3, 3.4, 2.4),
  },
  {
    key: 'twins',
    body: [rect(11, 15, 11, 23), rect(25, 10, 12, 28)],
    windows: [...grid(13, 18, 2, 4, 2.6, 2.8, 2.2, 2.4), ...grid(27.2, 13, 2, 5, 2.8, 2.8, 2.6, 2.4)],
  },
  {
    key: 'house',
    body: ['M11 23L24 12L37 23V38H11Z'],
    windows: [[15, 25, 4, 4], [29, 25, 4, 4], [21.5, 30, 5, 8]],
  },
  {
    key: 'campus',
    body: [rect(9, 24, 30, 14), rect(20, 13, 8, 11), rect(23, 10, 2, 3)],
    windows: [...grid(11.5, 27, 5, 2, 3, 2.8, 2.5, 2.8), ...grid(21.6, 15.5, 2, 2, 1.8, 2.4, 1.4, 2)],
  },
  {
    key: 'storefront',
    body: [rect(10, 16, 28, 22), 'M9 16h30l-2 5H11z'],
    windows: [[13, 25, 9, 9], [25, 25, 5, 13], [32, 25, 3.5, 5]],
  },
  {
    key: 'dome',
    body: ['M12 26a12 12 0 0 1 24 0z', rect(12, 26, 24, 12), rect(23, 11, 2, 3)],
    windows: [...grid(15, 29, 4, 2, 2.6, 2.8, 2.6, 2.4), [21, 18, 6, 3]],
  },
  {
    key: 'skyline',
    body: [rect(8, 22, 9, 16), rect(18, 12, 11, 26), rect(30, 18, 10, 20)],
    windows: [...grid(10, 25, 2, 3, 2, 2.6, 1.6, 2.4), ...grid(20, 15, 2, 5, 2.8, 2.6, 2.2, 2.3), ...grid(32, 21, 2, 4, 2.4, 2.6, 1.8, 2.3)],
  },
  {
    key: 'stepped',
    body: [rect(10, 28, 28, 10), rect(14, 20, 20, 8), rect(18, 12, 12, 8)],
    windows: [...grid(12.5, 31, 5, 1, 2.8, 3, 2.4, 0), ...grid(16.6, 22.5, 4, 1, 2.8, 3, 2.4, 0), ...grid(20.6, 14.5, 2, 1, 2.8, 3, 2.4, 0)],
  },
]

export function WorkspaceMark({ form = 'tower', colour = 1, size = 56, label = 'A workspace' }: { form?: string; colour?: number; size?: number; label?: string }) {
  const id = uid();
  const f = FORMS.find((x) => x.key === form) ?? FORMS[0];
  const from = RAMP[Math.max(0, Math.min(4, colour))];
  const to = RAMP[Math.max(0, Math.min(4, colour)) + 1];
  const showWindows = size >= 40;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label={label} className="shrink-0">
      <title>{label}</title>
      <defs>
        <linearGradient id={`t${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={`w${id}`} gradientUnits="userSpaceOnUse" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor="#ffffff" stopOpacity={0.95} />
        </linearGradient>
      </defs>
      <rect x={2} y={2} width={44} height={44} rx={13.2} fill={`url(#t${id})`} />
      <rect x={7} y={38} width={34} height={1.6} rx={0.8} fill={INK} opacity={0.35} />
      <g fill={INK}>{f.body.map((d, i) => <path key={i} d={d} />)}</g>
      {showWindows && f.windows.map(([x, y, w, h], i) => (
        i % 3 !== 1 ? <rect key={i} x={x} y={y} width={w} height={h} rx={0.5} fill={`url(#w${id})`} opacity={0.92} /> : null
      ))}
    </svg>
  );
}

// ============================================================
// Figures for the pages
// ============================================================

function Figure({ label, caption, children }: { label: string; caption?: string; children: ReactNode }) {
  return (
    <figure className="not-prose my-8" role="group" aria-label={label}>
      {children}
      {caption ? <figcaption className="mt-3 text-xs leading-relaxed text-fd-muted-foreground">{caption}</figcaption> : null}
    </figure>
  );
}

function Item({ children, title, text }: { children: ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-fd-border bg-fd-card p-4 text-center">
      {children}
      <p className="text-sm font-medium text-fd-foreground">{title}</p>
      <p className="text-xs leading-relaxed text-fd-muted-foreground">{text}</p>
    </div>
  );
}

/** Employee, person, workspace: how to tell them apart at a glance. */
export function WhoIsWho() {
  return (
    <Figure label="The three kinds of character in HumanikOS" caption="Round things are beings and rounded squares are places. Faces and colours come from each one's ID, so the same employee looks the same everywhere.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Item title="An AI employee" text="An abstract shape with eyes, inside a ring. The ring shows what it is doing.">
          <EmployeeFace shape="critter-ears" colour={2} label="An AI employee" />
        </Item>
        <Item title="A person" text="A bean with a face window and small arms. No ring.">
          <PersonFace label="A person" />
        </Item>
        <Item title="A workspace" text="A rounded square with a building in it, and no face.">
          <WorkspaceMark form="twins" colour={1} label="A workspace" />
        </Item>
      </div>
    </Figure>
  );
}

const GALLERY: Array<{ shape: string; colour: number; oval?: boolean; family: string }> = [
  { shape: 'soft-squircle', colour: 0, family: 'Soft shapes' },
  { shape: 'loop-reuleaux', colour: 1, oval: true, family: 'From the Humanik logo' },
  { shape: 'organic-blob', colour: 2, family: 'Organic, unique to each employee' },
  { shape: 'petal-5', colour: 3, oval: true, family: 'Petals' },
  { shape: 'critter-antenna', colour: 4, family: 'Critters' },
  { shape: 'system-screen', colour: 1, family: 'Shapes from hardware' },
];

/** A few of the shapes and colours an employee can have. */
export function EmployeeShapes() {
  return (
    <Figure label="Examples of employee faces" caption="Six of the shape families. Each employee gets one shape, two neighbouring colours from the Humanik logo gradient, and round or oval eyes, all worked out from its ID.">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {GALLERY.map((g) => (
          <div key={g.shape} className="flex flex-col items-center gap-2 text-center">
            <EmployeeFace shape={g.shape} colour={g.colour} ovalEyes={g.oval} size={52} label={g.family} />
            <p className="text-[11px] leading-snug text-fd-muted-foreground">{g.family}</p>
          </div>
        ))}
      </div>
    </Figure>
  );
}

const STATES: Array<{ state: FaceState; words: string; dot: string; text: string }> = [
  { state: 'idle', words: 'Online', dot: 'bg-emerald-400', text: 'Awake and ready. The eyes glance and blink now and then.' },
  { state: 'working', words: 'Working now', dot: 'bg-blue-400', text: 'A coloured arc turns around the ring, and the face moves with what it is doing.' },
  { state: 'waking', words: 'Starting up', dot: 'bg-amber-400', text: 'Its machine is booting. The ring fills in.' },
  { state: 'asleep', words: 'Asleep', dot: 'bg-zinc-500', text: 'Its machine is off to save cost. A message or a scheduled task wakes it.' },
  { state: 'error', words: 'Has an error', dot: 'bg-red-400', text: 'Its machine or its last run failed. The office view says why.' },
];

/** The same employee in each state, with the words the app shows beside it. */
export function EmployeeStates() {
  return (
    <Figure label="An employee in each state" caption="The words are the ones the app shows next to the face, with the same coloured dot.">
      <div className="grid gap-3 sm:grid-cols-5">
        {STATES.map((s) => (
          <div key={s.state} className="flex flex-col items-center gap-2 rounded-2xl border border-fd-border bg-fd-card p-3 text-center">
            <EmployeeFace shape="soft-hexagon" colour={2} state={s.state} size={52} label={`An employee: ${s.words}`} />
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-fd-foreground">
              <span aria-hidden className={`size-1.5 rounded-full ${s.dot}`} />
              {s.words}
            </p>
            <p className="text-[11px] leading-snug text-fd-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </Figure>
  );
}
