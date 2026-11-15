// The README previews (dark and light) and the plugin's icon, made from the
// scene as it is now. Run `npm run previews` after a change worth showing.
import { test } from '@playwright/test'

import { DARK, drawScene, LIGHT } from './scene-page'

test.describe('previews', () => {
  for (const [name, mode] of [['dark', DARK], ['light', LIGHT]] as const) {
    test(`preview, ${name}`, async ({ page }) => {
      await page.setViewportSize({ width: 1600, height: 900 })
      await drawScene(page, {}, mode, 0)
      await page.screenshot({ path: `../assets/preview-${name}.png`, scale: 'css' })
    })
  }

  // The icon: Clawd at his desk under the arc lamp, square, 640 px.
  test('icon', async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 })
    await drawScene(page, {}, DARK, 0)
    await page.screenshot({ path: '../plugin/.claude-plugin/icon.png', clip: { x: 1240, y: 560, width: 320, height: 320 } })
    await page.close()
  })
})
