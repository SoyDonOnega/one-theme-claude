// Renders the scene in different drawing techniques by swapping the tile each
// dot pattern uses, how dotted lines are dashed, and adding a filter/overlay.
const fs = require('fs'), path = require('path')
const base = fs.readFileSync('build/scene.js', 'utf8')
const { chromium } = require('playwright')
const outDir = 'styles'
fs.mkdirSync(outDir, { recursive: true })

const q = (pt, rad) => rad / (pt * 0.433) // 1 = full dot, small = speck
const OP = [1, 0.82, 0.6, 0.4, 0.22]
const dens = rad => [2.6, 2.1, 1.6, 1.15, 0.75].reduce((b, r, i, a) => (Math.abs(r - rad) < Math.abs(a[b] - rad) ? i : b), 0)

const paper = (id, op, freq = 0.9) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .93  0 0 0 0 .85  0 0 0 0 .7  0 0 0 ${op} 0"/></filter>`
const vignette = `<radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>`

const STYLES = {
  '01-ghibli': {
    name: 'Acuarela Ghibli',
    tile: (pt, rad, paint, s) => `<rect width="${pt}" height="${pt}" style="fill:${paint}" opacity="${OP[dens(rad * 6 / pt)]}"/>`,
    dash: () => 'none', cap: 'round',
    defs: `<filter id="F" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".7"/></filter>${paper('P', 0.16, 0.55)}${vignette}`,
    filter: 'F', overlay: '<rect width="100%" height="100%" filter="url(#P)"/><rect width="100%" height="100%" fill="url(#vg)" opacity=".7"/>',
  },
  '02-pixel': {
    name: 'Pixel art 16 bits',
    tile: (pt, rad, paint) => { const w = Math.max(1, Math.round(pt * Math.min(1, q(pt, rad) * 1.05))); const o = (pt - w) / 2; return `<rect x="${o}" y="${o}" width="${w}" height="${w}" style="fill:${paint}" shape-rendering="crispEdges"/>` },
    dash: p => `0 ${p}`, cap: 'square',
    mask: rr => `<rect x="${0.5 - rr}" y="${0.5 - rr}" width="${rr * 2}" height="${rr * 2}" fill="#fff"/>`,
    defs: '', filter: '', overlay: '',
  },
  '03-futurista': {
    name: 'Futurista holográfico',
    tile: (pt, rad, paint) => { const h = Math.max(0.5, pt * 0.5 * q(pt, rad)); return `<rect y="${(pt - h) / 2}" width="${pt}" height="${h.toFixed(2)}" style="fill:${paint}"/>` },
    dash: p => `${p * 0.6} ${p * 0.4}`, cap: 'butt',
    defs: `<filter id="F"><feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.2" fill="#000" opacity=".35"/></pattern>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#E6B87A" stroke-width=".6" opacity=".12"/></pattern>${vignette}`,
    filter: 'F', overlay: '<rect width="100%" height="100%" fill="url(#grid)"/><rect width="100%" height="100%" fill="url(#scan)"/><rect width="100%" height="100%" fill="url(#vg)"/>',
  },
  '04-grabado': {
    name: 'Grabado a buril',
    tile: (pt, rad, paint) => `<path d="M0 ${pt}L${pt} 0M${-pt / 2} ${pt / 2}L${pt / 2} ${-pt / 2}M${pt / 2} ${pt * 1.5}L${pt * 1.5} ${pt / 2}" style="stroke:${paint}" stroke-width="${(pt * 0.42 * q(pt, rad)).toFixed(2)}"/>`,
    dash: () => 'none', cap: 'round',
    defs: `${paper('P', 0.22, 1.2)}${vignette}`, filter: '', overlay: '<rect width="100%" height="100%" filter="url(#P)"/><rect width="100%" height="100%" fill="url(#vg)" opacity=".8"/>',
  },
  '05-punto-cruz': {
    name: 'Punto de cruz bordado',
    tile: (pt, rad, paint) => { const a = pt * 0.18, b = pt * 0.82; return `<path d="M${a} ${a}L${b} ${b}M${b} ${a}L${a} ${b}" style="stroke:${paint}" stroke-width="${(1.9 * q(pt, rad) * pt / 6).toFixed(2)}" stroke-linecap="round"/>` },
    dash: p => `0 ${p}`, cap: 'round',
    defs: `<pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="0" cy="0" r=".6" fill="#000" opacity=".35"/></pattern>${paper('P', 0.1, 1.6)}`,
    filter: '', overlay: '<rect width="100%" height="100%" fill="url(#weave)"/><rect width="100%" height="100%" filter="url(#P)"/>',
  },
  '06-mosaico': {
    name: 'Mosaico de azulejos',
    tile: (pt, rad, paint) => `<rect x="${pt * 0.08}" y="${pt * 0.08}" width="${pt * 0.84}" height="${pt * 0.84}" rx="${pt * 0.18}" style="fill:${paint}" opacity="${OP[dens(rad * 6 / pt)]}"/>`,
    dash: p => `0 ${p}`, cap: 'square',
    defs: `<filter id="F"><feSpecularLighting surfaceScale="1.5" specularConstant=".5" specularExponent="18" lighting-color="#fff6e0" result="s"><fePointLight x="900" y="-300" z="500"/></feSpecularLighting><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k2="1" k3=".25"/></filter>`,
    filter: 'F', overlay: '',
  },
  '07-plano': {
    name: 'Plano técnico (blueprint)',
    tile: (pt, rad, paint) => `<circle cx="${pt / 2}" cy="${pt / 2}" r="${Math.max(0.6, rad * 0.9).toFixed(2)}" fill="none" style="stroke:${paint}" stroke-width=".7"/>`,
    dash: () => 'none', cap: 'round',
    defs: `<pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#E6B87A" stroke-width=".5" opacity=".14"/></pattern><pattern id="grid2" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="#E6B87A" stroke-width="1" opacity=".18"/></pattern>`,
    filter: '', overlay: '<rect width="100%" height="100%" fill="url(#grid)"/><rect width="100%" height="100%" fill="url(#grid2)"/>',
  },
  '08-terminal': {
    name: 'Terminal ASCII',
    tile: (pt, rad, paint) => { const k = q(pt, rad); const a = pt * 0.42 * k, m = pt / 2, w = (0.5 + 0.9 * k).toFixed(2); return k > 0.75 ? `<path d="M${m - a} ${m}H${m + a}M${m} ${m - a}V${m + a}M${m - a * .7} ${m - a * .7}L${m + a * .7} ${m + a * .7}M${m + a * .7} ${m - a * .7}L${m - a * .7} ${m + a * .7}" style="stroke:${paint}" stroke-width="${w}"/>` : k > 0.45 ? `<path d="M${m - a} ${m}H${m + a}M${m} ${m - a}V${m + a}" style="stroke:${paint}" stroke-width="${w}"/>` : `<rect x="${m - .6}" y="${m - .6}" width="1.2" height="1.2" style="fill:${paint}"/>` },
    dash: p => `0 ${p}`, cap: 'square',
    defs: `<filter id="F"><feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter><pattern id="scan" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="1" fill="#000" opacity=".3"/></pattern>${vignette}`,
    filter: 'F', overlay: '<rect width="100%" height="100%" fill="url(#scan)"/><rect width="100%" height="100%" fill="url(#vg)"/>',
  },
  '09-ukiyoe': {
    name: 'Ukiyo-e / ilustración plana',
    tile: (pt, rad, paint) => `<rect width="${pt}" height="${pt}" style="fill:${paint}" opacity="${[1, 1, 0.75, 0.5, 0.28][dens(rad * 6 / pt)]}"/>`,
    dash: () => 'none', cap: 'round',
    defs: `<filter id="F"><feMorphology in="SourceAlpha" operator="dilate" radius="1.2" result="d"/><feFlood flood-color="#0E0B08"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>${paper('P', 0.14, 0.7)}`,
    filter: 'F', overlay: '<rect width="100%" height="100%" filter="url(#P)"/>',
  },
  '10-vidriera': {
    name: 'Vidriera',
    tile: (pt, rad, paint) => { const k = Math.min(1, q(pt, rad) * 1.1) * pt * 0.5, m = pt / 2; return `<path d="M${m} ${m - k}L${m + k} ${m}L${m} ${m + k}L${m - k} ${m}Z" style="fill:${paint}"/>` },
    dash: p => `0 ${p}`, cap: 'square',
    defs: `<filter id="F"><feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="b"/><feComponentTransfer in="b" result="b2"><feFuncA type="linear" slope=".7"/></feComponentTransfer><feMerge><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge></filter>${vignette}`,
    filter: 'F', overlay: '<rect width="100%" height="100%" fill="url(#vg)" opacity=".8"/>',
  },
}

;(async () => {
  const b = await chromium.launch()
  for (const [id, st] of Object.entries(STYLES)) {
    globalThis.__T = st
    let src = base
      .replace('<circle cx="${pt / 2}" cy="${pt / 2}" r="${rad.toFixed(2)}" style="fill:${paint}"/>', '${globalThis.__T.tile(pt, rad, paint)}')
      .replace('stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="0 ${PITCH}"', 'stroke-linecap="${globalThis.__T.cap}" stroke-linejoin="round" stroke-dasharray="${globalThis.__T.dash(PITCH)}"')
      .replace('<circle cx=".5" cy=".5" r="${(rad / PITCH).toFixed(3)}" fill="#fff"/>', '${globalThis.__T.mask ? globalThis.__T.mask(rad / PITCH) : `<circle cx=".5" cy=".5" r="${(rad / PITCH).toFixed(3)}" fill="#fff"/>`}')
      .replace('${defs()}${o}</svg>', '${defs()}<defs>${globalThis.__T.defs}</defs><g${globalThis.__T.filter ? ` filter="url(#${globalThis.__T.filter})"` : ""}>${o}</g>${globalThis.__T.overlay}</svg>')
    if (!src.includes('__T.tile') || !src.includes('__T.dash') || !src.includes('__T.overlay')) throw new Error('patch failed')
    const f = path.resolve('build', `scene_style_${id}.js`)
    fs.writeFileSync(f, src)
    const svg = require(f).sceneSvg()
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } })
    await p.setContent(`<html><body style="margin:0;color:#EDE3D2;background:#000"><div style="position:fixed;inset:0">${svg}</div><div style="position:fixed;left:600px;right:600px;top:0;bottom:120px;background:rgba(26,21,16,.62);backdrop-filter:blur(18px)"></div></body></html>`)
    await p.waitForTimeout(1500)
    await p.screenshot({ path: `${outDir}/${id}.png` })
    await p.close()
    console.log(id)
  }
  await b.close()
  fs.writeFileSync(`${outDir}/names.json`, JSON.stringify(Object.fromEntries(Object.entries(STYLES).map(([k, v]) => [k, v.name]))))
})()
