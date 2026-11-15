// A page that draws the scene as the desktop app does: full window, the
// app's text color on the drawing (cream in dark mode, ink in light mode,
// which picks the palette), and the conversation column it leaves empty.
import type { Page } from '@playwright/test'

import { type Room, sceneSvg } from '../plugin/hooks/scene'

export const DARK = { background: '#1A1510', text: '#EDE3D2' }
export const LIGHT = { background: '#E9E3D6', text: '#1F1F26' }

// The scene with its SMIL animation taken out, each piece at rest, so two
// renders match. (Pausing the SVG clock does not hold reliably on a cold
// start of Chrome.) Movement is not covered by these baselines.
const still = (svg: string) => svg.replace(/<animate(Transform)?\b[^>]*\/>/g, '')

export async function drawScene(page: Page, room: Room, mode = DARK, chat = 0.48) {
  const { width } = page.viewportSize() ?? { width: 1600 }
  const column = Math.round(width * chat)
  await page.setContent(
    `<!doctype html><body style="margin:0;background:${mode.background};color:${mode.text};overflow:hidden">` +
      `<div style="position:fixed;inset:0">${still(sceneSvg(room))}</div>` +
      (chat ? `<div style="position:fixed;top:0;bottom:0;left:${(width - column) / 2}px;width:${column}px;background:rgba(0,0,0,.06)"></div>` : '') +
      '</body>',
  )
}

// A room that changes every piece a person can change.
export const TEST_ROOM: Room = {
  lamp: 'tiffany',
  window: 'snow',
  motto: ['SIGUE TU', 'ESTRELLA'],
  sign: '<path d="M140 6L166 52L236 40L196 84L250 124L180 124L140 166L100 124L30 124L84 84L44 40L114 52Z" class="f-fuji"/><path d="M140 6L166 52L236 40L196 84L250 124L180 124L140 166L100 124L30 124L84 84L44 40L114 52Z" class="s-brass" stroke-width="5" fill="none"/>',
  painting: '<rect x="0" y="0" width="140" height="192" class="f-sky"/><circle cx="70" cy="70" r="30" class="f-sunny"/><path d="M0 150Q70 110 140 150V192H0Z" class="f-leaf"/>',
  shelf: ['<rect x="30" y="50" width="40" height="50" rx="6" class="f-porcelain"/>', null, '<circle cx="50" cy="75" r="22" class="f-racer"/>'],
}
