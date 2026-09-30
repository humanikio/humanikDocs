/**
 * COPIED from hos-frontend `src/components/huma/shapes.ts` (2026-09-30) so the docs can draw the
 * same employee faces the product does. Keep the two in step: the keys are permanent in the app,
 * and a face in the docs that does not match the app is worse than no face.
 */

/**
 * HumaAvatar body shapes — six families, one pool.
 *
 * Every shape is drawn on a 48×48 box centred on (24, 24) and returns path strings only
 * (circles, pills and ellipses are converted), so the component renders plain <path>s.
 *
 * `eyeY` / `eyeSpacing` put the eyes on the body: a point-up triangle is narrow at the top,
 * so its eyes sit low; a critter with ears has its face lower than its outline's centre.
 *
 * ⚠ KEYS ARE PERMANENT. The avatar picks a shape by highest-random-weight hashing over these
 * keys (HumaAvatar.tsx). Renaming or removing a key changes the face of every employee who
 * had it. Add new shapes by appending new keys.
 */

export interface HumaShapeBuild {
  /** Body parts, all filled with the employee's gradient. */
  parts: string[]
  /** An optional lighter inner panel (the keycap's face). */
  inset?: string
  eyeY: number
  eyeSpacing: number
}

export interface HumaShape {
  key: string
  family: 'soft' | 'loop' | 'organic' | 'petal' | 'critter' | 'system'
  build: (seed: string) => HumaShapeBuild
}

// ============================================================
// Geometry
// ============================================================

const f = (n: number) => n.toFixed(2)

function roundedPolygon(n: number, R: number, rotDeg: number, r: number, cx = 24, cy = 24): string {
  const pts: Array<[number, number]> = []
  for (let i = 0; i < n; i++) {
    const a = ((rotDeg - 90 + (i * 360) / n) * Math.PI) / 180
    pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)])
  }
  let d = ''
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const toward = (q: [number, number]) => {
      const dx = q[0] - p[0]
      const dy = q[1] - p[1]
      const L = Math.hypot(dx, dy)
      return [p[0] + (dx / L) * r, p[1] + (dy / L) * r]
    }
    const a = toward(pts[(i + n - 1) % n])
    const b = toward(pts[(i + 1) % n])
    d += `${i ? 'L' : 'M'}${f(a[0])} ${f(a[1])}Q${f(p[0])} ${f(p[1])} ${f(b[0])} ${f(b[1])}`
  }
  return d + 'Z'
}

function superellipse(n: number, rx = 20, ry = 20, cx = 24, cy = 24): string {
  const pts: string[] = []
  for (let i = 0; i < 64; i++) {
    const t = (i / 64) * Math.PI * 2
    const c = Math.cos(t)
    const s = Math.sin(t)
    pts.push(`${f(cx + rx * Math.sign(c) * Math.abs(c) ** (2 / n))} ${f(cy + ry * Math.sign(s) * Math.abs(s) ** (2 / n))}`)
  }
  return 'M' + pts.join('L') + 'Z'
}

/** Gielis superformula, normalised to radius R. Soft lobes for n2 = n3 ≥ 2. */
function superformula(m: number, n1: number, n2: number, n3: number, rotDeg = -90, R = 20.5): string {
  const raw: Array<[number, number]> = []
  for (let i = 0; i < 180; i++) {
    const phi = (i / 180) * Math.PI * 2
    const t1 = Math.abs(Math.cos((m * phi) / 4)) ** n2
    const t2 = Math.abs(Math.sin((m * phi) / 4)) ** n3
    raw.push([phi, (t1 + t2) ** (-1 / n1)])
  }
  const max = Math.max(...raw.map((r) => r[1]))
  const a0 = (rotDeg * Math.PI) / 180
  return 'M' + raw.map(([phi, r]) => `${f(24 + ((R * r) / max) * Math.cos(phi + a0))} ${f(24 + ((R * r) / max) * Math.sin(phi + a0))}`).join('L') + 'Z'
}

/** Catmull-Rom through closed points, as cubic Béziers. */
function closedSmooth(pts: Array<[number, number]>): string {
  const n = pts.length
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i + n - 1) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + 'Z'
}

const circle = (cx: number, cy: number, r: number) =>
  `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`

/** Rounded rectangle; rx is clamped to half the short side. */
const rrect = (x: number, y: number, w: number, h: number, rx: number) => {
  const r = Math.min(rx, w / 2, h / 2)
  return `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(y)}Z`
}

/** Ellipse rotated about its centre, as a path. */
const ellipse = (cx: number, cy: number, rx: number, ry: number, rotDeg = 0) => {
  const a = (rotDeg * Math.PI) / 180
  const dx = rx * Math.cos(a)
  const dy = rx * Math.sin(a)
  return `M${f(cx - dx)} ${f(cy - dy)}A${f(rx)} ${f(ry)} ${rotDeg} 1 0 ${f(cx + dx)} ${f(cy + dy)}A${f(rx)} ${f(ry)} ${rotDeg} 1 0 ${f(cx - dx)} ${f(cy - dy)}Z`
}

function reuleaux(cy = 26, R = 20.5): string {
  const pts = [0, 1, 2].map((i) => {
    const a = ((-90 + i * 120) * Math.PI) / 180
    return [24 + R * Math.cos(a), cy + R * Math.sin(a)]
  })
  const s = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1])
  return `M${f(pts[0][0])} ${f(pts[0][1])}` +
    [1, 2, 0].map((i) => `A${f(s)} ${f(s)} 0 0 1 ${f(pts[i][0])} ${f(pts[i][1])}`).join('') + 'Z'
}

/** Small seeded generator for the organic outline. */
function seeded(seed: string) {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0
    h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0
    return ((h ^ (h >>> 15)) >>> 0) / 4294967296
  }
}

// ============================================================
// Shapes
// ============================================================

/** A shape that does not depend on the seed — built once, then reused. */
function fixed(key: string, family: HumaShape['family'], make: () => HumaShapeBuild): HumaShape {
  let cached: HumaShapeBuild | null = null
  return { key, family, build: () => (cached ??= make()) }
}

const one = (d: string, eyeY: number, eyeSpacing = 5): HumaShapeBuild => ({ parts: [d], eyeY, eyeSpacing })

export const SHAPES: HumaShape[] = [
  // ---- Soft geometry
  fixed('soft-circle', 'soft', () => one(superellipse(2), 21)),
  fixed('soft-squircle', 'soft', () => one(superellipse(4.2), 21)),
  fixed('soft-triangle', 'soft', () => one(roundedPolygon(3, 22, 0, 7, 24, 26.5), 29, 4.2)),
  fixed('soft-diamond', 'soft', () => one(roundedPolygon(4, 21.5, 45, 6), 22)),
  fixed('soft-hexagon', 'soft', () => one(roundedPolygon(6, 21, 0, 5), 21.5)),
  fixed('soft-capsule', 'soft', () => one(rrect(4, 8, 40, 32, 9), 21)),

  // ---- Born from the Humanik loop
  fixed('loop-up', 'loop', () => one(roundedPolygon(3, 22, 0, 8, 24, 26.5), 29, 4.2)),
  fixed('loop-down', 'loop', () => one(roundedPolygon(3, 22, 180, 8, 24, 21.5), 17.5, 5)),
  fixed('loop-reuleaux', 'loop', () => one(reuleaux(), 27, 4.6)),
  fixed('loop-trefoil', 'loop', () => ({
    parts: [circle(24, 15, 10.5), circle(15, 30, 10.5), circle(33, 30, 10.5), circle(24, 25, 9)],
    eyeY: 25,
    eyeSpacing: 5,
  })),
  fixed('loop-lobed', 'loop', () => one(superformula(3, 5, 7, 7), 24, 4.4)),
  fixed('loop-tilted', 'loop', () => one(roundedPolygon(3, 22, 12, 8, 24, 26), 28, 4.2)),

  // ---- Organic: a blob grown from the id, unique per employee
  {
    key: 'organic-blob',
    family: 'organic',
    build: (seed) => {
      const r = seeded(`organic|${seed}`)
      const pts: Array<[number, number]> = []
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 - Math.PI / 2
        const rad = 16.5 + r() * 5
        pts.push([24 + rad * Math.cos(a), 24.5 + rad * Math.sin(a)])
      }
      return one(closedSmooth(pts), 21.5)
    },
  },
  {
    key: 'organic-pebble',
    family: 'organic',
    build: (seed) => {
      const r = seeded(`pebble|${seed}`)
      const pts: Array<[number, number]> = []
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2
        const rad = 17.5 + r() * 3.5
        pts.push([24 + rad * 1.08 * Math.cos(a), 25 + rad * 0.92 * Math.sin(a)])
      }
      return one(closedSmooth(pts), 22.5)
    },
  },

  // ---- Petals
  fixed('petal-3', 'petal', () => one(superformula(3, 3, 4, 4), 24, 4.4)),
  fixed('petal-4', 'petal', () => one(superformula(4, 4, 5, 5, -45), 23)),
  fixed('petal-5', 'petal', () => one(superformula(5, 5, 6, 6), 23.5, 4.4)),
  fixed('petal-6', 'petal', () => one(superformula(6, 7, 8, 8), 23, 4.6)),
  fixed('petal-4-full', 'petal', () => one(superformula(4, 2.5, 3.2, 3.2, -45), 23)),
  fixed('petal-5-full', 'petal', () => one(superformula(5, 3, 3.5, 3.5), 23.5, 4.2)),

  // ---- Critters: a body plus one feature
  fixed('critter-ears', 'critter', () => ({
    parts: [superellipse(3.2, 18.5, 17, 24, 27), circle(12, 12, 6), circle(36, 12, 6)],
    eyeY: 26,
    eyeSpacing: 5,
  })),
  fixed('critter-antenna', 'critter', () => ({
    parts: [superellipse(3.2, 18.5, 16.5, 24, 28), rrect(22.6, 3.5, 2.8, 9, 1.4), circle(24, 5.5, 3.6)],
    eyeY: 26.5,
    eyeSpacing: 5,
  })),
  fixed('critter-tuft', 'critter', () => ({
    parts: [superellipse(2.6, 18.5, 17, 24, 27.5), ellipse(18, 10, 3, 6, -25), ellipse(24, 8, 3, 6.5), ellipse(30, 10, 3, 6, 25)],
    eyeY: 26,
    eyeSpacing: 5,
  })),
  fixed('critter-horns', 'critter', () => ({
    parts: [superellipse(4, 19, 17.5, 24, 26.5), 'M10 11L14 3.5L18.5 11Z', 'M29.5 11L34 3.5L38 11Z'],
    eyeY: 25,
    eyeSpacing: 5,
  })),
  fixed('critter-ghost', 'critter', () =>
    one('M24 5C35 5 43 13 43 24V41C43 42 42 43 41 43H7C6 43 5 42 5 41V24C5 13 13 5 24 5Z', 22)),
  fixed('critter-arms', 'critter', () => ({
    parts: [superellipse(2.4, 19.5, 18, 24, 26), circle(7, 28, 4), circle(41, 28, 4)],
    eyeY: 23.5,
    eyeSpacing: 5,
  })),

  // ---- System: shapes from hardware
  fixed('system-chip', 'system', () => ({
    parts: [
      rrect(9, 9, 30, 30, 4),
      ...[14, 21, 28].flatMap((y) => [rrect(4, y + 1, 6, 3.5, 1.2), rrect(38, y + 1, 6, 3.5, 1.2)]),
      ...[16, 22.25, 28.5].flatMap((x) => [rrect(x, 4, 3.5, 6, 1.2), rrect(x, 38, 3.5, 6, 1.2)]),
    ],
    eyeY: 22,
    eyeSpacing: 5,
  })),
  fixed('system-keycap', 'system', () => ({
    parts: [rrect(5, 5, 38, 38, 7)],
    inset: rrect(9, 9, 30, 26, 5),
    eyeY: 21,
    eyeSpacing: 5,
  })),
  fixed('system-octagon', 'system', () => one(roundedPolygon(8, 21.5, 22.5, 3.5), 21.5)),
  fixed('system-screen', 'system', () => ({
    parts: [rrect(5, 7, 38, 28, 5), rrect(20, 34, 8, 5, 0), rrect(14, 39, 20, 3.5, 1.75)],
    eyeY: 20,
    eyeSpacing: 5,
  })),
]

const BY_KEY = new Map(SHAPES.map((s) => [s.key, s]))

export function shapeByKey(key: string): HumaShape | undefined {
  return BY_KEY.get(key)
}
