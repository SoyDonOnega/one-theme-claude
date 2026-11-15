import { defineConfig } from '@playwright/test'

// The scene is drawn in the Chrome already installed (no browser download),
// with its animations paused at t = 0, and compared with the baselines in
// dev/baselines. Baselines are tied to the machine that made them (macOS,
// this Chrome): renders differ across systems, so update them on the same
// machine (`npm run visual:update`) when the scene changes on purpose.
export default defineConfig({
  testDir: '.',
  snapshotPathTemplate: '{testDir}/baselines/{arg}{ext}',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.001 } },
  use: { channel: 'chrome', headless: true },
  reporter: 'list',
})
