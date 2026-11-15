// The theme's hooks against the engine: the start of a session, the
// /one-theme command, the room tool and the backdrop. Each hook here stands
// for the engine beneath the plugin.
import type { On } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'

const TOOL = 'mcp__one-theme__room'
const ROOM = { lamp: 'retro', window: 'sun', motto: ['HOLA'], shelf: [null, null, '<circle cx="50" cy="70" r="25" class="f-racer"/>'] }

// The engine's side: a store in memory, registrations accepted, and every
// theme the plugin sets kept so a test can read the backdrop's name.
function engine(on: On, store: Record<string, unknown> = {}) {
  const scenes: string[] = []
  mock.store(on, store)
  on('command.register', () => ({ value: { command: 'one-theme' } }))
  on('tool.register', () => ({ value: { tool: TOOL } }))
  on('theme.set', (_, e) => {
    const backdrop = (e as { backdrop?: { scene?: string; id?: string } }).backdrop
    scenes.push(backdrop?.scene ?? backdrop?.id ?? '')
    return { value: { isDrawn: false, reason: 'no surface in a test' } }
  })
  on('theme.clear', () => ({ value: { isDrawn: false, reason: 'cleared' } }))
  on('ui.log', () => ({ value: undefined }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  return scenes
}

// What the tool answered, whichever way it came back: the plugin's own
// `result` or `deny`, or the text the engine made of it.
const said = (r: { text?: string; result?: unknown; deny?: string }) => String(r.text ?? r.result ?? r.deny)
const refused = (r: { isError?: boolean; deny?: string }) => r.isError === true || typeof r.deny === 'string'

// A /one-theme command typed at the prompt.
const typed = (args: string) => ({ command: 'one-theme', args, origin: { kind: 'composer' as const }, presentation: { isFullscreen: false, columns: 80 } })

const start = ($: { session: { start: (a: { cwd: string; surface: 'desktop'; isInteractive: boolean }) => Promise<unknown> } }) =>
  $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

test('a session starts on the onega room', async ($, on) => {
  const scenes = engine(on)
  await start($)
  expect(scenes.length).toBe(1)
  expect(scenes[0]).toMatch(/^onetheme-onega-/)
})

test('/one-theme off keeps the theme off in the next session', async ($, on) => {
  const scenes = engine(on, { off: true })
  await start($)
  expect(scenes.length).toBe(0)
})

test('/one-theme lists, switches and refuses unknown rooms', async ($, on) => {
  engine(on, { rooms: { ana: {} } })
  await start($)
  expect((await $.command.run(typed('rooms'))).text).toMatch(/onega.*ana/)
  expect((await $.command.run(typed('ana'))).text).toMatch(/ana puesta/)
  expect((await $.command.run(typed('nadie'))).text).toMatch(/No hay ninguna habitación "nadie"/)
})

test('the tool saves a room, shows it, lists it and deletes it', async ($, on) => {
  const scenes = engine(on)
  await start($)
  const saved = await $.tool.call({ tool: TOOL, action: 'save', name: 'ana', room: ROOM })
  expect(said(saved)).toMatch(/Room ana saved/)
  expect(scenes.at(-1)).toMatch(/^onetheme-ana-/)
  const shown = await $.tool.call({ tool: TOOL, action: 'show', name: 'ana' })
  expect(said(shown)).toMatch(/"lamp":"retro"/)
  expect(said(await $.tool.call({ tool: TOOL, action: 'list' }))).toMatch(/ana \(puesta\)/)
  expect(said(await $.tool.call({ tool: TOOL, action: 'delete', name: 'ana' }))).toMatch(/deleted/)
  expect(scenes.at(-1)).toMatch(/^onetheme-onega-/)
})

test('the tool refuses a bad room, the onega name and a bad name', async ($, on) => {
  engine(on)
  await start($)
  const bad = await $.tool.call({ tool: TOOL, action: 'save', name: 'ana', room: { shelf: ['<script>x</script>'] } })
  expect(refused(bad)).toBe(true)
  expect(said(bad)).toMatch(/not saved/)
  const onega = await $.tool.call({ tool: TOOL, action: 'save', name: 'onega', room: {} })
  expect(refused(onega)).toBe(true)
  expect(said(onega)).toMatch(/built-in/)
  const name = await $.tool.call({ tool: TOOL, action: 'save', name: 'Ana López', room: {} })
  expect(refused(name)).toBe(true)
  expect(said(name)).toMatch(/lowercase/)
})
