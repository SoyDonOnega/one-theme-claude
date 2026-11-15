// Visual baselines: the onega room at two window widths, in dark and light,
// and a room with every piece changed. A change to the scene that moves
// more than 0.1% of the pixels fails until the baselines are updated.
import { expect, test } from '@playwright/test'

import { DARK, drawScene, LIGHT, TEST_ROOM } from './scene-page'

test.describe('visual', () => {
  test('onega, 1600 px, dark', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await drawScene(page, {}, DARK)
    await expect(page).toHaveScreenshot('onega-1600-dark.webp')
  })

  test('onega, 1000 px, dark', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 655 })
    await drawScene(page, {}, DARK, 0.535)
    await expect(page).toHaveScreenshot('onega-1000-dark.webp')
  })

  test('onega, 1600 px, light', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await drawScene(page, {}, LIGHT)
    await expect(page).toHaveScreenshot('onega-1600-light.webp')
  })

  test('every piece changed, 1600 px, dark', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await drawScene(page, TEST_ROOM, DARK)
    await expect(page).toHaveScreenshot('custom-1600-dark.webp')
  })
})
