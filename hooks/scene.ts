// The scene behind the conversation in the Desktop and mobile apps: Clawd's
// room on a rainy day, printed in halftone. Every object is round dots on one
// grid, big dots where a shape is solid and smaller ones toward its edges,
// over flat washes of color. Built from rainy-window by Ishu Agrawal (MIT).
//
// It is mirrored around the conversation, which covers the middle. Right,
// outer: the rainy window, a radiator, a shelf with candles and a teapot, and
// Clawd at the desk typing on his laptop. Right, inner: a sunburst wall clock
// and an arc floor lamp, the West Wing kind. Left, inner: a painting of a
// knight above a sea of clouds, an open wall shelf whose empty spots suggest
// things to add, a desk lamp and a record player. Left, outer: a hanging
// pothos. String lights run along the top and the desk along the bottom.
//
// It's one drawing that never changes, animated with SMIL, SVG's own
// animation. The desktop app moves a backdrop only if it passes the app's
// check (see BASE_STYLE), and otherwise draws a still copy. The drawing has
// no viewBox: its units are the window's own pixels, anchored to the window's
// edges by nested svgs. Both palettes follow the app's text color (see
// `themed`). There are no words in it.

import { clawdSheet } from './clawd/sheet'

// The prompt box's bottom edge sits about this far above the window's bottom,
// and the desk's top this far.
const SILL = 31
const DESK = 64
// The dot grid: one dot every 6px, its radius set by density, from a full dot
// (0) to a speck (4).
const PITCH = 6
const RADII = [2.6, 2.1, 1.6, 1.15, 0.75]

// The right side keeps this much empty wall between it and the window's edge.
const PAD = 30
// The window's glass, in the top right, measured from the right edge.
const GX = -204
const GY = 112
const GW = 168
const GH = 220
// The two shelves, over Clawd and over the lamp, sit this far down the window.
const SHELF_AT = '55%'
// Rain falls through two tiles: near and far.
const NEAR = 192
const FAR = 144

const LIGHT: Record<string, string> = {
  top: '#F2ECE2', mid: '#EFE7DB', bottom: '#EEDFCA', cool: '#BCC8EE', rose: '#EFC9D6', warm: '#F7C48A', floor: '#F3D3B1',
  tex: '#DDD1BE', shade: '#D8C6AA',
  winTop: '#A9BEEC', winBot: '#E1E9F8', sky: '#5664D6', hill: '#7286D0', hill2: '#5464BE', tree: '#3E4B9E', sun: '#F2A35E', moon: '#F3ECD8', star: '#E9E1CE',
  rain: '#5E6BAE', glass: '#FFFFFF',
  frame: '#4A4E8C', curtain: '#E3A39B', curtainDark: '#C27C74', tie: '#F2A25C', leaf: '#4E8A52', leaf2: '#86B672', pot: '#C9765A',
  mat: '#F8F3EA', print: '#E8A3A6',
  deskTop: '#DCC6A2', deskDot: '#C4A67D', deskFront: '#C2A47C', deskLine: '#8E7048', drawer: '#E4CFAA',
  lamp: '#F2A25C', lampOff: '#B9A58C', metal: '#4A4E8C', bulb: '#FFD38A', box: '#A9815E', vinyl: '#2A2633', label: '#F2A25C', note: '#4A4E8C',
  wire: '#7A7488', puff: '#8E8AA6', mug: '#FFFDF8', rad: '#8E97C2', sleeveA: '#E8A3A6', sleeveB: '#7D92D8', wax: '#EFC7A8', flame: '#F29A4A', guitar: '#D7894E',
  ao: '#C9B596',
  cloud: '#FFFFFF', cloudShade: '#C9CFEA', rock: '#5A5470', knight: '#2E2A3C', cape: '#B4474A', brass: '#C99A4E', ghost: '#8E8AA6', board: '#FFFFFF', boardEdge: '#B8AE9E',
}
// Dark: the sepia palette, an old photograph by lamplight.
const DARK: Record<string, string> = {
  top: '#1A1510', mid: '#1F1913', bottom: '#261E16', cool: '#5A4A36', rose: '#5E4030', warm: '#E6B87A', floor: '#C9704A',
  tex: '#2A2219', shade: '#30261C',
  winTop: '#0F0C08', winBot: '#3A2F22', sky: '#A08A62', hill: '#2A2219', hill2: '#1E1812', tree: '#120E0A', sun: '#F3ECD8', moon: '#F3ECD8', star: '#E9E1CE',
  rain: '#9AA6E8', glass: '#C9D2FF',
  frame: '#CDB48A', curtain: '#7A5E42', curtainDark: '#55402C', tie: '#D98A4A', leaf: '#6A7A50', leaf2: '#8A9A6A', pot: '#A85E46',
  mat: '#1C1711', print: '#A06A88',
  deskTop: '#33281D', deskDot: '#4A3B2A', deskFront: '#1C1610', deskLine: '#8C7558', drawer: '#3A2E21',
  lamp: '#F6B25E', lampOff: '#5A4E6E', metal: '#CDB48A', bulb: '#FFC774', box: '#6A563E', vinyl: '#0D0F22', label: '#F2A25C', note: '#F3E6CB',
  wire: '#4A4570', puff: '#D9D3F0', mug: '#F4E8D8', rad: '#5A4A38', sleeveA: '#A06A88', sleeveB: '#6A6A7A', wax: '#E9DCC8', flame: '#FFB25E', guitar: '#B5703F',
  ao: '#040302',
  cloud: '#D8CCB4', cloudShade: '#6A5A44', rock: '#3A3026', knight: '#0E0B08', cape: '#8A4A3A', brass: '#E2B064', ghost: '#9C97C8', board: '#ECE7DF', boardEdge: '#4A4570',
}

// The app checks a backdrop before it lets it move: no media queries but
// reduced motion's, no viewport units, a short list of CSS functions. So the
// scene can't ask `prefers-color-scheme` which palette to use. Instead it reads
// the app's text color, which the app sets on the drawing (`currentColor`):
// dark ink in light mode, cream in dark mode. Each palette color is a relative
// color from it, moving from its light value to its dark one as the text gets
// lighter.
function toOklch(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const lin = (v: number) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  const [r, g, b] = [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)]
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const h = (Math.atan2(B, A) * 180) / Math.PI
  return [L, Math.hypot(A, B), h < 0 ? h + 360 : h]
}
// How dark the window is, from the text's lightness `l`: 0 in light mode, 1 in dark.
const NIGHT = 'clamp(0, (l - .35) / .45, 1)'
const f4 = (v: number) => (Math.round(v * 10000) / 10000).toString()
function themed(light: string, dark: string, alpha = '') {
  const [l1, c1, h0] = toOklch(light)
  const [l2, c2, h3] = toOklch(dark)
  // A pure gray has no hue of its own, so it borrows the other's.
  const h1 = c1 < 0.002 ? h3 : h0
  const h2 = c2 < 0.002 ? h0 : h3
  let dh = h2 - h1
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  const ch = (a: number, d: number) => (Math.abs(d) < 1e-4 ? f4(a) : `calc(${f4(a)} + ${f4(d)} * ${NIGHT})`)
  return `oklch(from currentColor ${ch(l1, l2 - l1)} ${ch(c1, c2 - c1)} ${ch(h1, dh)}${alpha ? ` / ${alpha}` : ''})`
}
const PALETTE = Object.keys(LIGHT)
  .map(k => `--${k}:${themed(LIGHT[k] as string, DARK[k] as string)}`)
  // The sun shows by day, the moon and stars by night.
  .concat([`--daySun:${themed('#F2A35E', '#F2A35E', `calc(1 - ${NIGHT})`)}`, `--moon:${themed('#F3ECD8', '#F3ECD8', NIGHT)}`, `--star:${themed('#E9E1CE', '#E9E1CE', NIGHT)}`])
  .join(';')
const PAINT = [
  'tex', 'shade', 'sky', 'hill', 'hill2', 'tree', 'sun', 'daySun', 'moon', 'star', 'rain', 'glass', 'frame', 'curtain', 'curtainDark', 'tie',
  'leaf', 'leaf2', 'pot', 'mat', 'print', 'deskTop', 'deskDot', 'deskFront', 'deskLine', 'drawer', 'lamp', 'lampOff', 'metal', 'bulb', 'box', 'vinyl',
  'label', 'note', 'wire', 'warm', 'puff', 'mug', 'rad', 'sleeveA', 'sleeveB', 'wax', 'flame', 'guitar', 'ao',
  'cloud', 'cloudShade', 'rock', 'knight', 'cape', 'brass', 'ghost', 'board', 'boardEdge',
]
const STOPS = ['top', 'mid', 'bottom', 'winTop', 'winBot', 'cool', 'rose', 'warm', 'floor', 'bulb', 'ao']

// Everything that moves is SMIL, SVG's own animation elements: the desktop
// app's frame runs them and not CSS animation. Each helper wraps a group in a
// loop; a negative delay starts it partway through, so copies fall out of step.
const loop = (dur: number, delay = 0) => `dur="${dur}s" repeatCount="indefinite"${delay ? ` begin="${delay.toFixed(2)}s"` : ''}`
// Slide a group by (dx, dy) and jump back, optionally fading out as it goes.
const drift = (inner: string, dx: number, dy: number, dur: number, delay = 0, fade = false) =>
  `<g><animateTransform attributeName="transform" type="translate" from="0 0" to="${dx} ${dy}" ${loop(dur, delay)}/>` +
  (fade ? `<animate attributeName="opacity" from="1" to="0" ${loop(dur, delay)}/>` : '') +
  `${inner}</g>`
// Switch a group's opacity through values, evenly spaced.
const blink = (inner: string, values: string, dur: number, delay = 0) =>
  `<g><animate attributeName="opacity" values="${values}" calcMode="discrete" ${loop(dur, delay)}/>${inner}</g>`
// Turn a group about (cx, cy) through angles, smoothly or in ticks.
const turn = (inner: string, angles: number[], cx: number, cy: number, dur: number, discrete = false) =>
  `<g><animateTransform attributeName="transform" type="rotate" values="${angles.map(a => `${a} ${cx} ${cy}`).join(';')}"${discrete ? ' calcMode="discrete"' : ''} ${loop(dur)}/>${inner}</g>`
// Scale a group about (cx, cy) through factors.
const pulse = (inner: string, scales: string, cx: number, cy: number, dur: number, delay = 0) =>
  `<g transform="translate(${cx} ${cy})"><g><animateTransform attributeName="transform" type="scale" values="${scales}" calcMode="discrete" ${loop(dur, delay)}/><g transform="translate(${-cx} ${-cy})">${inner}</g></g></g>`

const BASE_STYLE = [
  `svg{${PALETTE}}`,
  PAINT.map(k => `.f-${k}{fill:var(--${k})}.s-${k}{stroke:var(--${k})}`).join(''),
  STOPS.map(k => `.s-${k}{stop-color:var(--${k})}`).join(''),
  '.o-cool{opacity:.43}.o-rose{opacity:.3}.o-floor{opacity:.4}.o-warm{opacity:.52}.o-tex{opacity:.5}',
].join('')

// A stable pseudo-random number in [0, 1) for index i.
function nz(i: number) {
  let n = Math.imul(i ^ 0x9e3779b9, 2654435761)
  n ^= n >>> 15
  return ((n >>> 0) % 10000) / 10000
}

const r = (x: number, y: number, w: number, h: number, cls: string, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"${extra ? ' ' + extra : ''}/>`
const c = (x: number, y: number, rad: number, cls: string, extra = '') =>
  `<circle cx="${x}" cy="${y}" r="${rad}"${cls ? ` class="${cls}"` : ''}${extra ? ' ' + extra : ''}/>`
const e = (x: number, y: number, rx: number, ry: number, cls: string) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="${cls}"/>`
// Anchors: a point on the window's edge that a group draws from.
const at = (x: string, y: string, inner: string) => `<svg x="${x}" y="${y}" width="1" height="1" overflow="visible">${inner}</svg>`
// Print shapes in the grid's dots at a density, from 0 (full dots) to 4. Each
// shape's paint becomes a pattern: a 6px tile holding one dot of that size in
// that paint. (Masks would do the same, but the app times each frame of a
// moving backdrop and holds a slow one still, and a hundred masks are slow.)
const DOTS = new Map<string, string>()
function dotPaint(density: number, paint: string, pitch = PITCH) {
  const key = `${density}|${pitch}|${paint}`
  let id = DOTS.get(key)
  if (id === undefined) {
    id = `p${DOTS.size}`
    DOTS.set(key, id)
  }
  return `url(#${id})`
}
// `pitch` is the grid's step: the room uses PITCH, and the painting, a finer
// print, a smaller one.
const dotted = (density: number, inner: string, pitch = PITCH) =>
  inner
    .replace(/class="([fs])-([A-Za-z0-9]+)"/g, (_, kind: string, name: string) => `${kind === 'f' ? 'fill' : 'stroke'}="${dotPaint(density, `var(--${name})`, pitch)}"`)
    .replace(/style="fill:([^";]+)"/g, (_, paint: string) => `fill="${dotPaint(density, paint, pitch)}"`)
    .replace(/ fill="(#[0-9A-Fa-f]{3,8})"/g, (_, paint: string) => ` fill="${dotPaint(density, paint, pitch)}"`)
function dotPatterns() {
  let o = ''
  for (const [key, id] of DOTS) {
    const [density, pitch, paint] = key.split('|') as [string, string, string]
    const pt = Number(pitch)
    const rad = ((RADII[Number(density)] as number) * pt) / PITCH
    o += `<pattern id="${id}" width="${pt}" height="${pt}" patternUnits="userSpaceOnUse"><circle cx="${pt / 2}" cy="${pt / 2}" r="${rad.toFixed(2)}" style="fill:${paint}"/></pattern>`
  }
  return o
}
// A line of dots, one every grid step.
const dline = (d: string, cls: string, width = 4.6) => `<path d="${d}" class="${cls}" fill="none" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 ${PITCH}"/>`
// A shape that dissolves at its edge: full dots at its heart, then smaller
// ones in rings around it. `shape(k)` draws it grown by a factor k, and each
// ring is [k, density], outermost first.
const halftone = (shape: (k: number) => string, rings: [number, number][] = [[1.5, 3], [1.25, 2], [1, 0]], pitch = PITCH) =>
  rings.map(([k, density]) => dotted(density, shape(k), pitch)).join('')

// Clawd's masks: his own grid of one dot per pixel, at the same pitch once he
// is drawn six times his size. His frames are many shapes in many colors, so
// one mask over them all is cheaper than a pattern for each.
function masks() {
  const own = 'maskUnits="userSpaceOnUse" x="-40" y="-40" width="110" height="80"'
  let o = ''
  RADII.forEach((rad, k) => {
    if (k === 1 || k === 4) return
    o += `<pattern id="pc${k}" width="1" height="1" patternUnits="userSpaceOnUse"><circle cx=".5" cy=".5" r="${(rad / PITCH).toFixed(3)}" fill="#fff"/></pattern>`
    o += `<mask id="c${k}" ${own}><rect x="-40" y="-40" width="110" height="80" fill="url(#pc${k})"/></mask>`
  })
  return o
}

// Rain: streaks of small dots, tiled so a pattern height of fall loops.
function rainPattern(id: string, w: number, h: number, n: number, len: number, width: number, gap: number, seed: number) {
  let d = ''
  for (let i = 0; i < n; i++) {
    const x = Math.round(nz(seed + i) * w)
    const y = Math.round(nz(seed + 40 + i) * h)
    d += `M${x} ${y}v${len}`
    if (y + len > h) d += `M${x} ${y - h}v${len}`
  }
  return `<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"><path d="${d}" class="s-rain" stroke-width="${width}" stroke-linecap="round" stroke-dasharray="0 ${gap}"/></pattern>`
}

function defs() {
  const radial = (id: string, stop: string, cx = 0.5, cy = 0.5, rad = 0.5) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rad}"><stop offset="0" class="${stop}"/><stop offset=".45" class="${stop}" stop-opacity=".42"/><stop offset="1" class="${stop}" stop-opacity="0"/></radialGradient>`
  return (
    '<defs>' +
    '<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s-top"/><stop offset=".55" class="s-mid"/><stop offset="1" class="s-bottom"/></linearGradient>' +
    '<linearGradient id="winSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="s-winTop"/><stop offset="1" class="s-winBot"/></linearGradient>' +
    radial('gCool', 's-cool', 0.9, 0.2, 0.6) +
    radial('gRose', 's-rose', 0.12, 0.14, 0.55) +
    radial('gFloor', 's-floor', 0.5, 1.05, 0.7) +
    radial('gWarm', 's-warm') +
    radial('gBulb', 's-bulb') +
    `<pattern id="tex" width="${PITCH}" height="${PITCH}" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r=".8" class="f-tex"/></pattern>` +
    masks() +
    dotPatterns() +
    rainPattern('rainNear', 132, NEAR, 18, 18, 2.2, 5, 500) +
    rainPattern('rainFar', 96, FAR, 16, 10, 1.4, 4, 700) +
    `<clipPath id="glass"><rect x="${GX}" y="${GY}" width="${GW}" height="${GH}"/></clipPath>` +
    '</defs>'
  )
}


// The view through the window: a halftone sky, the sun or the moon and stars,
// a cloud, hills and trees, two layers of rain and drops on the glass.
function windowView() {
  let v = r(GX, GY, GW, GH, '', 'fill="url(#winSky)"')
  v += dotted(2, r(GX, GY, GW, 36, 'f-sky')) + dotted(3, r(GX, GY + 36, GW, 42, 'f-sky')) + dotted(4, r(GX, GY + 78, GW, 48, 'f-sky'))
  v += halftone(k => c(-150, 168, 18 * k, 'f-daySun'), [[1.9, 4], [1.45, 2], [1, 0]])
  let stars = ''
  for (let i = 0; i < 7; i++) {
    const x = GX + 12 + Math.floor(nz(600 + i) * (GW - 24))
    const y = GY + 10 + Math.floor(nz(620 + i) * 96)
    stars += blink(c(x, y, 1.6, 'f-star'), '1;.4', 3, -(i % 3))
  }
  const shooting =
    `<g opacity="0"><animate attributeName="opacity" values="0;1;0" keyTimes="0;.9;.97" calcMode="discrete" ${loop(18)}/>` +
    `<animateTransform attributeName="transform" type="translate" values="0 0;-18 8;-36 16;-54 24" keyTimes="0;.917;.933;.95" calcMode="discrete" ${loop(18)}/>` +
    `${dline(`M-64 128l-18 8`, 's-star', 2.4)}</g>`
  v += halftone(k => c(-82, 156, 15 * k, 'f-moon'), [[1.9, 4], [1.45, 2], [1, 0]]) + stars + shooting
  v += `<g><animateTransform attributeName="transform" type="translate" values="0 0;24 0;0 0" ${loop(60)}/>${halftone(k => e(-128, 186, 46 * k, 13 * k, 'f-glass'), [[1.3, 4], [1.12, 3], [1, 2]])}</g>`
  v += dotted(1, `<path d="M${GX} ${GY + GH}V${GY + 168}Q-170 ${GY + 148} -136 ${GY + 160}T-72 ${GY + 154}T${GX + GW} ${GY + 164}V${GY + GH}Z" class="f-hill"/>`)
  v += dotted(0, `<path d="M${GX} ${GY + GH}V${GY + 192}Q-160 ${GY + 176} -112 ${GY + 190}T${GX + GW} ${GY + 184}V${GY + GH}Z" class="f-hill2"/>`)
  v += dotted(0, [[-188, GY + 186, 9], [-176, GY + 180, 7], [-64, GY + 172, 8], [-52, GY + 178, 6]].map(([x, y, rad]) => c(x as number, y as number, rad as number, 'f-tree')).join(''))
  const fall = (id: string, h: number, s: number, op: number) =>
    drift(`<rect x="${GX}" y="${GY - h}" width="${GW}" height="${GH + h}" fill="url(#${id})" opacity="${op}"/>`, 0, h, s)
  v += fall('rainFar', FAR, 3, 0.45) + fall('rainNear', NEAR, 1.5, 0.85)
  let drops = ''
  for (let i = 0; i < 12; i++) {
    const x = GX + 8 + Math.floor(nz(500 + i) * (GW - 16))
    const y = GY + 8 + Math.floor(nz(520 + i) * (GH - 48))
    const drop = c(x, y, nz(540 + i) < 0.35 ? 2.6 : 1.8, 'f-glass', 'opacity=".55"') + c(x - 0.7, y - 0.7, 0.8, 'f-glass')
    drops += i % 3 === 0 ? drift(drop, 0, 84, Math.round(8 + nz(560 + i) * 8), -Math.round(nz(580 + i) * 12)) : drop
  }
  return `<g clip-path="url(#glass)">${v}${drops}</g>`
}

// The window's frame, sill and a cactus on it, and the curtains.
function windowFrame() {
  let o = dotted(0, `<path d="M${GX - 12} ${GY - 12}h${GW + 24}v${GH + 24}h-${GW + 24}z M${GX} ${GY}v${GH}h${GW}v-${GH}z" fill-rule="evenodd" class="f-frame"/>`)
  o += dline(`M${GX + GW / 2} ${GY + 3}v${GH - 6}M${GX + 3} ${GY + GH / 2}h${GW - 6}`, 's-frame', 4.4)
  // The sill, and the shade under it.
  o += dotted(0, r(GX - 24, GY + GH + 12, GW + 48, 12, 'f-frame')) + dotted(3, r(GX - 18, GY + GH + 24, GW + 36, 12, 'f-frame'))
  // A cactus in a pot toward the left end of the sill.
  const base = GY + GH + 12
  let cactus = ''
  cactus += dotted(0, `<rect x="${GX + 12}" y="${base - 46}" width="12" height="36" rx="6" class="f-leaf"/><rect x="${GX + 2}" y="${base - 36}" width="9" height="16" rx="4.5" class="f-leaf"/><rect x="${GX + 25}" y="${base - 40}" width="9" height="14" rx="4.5" class="f-leaf"/>`)
  cactus += dotted(0, `<path d="M${GX + 4} ${base - 12}h28l-4 12h-20z" class="f-pot"/>`)
  o += `<g transform="translate(8 0)">${cactus}</g>`
  // The rod, with a finial at each end, and two curtains gathered with ties,
  // the right one the left one mirrored about the window's middle.
  const mid = GX + GW / 2
  const reach = GW / 2 + 50
  o += dline(`M${mid - reach} 92H${mid + reach}`, 's-frame', 5) + dotted(0, c(mid - reach - 4, 92, 6, 'f-frame') + c(mid + reach + 4, 92, 6, 'f-frame'))
  // Each curtain: mid dots for the cloth, full dots down its folds.
  const lx = GX - 4
  const left =
    dotted(2, `<path d="M${lx - 46} 96H${lx + 6}Q${lx - 2} 216 ${lx - 18} 262Q${lx - 6} 316 ${lx - 12} 380H${lx - 46}Z" class="f-curtain"/>`) +
    dotted(0, `<path d="M${lx - 34} 100Q${lx - 34} 216 ${lx - 28} 260M${lx - 34} 274Q${lx - 36} 324 ${lx - 34} 374" class="s-curtainDark" stroke-width="10" fill="none" stroke-linecap="round"/>`) +
    dotted(0, r(lx - 44, 256, 30, 12, 'f-tie'))
  o += left + `<g transform="translate(${2 * mid} 0) scale(-1 1)">${left}</g>`
  return o
}

// Under the window: a radiator, warm air rising off it.
function radiator() {
  const y = GY + GH + 34
  const x0 = GX - 2
  const w = GW + 4
  let fins = ''
  for (let x = x0 + 4; x + 10 <= x0 + w; x += 14) fins += `<rect x="${x}" y="${y}" width="10" height="50" rx="5" class="f-rad"/>`
  let o = dotted(1, fins) + dotted(0, r(x0, y + 6, w, 6, 'f-rad') + r(x0, y + 38, w, 6, 'f-rad')) + dotted(0, r(x0 + 6, y + 50, 8, 8, 'f-rad') + r(x0 + w - 14, y + 50, 8, 8, 'f-rad'))
  o += [0, 1, 2].map(i => drift(dline(`M${x0 + 30 + i * 52} ${y - 6}q6 -8 0 -16q-6 -8 0 -16`, 's-warm', 2.6), 0, -18, 3, -i, true)).join('')
  return o
}

// Above Clawd: a shelf with two candles and a teapot letting off steam.
function candleShelf() {
  const y = 0
  let o = dotted(0, r(-226, y, 190, 8, 'f-box')) + dline(`M-212 ${y + 10}l10 14M-50 ${y + 10}l-10 14`, 's-box', 3.6)
  const candle = (x: number, h: number, delay: number) =>
    dotted(0, r(x, y - h, 14, h, 'f-wax')) +
    dotted(3, r(x - 3, y - h, 20, 4, 'f-wax')) +
    dotted(4, c(x + 7, y - h - 10, 16, 'f-flame')) +
    pulse(dotted(0, `<path d="M${x + 7} ${y - h - 18}q-5 8 0 12q5 -4 0 -12z" class="f-flame"/>`), '1 1;1 .8;1 1.15', x + 7, y - h - 6, 1, delay)
  o += candle(-208, 30, 0) + candle(-186, 20, -0.33)
  o += coffeeMachine(-110, y)
  return o
}

// The right margin's inner side, which shows as the margin widens: a retro
// sign hung on the wall, well clear of the window, and an arc floor lamp
// whose base stands toward the conversation and whose dome hangs over Clawd.
const IX = -380
// A hand's sixty steps around the dial.
const TICKS = Array.from({ length: 60 }, (_, i) => i * 6)

// A mid-century sunburst clock at (x, y), `s` times its full size: brass rays
// with a bead at each long one's tip, round a small cream face. The beads
// glint in turn and the hands keep the time.
function clock(x: number, y: number, s = 1) {
  const pt = (a: number, d: number) => [Math.round(x + Math.sin(a) * d * s), Math.round(y - Math.cos(a) * d * s)] as const
  let rays = ''
  let beads = ''
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    const long = i % 2 === 0
    const [x0, y0] = pt(a, 28)
    const [x1, y1] = pt(a, long ? 64 : 46)
    rays += `M${x0} ${y0}L${x1} ${y1}`
    if (long) {
      const [bx, by] = pt(a, 70)
      beads += blink(dotted(0, c(bx, by, 4.5 * s, 'f-brass')), '1;1;1;.45', 6, -(i / 2) * 0.5)
    }
  }
  let o = `<path d="${rays}" class="s-brass" stroke-width="${(2.4 * s).toFixed(1)}" stroke-linecap="round" fill="none" opacity=".9"/>`
  o += beads
  o += halftone(k => c(x, y, 26 * s * k, 'f-brass'), [[1.18, 3], [1, 0]])
  o += dotted(1, c(x, y, 21 * s, 'f-mat'))
  for (let h = 0; h < 12; h += 3) {
    const [hx, hy] = pt((h / 12) * Math.PI * 2, 15)
    o += c(hx, hy, 1.8 * s, 'f-brass')
  }
  const hand = (len: number, deg: number, period: number, cls: string, width: number) =>
    `<g transform="translate(${x} ${y}) rotate(${deg})"><g>${turn(`<path d="M0 ${3 * s}V${-len * s}" class="${cls}" stroke-width="${width * s}" stroke-linecap="round"/>`, TICKS, 0, 0, period, true)}</g></g>`
  o += hand(11, 300, 43200, 's-knight', 3) + hand(17, 60, 3600, 's-knight', 2.2)
  o += `<g transform="translate(${x} ${y})">${turn(`<path d="M0 ${4 * s}V${-19 * s}" class="s-flame" stroke-width="1"/>`, TICKS, 0, 0, 60, true)}</g>` + c(x, y, 2.5 * s, 'f-brass')
  return o
}

// A vintage tin sign, die-cut and lit with bulbs set into the metal: a cream
// fish-shaped plate on top with "KEEP" in tube letters, over a wide red
// banner with "SWIMMING", all edged in brass, worn and rusted a little, and
// hung from a nail on two wires.
const SX = -470
// Its middle sits on the line the lamp, painting and window share (y 302).
const SY = 265
// Tube letters: each glyph a path in a 4 x 6 box.
const TUBE: Record<string, string> = {
  K: 'M0 0V6M4 0L0 3.4M1.3 2.6L4 6',
  E: 'M4 0H0V6H4M0 3H3',
  P: 'M0 6V0H3Q4 0 4 1.5Q4 3 3 3H0',
  S: 'M4 .6Q3.6 0 2 0Q0 0 0 1.6Q0 3 2 3Q4 3 4 4.4Q4 6 2 6Q.4 6 0 5.4',
  W: 'M0 0L1 6L2 2.5L3 6L4 0',
  I: 'M2 0V6M1 0H3M1 6H3',
  M: 'M0 6V0L2 3.5L4 0V6',
  N: 'M0 6V0L4 6V0',
  G: 'M4 1Q3.6 0 2 0Q0 0 0 3Q0 6 2 6Q4 6 4 4V3H2.4',
}
// A word in tubes, centred on cx, its top at y, each unit `u` px: a dark
// outline under a light tube with a fine highlight, like the neon-look metal
// letters on old signs.
function tubeWord(word: string, cx: number, y: number, u: number, tube: string, edge: string, tilt = 0) {
  const adv = 5.6
  const total = (word.length * adv - 1.6) * u
  let d = ''
  ;[...word].forEach((ch, i) => {
    const x = cx - total / 2 + i * adv * u
    d += `<path transform="translate(${x.toFixed(1)} ${y}) skewX(${tilt}) scale(${u})" d="${TUBE[ch]}"/>`
  })
  const layer = (cls: string, width: number, extra = '') =>
    `<g class="${cls}" fill="none" stroke-width="${(width / u).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round"${extra}>${d}</g>`
  return layer(edge, u * 1.25) + layer(tube, u * 0.72) + layer('s-board', u * 0.22, ' opacity=".8"')
}
function retroSign() {
  const top = SY
  // The plate: a fish, its tail to the right, its body the plate.
  const fish = `M${SX - 74} ${top + 34}C${SX - 70} ${top + 4} ${SX - 30} ${top} ${SX + 4} ${top}C${SX + 40} ${top} ${SX + 64} ${top + 16} ${SX + 72} ${top + 30}L${SX + 104} ${top + 6}L${SX + 98} ${top + 44}L${SX + 108} ${top + 82}L${SX + 70} ${top + 62}C${SX + 60} ${top + 72} ${SX + 40} ${top + 80} ${SX + 10} ${top + 80}H${SX - 74}Z`
  // The banner: wider, its ends cut in.
  const by = top + 70
  const bw = 270
  const bh = 78
  const banner = `M${SX - bw / 2} ${by}H${SX + bw / 2}L${SX + bw / 2 - 12} ${by + bh / 2}L${SX + bw / 2} ${by + bh}H${SX - bw / 2}L${SX - bw / 2 + 12} ${by + bh / 2}Z`
  let o = '<g>' + dline(`M${SX} ${top - 46}L${SX - 60} ${top + 8}M${SX} ${top - 46}L${SX + 56} ${top + 4}`, 's-wire', 2.2) + dotted(0, c(SX, top - 48, 4, 'f-metal'))
  // A soft shadow on the wall, then the metal: brass edge, cream and red.
  o += `<g transform="translate(5 6)" opacity=".35">${dotted(2, `<path d="${fish}" class="f-ao"/><path d="${banner}" class="f-ao"/>`)}</g>`
  // Printed in the room's dots, in its muted colors.
  o += dotted(1, `<path d="${fish}" class="f-rad"/>`) + dotted(1, `<path d="${banner}" class="f-curtainDark"/>`)
  o += dotted(0, `<path d="${fish}" class="s-brass" fill="none" stroke-width="5" stroke-linejoin="round"/>`)
  o += dotted(0, `<path d="${banner}" class="s-brass" fill="none" stroke-width="5" stroke-linejoin="round"/>`)
  // Wear: a scuffed band on the plate, rust at the corners, and the eye.
  o += dotted(3, `<path d="M${SX - 66} ${top + 60}C${SX - 30} ${top + 54} ${SX + 20} ${top + 66} ${SX + 60} ${top + 58}V${top + 70}H${SX - 70}Z" class="f-boardEdge"/>`)
  o += dotted(2, c(SX + 88, top + 20, 7, 'f-pot') + c(SX - bw / 2 + 22, by + bh - 12, 8, 'f-pot') + c(SX + bw / 2 - 30, by + 12, 6, 'f-pot'))
  o += dotted(1, c(SX - 52, top + 26, 3, 'f-frame'))
  o += dline(`M${SX - bw / 2 + 18} ${by + 8}H${SX + bw / 2 - 18}`, 's-curtainDark', 2.4)
  // The words.
  o += tubeWord('KEEP', SX - 2, top + 22, 5.4, 's-wax', 's-frame')
  o += tubeWord('SWIMMING', SX + 2, by + 22, 4.7, 's-wax', 's-frame', -8)
  // The bulbs, glowing and flickering out of step.
  const bulbs: [number, number][] = [[SX - 60, top + 14], [SX + 2, top + 8], [SX + 54, top + 18], [SX - 64, top + 56], [SX + 46, top + 60],
    [SX - bw / 2 + 26, by + 16], [SX - bw / 2 + 30, by + bh - 16], [SX + bw / 2 - 26, by + bh - 18], [SX + bw / 2 - 44, by + 16], [SX + 6, by + bh - 8]]
  bulbs.forEach(([x, y], i) => {
    const bulb = dotted(4, c(x, y, 9, 'f-bulb')) + c(x, y, 3.4, 'f-bulb')
    o += i % 3 === 1 ? blink(bulb, '1;1;1;1;.5;1;1;1;1;1;1;1', 4 + (i % 4), -i * 0.7) : bulb
  })
  // Smaller than drawn, scaled about the nail.
  return `<g transform="translate(${SX} ${top - 48}) scale(.7) translate(${-SX} ${-(top - 48)})">${o}</g></g>`
}

// On the shelf over Clawd, where the teapot was: a bean-to-cup espresso
// machine, a tall box with a bean hopper on top, a little lit display and
// buttons, two spouts over a cup on the drip tray, and steam off the cup.
function coffeeMachine(x: number, y: number) {
  let o = dotted(0, `<rect x="${x - 34}" y="${y - 82}" width="68" height="82" rx="8" class="f-metal"/>`)
  o += dotted(2, `<rect x="${x - 30}" y="${y - 78}" width="10" height="74" rx="4" class="f-knight"/>`)
  // The bean hopper and its lid.
  o += dotted(1, `<path d="M${x + 2} ${y - 82}V${y - 94}H${x + 28}V${y - 82}Z" class="f-knight"/>`) + dotted(0, r(x, y - 98, 30, 5, 'f-metal'))
  // The display and buttons.
  o += r(x - 14, y - 72, 34, 12, 'f-knight') + blink(r(x - 11, y - 69, 16, 6, 'f-glass'), '1;.7', 3)
  o += [0, 1, 2].map(i => c(x - 10 + i * 10, y - 52, 2.6, i === 1 ? 'f-lamp' : 'f-board')).join('')
  // The spout block, the dark recess, the drip tray and the cup.
  o += r(x - 16, y - 44, 40, 36, 'f-knight')
  o += dotted(0, r(x - 6, y - 44, 20, 8, 'f-metal')) + r(x - 1, y - 36, 2, 4, 'f-metal') + r(x + 7, y - 36, 2, 4, 'f-metal')
  o += dotted(0, r(x - 20, y - 8, 48, 8, 'f-metal'))
  o += dotted(0, `<path d="M${x - 5} ${y - 22}h18l-2 14h-14z" class="f-mug"/>`)
  o += [0, 1].map(i => drift(dline(`M${x + 4} ${y - 26}q-4 -6 0 -11q4 -6 0 -11`, 's-puff', 2), 0, -12, 2.4, -i * 1.2, true)).join('')
  return o
}

// An arc floor lamp, the West Wing kind: a heavy marble base toward the
// conversation, a tall stem that bows over to the right and hangs a brass
// dome above Clawd, its light falling in warm dots on him and the desk.
const ARC_X = -362
const ARC_BASE = -112
function floorLamp() {
  const sy = -262
  let o = dotted(4, `<path d="M${ARC_X - 22} ${sy + 18}L${ARC_X + 22} ${sy + 18}L${ARC_X + 78} -64L${ARC_X - 78} -64Z" class="f-lamp"/>`)
  o += dotted(3, `<path d="M${ARC_X - 14} ${sy + 18}L${ARC_X + 14} ${sy + 18}L${ARC_X + 44} -64L${ARC_X - 44} -64Z" class="f-lamp"/>`)
  // The stem: up from the base, then a long bow over to the shade.
  o += dline(`M${ARC_BASE} -72V-250C${ARC_BASE} -400 ${ARC_X} -420 ${ARC_X} ${sy - 30}`, 's-metal', 5)
  o += dotted(0, e(ARC_BASE, -70, 26, 8, 'f-metal')) + dotted(2, e(ARC_BASE, -76, 22, 5, 'f-metal'))
  // The dome shade.
  o += halftone(k => `<path transform="translate(${ARC_X} ${sy}) scale(${k})" d="M-34 14C-34 -12 -18 -30 0 -30C18 -30 34 -12 34 14Z" class="f-brass"/>`, [[1.14, 3], [1, 0]])
  o += dotted(0, c(ARC_X, sy + 18, 7, 'f-bulb'))
  return o
}

function pencilCup() {
  const x = -232
  return (
    dline(`M${x + 6} -30L${x + 2} -58`, 's-lamp', 3.6) +
    dline(`M${x + 12} -30L${x + 14} -64`, 's-sleeveB', 3.6) +
    dline(`M${x + 18} -30L${x + 24} -54`, 's-print', 3.6) +
    dotted(0, r(x, -32, 26, 32, 'f-rad')) +
    dotted(2, r(x, -36, 26, 4, 'f-rad'))
  )
}

// The painting on the left wall, across from the window and the same size as
// its frame: a knight seen from behind on a crag, above a sea of clouds, with
// far peaks rising out of it and a low sun (or moon) at the horizon.
const PX = 302
const PY = GY + 68
const PW = GW + 24
const PH = GH + 24
function knightPrint() {
  let o = dotted(0, `<path d="M${PX} ${PY}h${PW}v${PH}h-${PW}z M${PX + 12} ${PY + 12}v${PH - 24}h${PW - 24}v-${PH - 24}z" fill-rule="evenodd" class="f-frame"/>`)
  o += r(PX + 12, PY + 12, PW - 24, PH - 24, 'f-mat')
  const aw = PW - 52
  const ah = PH - 52
  // A finer print than the room's: dots every 4px.
  const P = 4
  const d = (density: number, inner: string) => dotted(density, inner, P)
  const ht = (shape: (k: number) => string, rings: [number, number][]) => halftone(shape, rings, P)
  const hz = 92
  o += `<svg x="${PX + 26}" y="${PY + 26}" width="${aw}" height="${ah}">`
  o += d(4, r(0, 0, aw, ah, 'f-cloudShade')) + d(3, r(0, 0, aw, 24, 'f-cloudShade'))
  // Sky: dusk light gathering at the horizon, a low sun by day or the moon by
  // night, and thin high cloud passing.
  o += ht(k => e(aw * 0.55, hz, 96 * k, 46 * k, 'f-print'), [[1.3, 4], [1, 3], [0.6, 2]])
  o += ht(k => c(102, 62, 10 * k, 'f-daySun'), [[1.7, 3], [1, 0]]) + ht(k => c(102, 62, 10 * k, 'f-moon'), [[1.7, 3], [1, 0]])
  o += `<g><animateTransform attributeName="transform" type="translate" values="0 0;12 0;0 0" ${loop(80)}/>${d(3, e(30, 30, 46, 4, 'f-cloud') + e(110, 42, 34, 3, 'f-cloud'))}</g>`
  // Far peaks breaking through the fog.
  o += d(2, `<path d="M0 ${hz + 4}L12 ${hz - 8}L22 ${hz - 2}L38 ${hz - 22}L52 ${hz - 6}L60 ${hz + 6}H0Z" class="f-hill2"/>`)
  o += d(1, `<path d="M84 ${hz + 6}L98 ${hz - 4}L106 ${hz}L120 ${hz - 14}L${aw} ${hz - 2}V${hz + 8}H84Z" class="f-hill2"/>`)
  // The sea of clouds: rows of billows, far to near, each drifting slowly to
  // and fro, out of step with the others, brighter as they come closer.
  const row = (y: number, rad: number, seed: number, density: number, dx: number, dur: number, from = 0, to = aw) => {
    let tops = ''
    for (let x = from - rad; x < to + rad; x += rad * 1.3) tops += c(Math.round(x + (nz(seed + x) - 0.5) * rad * 0.6), Math.round(y - nz(seed + 50 + x) * rad * 0.5), Math.round(rad * (0.8 + nz(seed + 90 + x) * 0.45)), 'f-cloud')
    const body = d(Math.min(4, density + 2), r(from - 20, y, to - from + 40, 60, 'f-cloudShade')) + d(density, tops)
    return `<g><animateTransform attributeName="transform" type="translate" values="0 0;${dx} 0;0 0" ${loop(dur)}/>${body}</g>`
  }
  o += row(hz + 8, 7, 900, 3, 6, 40)
  o += row(hz + 22, 9, 930, 2, -8, 52)
  o += row(hz + 40, 11, 960, 1, 10, 64)
  // The crag he stands on.
  const fx = 64
  const fy = 136
  o += d(0, `<path d="M${fx - 40} ${ah}L${fx - 26} ${fy + 14}L${fx - 12} ${fy + 2}L${fx + 4} ${fy}L${fx + 18} ${fy + 6}L${fx + 30} ${fy + 22}L${fx + 44} ${ah}Z" class="f-rock"/>`)
  o += d(1, `<path d="M${fx - 26} ${fy + 14}L${fx - 12} ${fy + 2}L${fx - 4} ${fy + 4}L${fx - 16} ${fy + 26}Z" class="f-cloudShade"/>`)
  // Near fog curling round the foot of the crag.
  o += row(ah - 14, 12, 990, 0, -6, 46, -10, fx - 30) + row(ah - 10, 12, 1020, 0, 6, 50, fx + 36, aw + 10)
  // The knight, from behind: legs, a cape in the wind, pauldrons, a helm with
  // its plume streaming, and his sword planted point-down at his side.
  let k = d(0, '<path d="M-9 0L-7 -30H-1V0ZM1 0V-30H7L9 0Z" class="f-knight"/>')
  k += d(0, '<path d="M-11 -30L-15 -50Q0 -58 15 -50L11 -30Z" class="f-knight"/>')
  k += `<path d="M22 2V-34M15 -28H29" class="s-metal" stroke-width="2.4" stroke-linecap="round"/>` + d(0, c(22, -37, 3, 'f-metal'))
  const cape = d(0, '<path d="M-11 -54C-15 -40 -15 -28 -11 -16L10 -14C20 -18 28 -24 34 -20C26 -32 18 -44 11 -54Z" class="f-cape"/>')
  k += `<g><animateTransform attributeName="transform" type="rotate" values="-2 0 -54;3 0 -54;-2 0 -54" ${loop(7)}/>${cape}</g>`
  k += d(0, '<path d="M-17 -48Q-16 -56 -6 -56H6Q16 -56 17 -48Z" class="f-knight"/>')
  k += d(0, '<path d="M-7 -55V-70Q0 -78 7 -70V-55Z" class="f-knight"/>')
  k += `<g><animateTransform attributeName="transform" type="rotate" values="-5 0 -74;7 0 -74;-5 0 -74" ${loop(5)}/>${d(0, '<path d="M-2 -74C2 -86 16 -86 24 -78C16 -79 8 -75 3 -70Z" class="f-cape"/>')}</g>`
  o += `<g transform="translate(${fx} ${fy})">${k}</g>`
  o += '</svg>'
  return o
}

function floorShelf() {
  // Under the painting, standing on the desk: two metal ladder frames with
  // rungs, a cross brace low between them, and four long white boards resting
  // on the rungs and running well out past both frames. Empty for now.
  const x0 = 60
  const w = 480
  const boards = [-46, -156, -266, -376]
  const top = -410
  const [f1, f2] = [x0 + 130, x0 + w - 130]
  let o = ''
  for (const fx of [f1, f2]) {
    let d = `M${fx - 18} 0V${top}M${fx + 18} 0V${top}M${fx - 18} ${top}H${fx + 18}`
    for (let y = -24; y > top; y -= 34) d += `M${fx - 18} ${y}H${fx + 18}`
    o += `<path d="${d}" class="s-metal" stroke-width="2.8" fill="none" stroke-linecap="round" opacity=".85"/>`
  }
  o += `<path d="M${f1 + 18} -6L${f2 - 18} -40M${f1 + 18} -40L${f2 - 18} -6" class="s-metal" stroke-width="2.2" fill="none" opacity=".8"/>`
  // Wooden boards: warm brown tops with a few grain lines and a darker edge.
  for (const y of boards) {
    o += dotted(0, r(x0, y, w, 14, 'f-curtain')) + r(x0, y + 11, w, 3, 'f-curtainDark')
    o += `<path d="M${x0 + 8} ${y + 4}h${w * 0.3}q14 2 28 0h${w * 0.4}M${x0 + 30} ${y + 8}h${w * 0.25}q10 -2 20 0h${w * 0.5}" class="s-curtainDark" stroke-width="1" fill="none" opacity=".7"/>`
    o += dotted(3, r(x0 + 4, y + 14, w - 8, 6, 'f-deskLine'))
  }
  o += books(f1 + 18, f2 - 18, boards[0] as number, 0) + turntable(x0 + w / 2, boards[1] as number) + vinylRow(f1 + 18, f2 - 18, boards[2] as number) + books(f1 + 18, f2 - 18, boards[3] as number, 1)
  o += shelfSides((x0 + f1 - 18) / 2, (f2 + 18 + x0 + w) / 2, boards)
  return o
}

// A few records in a metal rack on a board between the two ladders (from
// `a` to `b`), centred: a wooden base, a low front bar and a taller back bar
// joined by rails, and the sleeves fanned back between them.
function vinylRow(a: number, b: number, y: number) {
  const colors = ['f-sleeveA', 'f-lamp', 'f-sleeveB', 'f-print', 'f-cape', 'f-rad', 'f-leaf']
  const cx = Math.round((a + b) / 2)
  const w = 104
  const x0 = cx - w / 2
  // The back bar, behind the records.
  let o = dline(`M${x0 + 4} ${y - 8}V${y - 46}M${x0 + w - 4} ${y - 8}V${y - 46}M${x0 + 4} ${y - 46}H${x0 + w - 4}`, 's-metal', 3.4)
  // The records, each leaning back a little more than the one before.
  colors.forEach((cls, i) => {
    const x = x0 + 10 + i * 13
    const deg = -16 + i * 4
    o += dotted(1, `<rect transform="rotate(${deg} ${x + 4} ${y - 8})" x="${x}" y="${y - 70}" width="8" height="62" class="${cls}"/>`)
    o += dotted(3, `<rect transform="rotate(${deg} ${x + 4} ${y - 8})" x="${x + 8}" y="${y - 68}" width="2" height="60" class="f-vinyl"/>`)
  })
  // The base and the low front bar, in front.
  o += dotted(0, r(x0, y - 8, w, 8, 'f-box'))
  o += dline(`M${x0 + 4} ${y - 8}V${y - 24}H${x0 + w - 4}V${y - 8}`, 's-metal', 3.4)
  return o
}

// What stands on the boards' ends, outside the ladders: `lx` and `rx` are
// the middles of the left and right ends. Bottom: a big leafy plant and a
// woven basket. Second: two candles and the espresso machine. Third: a
// trailing pothos and the knight's helm. Top: a vase of dried branches and
// a little globe.
function shelfSides(lx: number, rx: number, boards: number[]) {
  const [b1, b2, b3, b4] = boards as [number, number, number, number]
  let o = ''
  // Bottom left: a leafy plant in a tall pot.
  o += dotted(0, `<path d="M${lx - 20} ${b1 - 34}h40l-6 34h-28z" class="f-pot"/>`) + dotted(2, r(lx - 20, b1 - 38, 40, 6, 'f-pot'))
  o += dotted(0, [[-18, -52, 13], [12, -58, 14], [-4, -72, 12], [22, -44, 10], [-24, -40, 9]].map(([dx, dy, rad]) => c(lx + (dx as number), b1 + (dy as number), rad as number, 'f-leaf')).join(''))
  o += dotted(1, [[4, -50, 9], [-14, -64, 8], [16, -70, 7]].map(([dx, dy, rad]) => c(lx + (dx as number), b1 + (dy as number), rad as number, 'f-leaf2')).join(''))
  // Bottom right: a bowl of ramen, under the coffee machine: noodles, a
  // halved egg, nori and chopsticks across the rim, steam rising.
  o += dotted(0, `<path d="M${rx - 30} ${b1 - 30}c0 12 6 24 16 28h28c10 -4 16 -16 16 -28z" class="f-cape"/>`) + dotted(0, r(rx - 10, b1 - 4, 20, 4, 'f-cape'))
  o += dotted(2, r(rx - 26, b1 - 22, 52, 4, 'f-lamp'))
  o += dotted(0, `<path d="M${rx - 30} ${b1 - 30}h60l-2 4h-56z" class="f-lamp"/>`)
  o += dline(`M${rx - 22} ${b1 - 32}q4 -5 8 0t8 0t8 0t8 0`, 's-lamp', 2.2)
  o += dotted(0, `<path d="M${rx - 22} ${b1 - 30}v-14h8v14z" class="f-knight"/>`)
  o += dotted(0, c(rx + 6, b1 - 33, 7, 'f-wax')) + dotted(0, c(rx + 6, b1 - 33, 3.4, 'f-flame'))
  o += dline(`M${rx - 6} ${b1 - 54}L${rx + 34} ${b1 - 30}M${rx - 2} ${b1 - 58}L${rx + 36} ${b1 - 34}`, 's-frame', 2.6)
  o += [0, 1, 2].map(i => drift(dline(`M${rx - 12 + i * 10} ${b1 - 38}q-4 -6 0 -11q4 -6 0 -11`, 's-puff', 2), 0, -12, 2.6, -i * 0.9, true)).join('')
  // Second left: a plush Eric Cartman sitting on the board: brown trousers,
  // round red jacket, yellow mittens, a big round face and the blue beanie
  // with its yellow band and pompom.
  const cx = lx
  const by = b2
  o += dotted(0, r(cx - 20, by - 8, 16, 8, 'f-knight') + r(cx + 4, by - 8, 16, 8, 'f-knight'))
  o += dotted(0, r(cx - 22, by - 16, 44, 10, 'f-pot'))
  o += dotted(0, `<ellipse cx="${cx}" cy="${by - 28}" rx="28" ry="17" class="f-cape"/>`)
  o += dline(`M${cx} ${by - 42}V${by - 14}`, 's-knight', 1.4)
  o += dotted(0, c(cx - 28, by - 26, 6, 'f-lamp') + c(cx + 28, by - 26, 6, 'f-lamp'))
  o += dotted(0, `<ellipse cx="${cx}" cy="${by - 58}" rx="24" ry="20" class="f-cloud"/>`)
  o += dotted(0, `<path d="M${cx - 22} ${by - 66}Q${cx} ${by - 98} ${cx + 22} ${by - 66}Z" class="f-sleeveB"/>`)
  o += dotted(0, r(cx - 23, by - 70, 46, 6, 'f-lamp')) + dotted(0, c(cx, by - 88, 5, 'f-lamp'))
  o += c(cx - 6, by - 60, 4.4, 'f-board') + c(cx + 6, by - 60, 4.4, 'f-board') + c(cx - 5, by - 60, 1.4, 'f-knight') + c(cx + 5, by - 60, 1.4, 'f-knight')
  o += dline(`M${cx - 5} ${by - 49}q5 3 10 0`, 's-knight', 1.4)
  // Second right: the espresso machine, a touch smaller to fit.
  o += `<g transform="translate(${rx} ${b2}) scale(.82) translate(${-rx} ${-b2})">${coffeeMachine(rx, b2)}</g>`
  // Third left: a pothos spilling over the board's edge.
  o += dotted(0, `<path d="M${lx - 16} ${b3 - 24}h32l-4 24h-24z" class="f-pot"/>`)
  o += dotted(0, [[-10, -30, 8], [6, -32, 9], [-2, -40, 7]].map(([dx, dy, rad]) => c(lx + (dx as number), b3 + (dy as number), rad as number, 'f-leaf')).join(''))
  o += turn(vine(lx - 22, b3 + 2, 22, -8, 91) + vine(lx + 22, b3 + 2, 18, 7, 93), [-2, 2, -2], lx, b3, 7)
  // Third right: the knight's helm on a little stand.
  o += dotted(0, r(rx - 18, b3 - 6, 36, 6, 'f-box'))
  o += dotted(0, `<path d="M${rx - 14} ${b3 - 6}V${b3 - 36}Q${rx} ${b3 - 54} ${rx + 14} ${b3 - 36}V${b3 - 6}Z" class="f-metal"/>`)
  o += dotted(0, r(rx - 11, b3 - 32, 22, 3, 'f-knight')) + dotted(0, `<path d="M${rx} ${b3 - 48}c4 -12 16 -14 24 -6c-10 0 -14 2 -20 10z" class="f-cape"/>`)
  // Top left: a tall vase of dried branches.
  o += dline(`M${lx} ${b4 - 40}L${lx - 18} ${b4 - 90}M${lx} ${b4 - 40}L${lx + 4} ${b4 - 98}M${lx} ${b4 - 40}L${lx + 20} ${b4 - 84}`, 's-deskLine', 2.4)
  o += dotted(0, `<path d="M${lx - 11} ${b4}L${lx - 15} ${b4 - 26}Q${lx} ${b4 - 48} ${lx + 15} ${b4 - 26}L${lx + 11} ${b4}Z" class="f-sleeveB"/>`)
  // Top right: a little globe on its stand.
  o += dotted(0, r(rx - 12, b4 - 6, 24, 6, 'f-brass')) + dline(`M${rx} ${b4 - 6}V${b4 - 16}`, 's-brass', 3)
  o += halftone(k => c(rx, b4 - 40, 22 * k, 'f-sky'), [[1.1, 2], [1, 0]]) + dotted(1, `<path d="M${rx - 12} ${b4 - 50}q10 -6 16 4q6 8 -4 14q-10 2 -12 -8z" class="f-leaf"/>`)
  o += `<path d="M${rx - 26} ${b4 - 40}A26 26 0 0 1 ${rx + 26} ${b4 - 40}" class="s-brass" fill="none" stroke-width="2.4"/>`
  return o
}

// Books on a board between the ladders (from `a` to `b`), centred: a run
// standing upright, one leaning, and a short stack lying flat beside them.
// `v` picks one of two arrangements so the boards don't repeat.
function books(a: number, b: number, y: number, v: number) {
  const runs: [number, number, string][][] = [
    [[11, 58, 'f-sleeveB'], [9, 52, 'f-cape'], [12, 62, 'f-rad'], [8, 48, 'f-lamp'], [11, 56, 'f-leaf'], [10, 60, 'f-print'], [9, 50, 'f-sleeveA']],
    [[10, 50, 'f-print'], [12, 58, 'f-leaf'], [9, 46, 'f-sleeveB'], [11, 54, 'f-cape'], [10, 52, 'f-rad']],
  ]
  const run = runs[v % 2] as [number, number, string][]
  const stackW = 52
  const span = run.reduce((t, [bw]) => t + bw + 1, 0) + 14 + stackW
  let x = Math.round((a + b - span) / 2)
  let o = ''
  const order = v % 2 ? 'stack-first' : 'books-first'
  const stack = (sx: number) =>
    dotted(1, r(sx, y - 9, stackW, 9, 'f-sleeveA') + r(sx + 3, y - 18, stackW - 6, 9, 'f-rad')) + dotted(0, r(sx + 1, y - 27, stackW - 4, 9, 'f-lamp'))
  if (order === 'stack-first') {
    o += stack(x)
    x += stackW + 6
  }
  for (const [bw, bh, cls] of run) {
    o += dotted(1, r(x, y - bh, bw, bh, cls)) + dotted(3, r(x + 2, y - bh + 8, bw - 4, 3, 'f-board'))
    x += bw + 1
  }
  o += dotted(1, `<rect transform="rotate(16 ${x} ${y})" x="${x}" y="${y - 50}" width="9" height="50" class="f-sleeveB"/>`)
  x += 14
  if (order === 'books-first') o += stack(x)
  return o
}

// A record player on a board: a wooden plinth, the platter with a record
// turning, the tonearm on it, and notes drifting up.
function turntable(cx: number, y: number) {
  const x = cx - 70
  let o = dotted(0, r(x, y - 34, 140, 34, 'f-box')) + dotted(2, r(x, y - 40, 140, 6, 'f-box'))
  o += dotted(0, c(x + 122, y - 17, 5, 'f-label')) + dotted(1, c(x + 106, y - 17, 4, 'f-metal'))
  o += dotted(0, e(x + 56, y - 44, 46, 10, 'f-vinyl')) + dotted(0, e(x + 56, y - 44, 12, 3.5, 'f-label'))
  o += `<g transform="translate(${x + 56} ${y - 44}) scale(1 .24)">${turn(c(32, 0, 4.4, 'f-mat'), [0, 360], 0, 0, 1.8)}</g>`
  o += dline(`M${x + 124} ${y - 40}L${x + 120} ${y - 62}L${x + 90} ${y - 54}`, 's-metal', 3.8) + dotted(0, c(x + 124, y - 40, 5, 'f-metal'))
  const NOTE = ['..x', '..x', '..x', 'xxx', 'xx.']
  const note = (k: number) => {
    let d = ''
    NOTE.forEach((row, ny) => [...row].forEach((ch, nx) => (d += ch === 'x' ? c(nx * 3.2, ny * 3.2, 1.5, 'f-note') : '')))
    return `<g transform="translate(${x + 40 + k * 16} ${y - 64})">${drift(d, 14, -40, 4, -k * 1.33, true)}</g>`
  }
  return o + note(0) + note(1) + note(2)
}

// Hanging from the ceiling in the far left corner: a round paper lantern,
// its ribs showing, lit warm from inside, swaying a little on its cord.
function paperLamp() {
  const x = 150
  const y = 302
  const R = 52
  let o = dline(`M${x} 0V${y - R - 6}`, 's-wire', 2.4) + dotted(0, r(x - 7, y - R - 8, 14, 8, 'f-metal'))
  o += halftone(k => c(x, y, R * k, 'f-bulb'), [[1.7, 4], [1.35, 3], [1.12, 2]])
  o += c(x, y, R, 'f-board') + halftone(k => c(x, y + 4, R * k, 'f-bulb'), [[0.85, 3], [0.55, 1]])
  let ribs = ''
  for (let i = -3; i <= 3; i++) {
    const dy = (i / 4) * R
    const half = Math.sqrt(R * R - dy * dy)
    ribs += `M${(x - half).toFixed(1)} ${(y + dy).toFixed(1)}Q${x} ${(y + dy + 8).toFixed(1)} ${(x + half).toFixed(1)} ${(y + dy).toFixed(1)}`
  }
  o += `<path d="${ribs}" class="s-boardEdge" stroke-width="1.4" fill="none" opacity=".7"/>`
  o += dotted(0, c(x, y + R - 2, 6, 'f-metal'))
  return turn(o, [-1.2, 1.2, -1.2], x, 0, 8)
}

// A trailing vine: a dotted stem curving down with small leaves on alternate
// sides.
function vine(x: number, y: number, len: number, bend: number, seed: number) {
  let leaves = ''
  for (let k = 10; k < len; k += 12) {
    const t = k / len
    const lx = x + Math.sin(t * Math.PI) * bend + (Math.floor(k / 12) % 2 ? 5 : -5)
    leaves += c(Math.round(lx), y + k, 4.4 + nz(seed + k) * 1.4, Math.floor(k / 12) % 3 === 1 ? 'f-leaf2' : 'f-leaf')
  }
  return dline(`M${x} ${y}Q${x + bend * 2} ${y + len / 2} ${x} ${y + len}`, 's-leaf', 2.2) + dotted(0, leaves)
}

// The wall as a surface in a room: soft shadow gathers at each side, where
// the wall turns the corner, so it sits back between them.
function wallSurface() {
  const fade = (id: string) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="s-ao" stop-opacity=".6"/><stop offset=".45" class="s-ao" stop-opacity=".21"/><stop offset="1" class="s-ao" stop-opacity="0"/></linearGradient>`
  return (
    `<defs>${fade('aoLeft')}${fade('aoRight')}</defs>` +
    at('0', '0', r(0, 0, 170, 6000, '', 'fill="url(#aoLeft)"')) +
    at('100%', '0', `<g transform="scale(-1 1)">${r(0, 0, 170, 6000, '', 'fill="url(#aoRight)"')}</g>`)
  )
}

// The desk along the bottom: a top the prompt box rests on, and one long
// drawer front under it, shaded in small dots toward its bottom edge.
function desk() {
  // One long drawer front the whole width, no knobs.
  const fronts = `<rect x="5" y="${-SILL + 5}" width="5990" height="${SILL - 5}"/>`
  const shade = `<rect x="5" y="-12" width="5990" height="12"/>`
  return at(
    '0',
    '100%',
    r(0, -DESK, 6000, DESK - SILL, 'f-deskTop') +
      dotted(4, r(0, -DESK + 6, 6000, 18, 'f-deskDot')) +
      dotted(2, r(0, -SILL - 9, 6000, 9, 'f-deskDot')) +
      dline(`M3 ${-DESK + 3}H6000`, 's-deskDot', 3.6) +
      r(0, -SILL, 6000, SILL, 'f-deskFront') +
      `<g class="f-drawer">${fronts}</g>` +
      dotted(3, `<g class="f-deskLine">${shade}</g>`),
  )
}

// Clawd at the desk, one dot per pixel, turned a little and typing on the
// laptop in front of him. Its screen lights his face, and his mug steams.
function corner() {
  const sheet = clawdSheet()
  const H = sheet.height
  // A run of pixels in a fixed color, or in one of the palette's (`f-` classes).
  const p = (x: number, y: number, w: number, h: number, fill: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${fill.startsWith('f-') ? `class="${fill}"` : `fill="${fill}"`}/>`
  const glow = `<g mask="url(#c3)" opacity=".7">${c(10.5, 7, 9, '', 'fill="#8FA8FF"')}</g>`
  const laptop = p(5, 10, 12, 6, '#8E95A8') + p(6, 11, 10, 4, '#A3AABC') + p(10, 12, 2, 2, '#E9ECF4') + p(3, 16, 16, 1, '#5E6372')
  const steam = [0, 1].map(i => drift(p(29 + i, H - 9, 1, 1, 'f-puff') + p(30 - i, H - 11, 1, 1, 'f-puff'), 1, -6, 2, -i, true)).join('')
  const mug = p(27, H - 7, 5, 6, 'f-mug') + p(27, H - 5, 5, 1, '#F2A25C') + p(27, H - 7, 5, 1, '#6B4630') + p(32, H - 5, 1, 2, 'f-mug')
  return (
    `<g class="corner" transform="translate(-440 17) scale(6)"><g transform="translate(0 ${-H})">` +
    glow +
    `<g mask="url(#c0)">${sheet.body}${laptop}${mug}${steam}</g>` +
    '</g></g>'
  )
}

// The middle of the window is the conversation's and stays empty. Each side
// is drawn in its own frame at the window's edge, SIDE wide: at full size
// when the frame holds SIDE_W pixels, scaled down whole when it holds fewer,
// so nothing ever reaches into the middle. A top frame hangs from the
// ceiling, its pieces stacked and centered; a bottom frame stands on the desk.
const SIDE = 22
const SIDE_W = 580
const TOP_H = 900
const BOTTOM_H = 470
function side(left: boolean, top: boolean, inner: string) {
  const h = top ? TOP_H : BOTTOM_H
  const box = `${left ? 0 : -SIDE_W} ${top ? 0 : -h} ${SIDE_W} ${h}`
  const align = top ? 'xMidYMin' : `${left ? 'xMin' : 'xMax'}YMax`
  const frame =
    `<svg x="${left ? 0 : 100 - SIDE}%" y="0" width="${SIDE}%" height="100%" viewBox="${box}" ` +
    `preserveAspectRatio="${align} meet" overflow="visible">${inner}</svg>`
  return top ? frame : `<g transform="translate(0 ${-DESK})">${frame}</g>`
}

// Moves a piece drawn around (x0, y0) to (x, y), scaled by s.
const place = (inner: string, x0: number, y0: number, x: number, y: number, s: number) =>
  `<g transform="translate(${x} ${y}) scale(${s}) translate(${-x0} ${-y0})">${inner}</g>`

// A darker column down the middle, behind the conversation, fading out
// toward the sides: [offset, opacity].
const VEIL: [number, number][] = [[0.19, 0], [0.24, 0.7], [0.76, 0.7], [0.81, 0]]

let SCENE: string | undefined

export function sceneSvg(): string {
  if (SCENE) return SCENE
  let o = ''

  // Color first: the wall, cool light from the window, a rose glow, warmth
  // rising from the desk, and the paper's own fine dots.
  o += '<rect width="100%" height="100%" fill="url(#wall)"/>'
  o += '<rect width="100%" height="100%" fill="url(#gCool)" class="o-cool"/>'
  o += '<rect width="100%" height="100%" fill="url(#gRose)" class="o-rose"/>'
  o += '<rect width="100%" height="100%" fill="url(#gFloor)" class="o-floor"/>'
  o += '<rect width="100%" height="100%" fill="url(#tex)" class="o-tex"/>'
  o += wallSurface()
  // Shade on the wall above the desk, in dots that grow toward it.
  o += at('0', '100%', dotted(4, r(0, -DESK - 132, 6000, 60, 'f-shade')) + dotted(3, r(0, -DESK - 72, 6000, 72, 'f-shade')))
  // The middle, darker and empty, for the conversation.
  o +=
    `<defs><linearGradient id="veil" x1="0" y1="0" x2="1" y2="0">` +
    VEIL.map(([at, op]) => `<stop offset="${at}" class="s-mid" stop-opacity="${op}"/>`).join('') +
    `</linearGradient></defs><rect width="100%" height="100%" fill="url(#veil)"/>`

  // Left, hanging: the paper lantern and its warmth over the knight painting.
  // Right, hanging: the sign over the window. Each piece is moved from where
  // it was drawn (its center) to its place in the stack, and enlarged.
  o += side(true, true,
    `<circle cx="290" cy="200" r="340" fill="url(#gWarm)" class="o-warm"/>` +
    place(paperLamp(), 150, 302, 290, 200, 2) +
    place(knightPrint(), PX + PW / 2, PY + PH / 2, 290, 644, 2))
  o += side(false, true,
    place(retroSign(), SX, SY + 50, -290, 190, 1.6) +
    place(`<g transform="translate(${-PAD - 40} 80)">${windowView() + windowFrame()}</g>`, -190, 315, -290, 616, 1.6))
  // Right, standing: the arc lamp and its warmth.
  o += side(false, false, `<circle cx="${ARC_X}" cy="-176" r="220" fill="url(#gWarm)" class="o-warm" opacity=".8"/><g transform="translate(0 ${DESK})">${floorLamp()}</g>`)

  // The desk along the whole bottom, then what stands on it: the pencil cup
  // and Clawd on the right, the open shelf on the left.
  o += desk()
  o += side(false, false, `<g transform="translate(0 18)">${pencilCup()}</g>${corner()}`)
  o += side(true, false, `<g transform="translate(0 14)">${floorShelf()}</g>`)
  SCENE = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><style>${BASE_STYLE}</style>${defs()}${o}</svg>`
  return SCENE
}

export const SCENE_ALT = 'Clawd typing at his desk in a cozy room under a painting of a knight above a sea of clouds, rain at the window'
