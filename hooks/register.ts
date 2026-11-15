// one-theme: a theme for the Code tab of the Claude desktop app (and the
// mobile app), built from ishuagrawal/claude-code-themes' rainy-window (MIT).
// It follows the docs' recipe for a theme: one `$.theme.set` call with both
// the colors and a backdrop scene, at session start, and a `ui.render` hook
// that draws that scene at the `Backdrop` site.
// https://code.claude.com/docs/en/plugins/mods/interface#put-a-backdrop-behind-the-conversation
//
// The scene is a room around the conversation: a lamp, a painting and a
// shelf on the left; a sign, a window and Clawd typing at his desk under an
// arc lamp on the right. It comes as rooms: `onega`, the one it ships with,
// and any a person makes by answering the /one-theme:personalizar skill's
// questions, kept with `$.store` on their machine. One room is shown at a
// time; /one-theme <room> switches.
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { checkRoom } from './room'
import { type Room, SCENE_ALT, sceneSvg } from './scene'

// Cream paper and ink by day, a lamp-lit navy by night, to match the scene.
const { theme, problems } = makeColors({
  label: 'one-theme',
  roles: { accent: '#5562C9', danger: '#C9553E', success: '#4E8B62', warning: '#D9892F', pro: '#7E5FC0' },
  light: {
    gray: {
      anchors: { 'surface-0': '#E9E3D6', 'surface-1': '#F0EBE1', 'surface-2': '#F6F2EA', 'text-primary': '#1F1F26', 'text-secondary': '#45444F', 'text-muted': '#5F5D68' },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1A1510',
        'surface-1': '#201A14',
        'surface-2': '#262019',
        'surface-3': '#2C251D',
        'text-primary': '#EDE3D2',
        'text-secondary': '#CDBFA8',
        'text-muted': '#A8987E',
      },
    },
  },
})

// The rooms that come with the theme. `onega` is drawn as the scene's own
// defaults, so its room is empty.
const BUILT_IN: Record<string, Room> = { onega: {} }
const DEFAULT_ROOM = 'onega'
const NAME = /^[a-z0-9][a-z0-9-]{0,31}$/

async function ownRooms($: EngineInterface) {
  return ((await $.store.get('rooms')) ?? {}) as Record<string, Room>
}
async function activeRoom($: EngineInterface): Promise<[string, Room]> {
  const name = ((await $.store.get('active')) as string | undefined) ?? DEFAULT_ROOM
  const room = BUILT_IN[name] ?? (await ownRooms($))[name]
  return room ? [name, room] : [DEFAULT_ROOM, BUILT_IN[DEFAULT_ROOM] as Room]
}

// A short, stable tag for a room's contents, so a changed room is a new
// backdrop and the app draws it again.
function tag(text: string) {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = (Math.imul(h, 33) ^ text.charCodeAt(i)) >>> 0
  return h.toString(36)
}

// Colors and backdrop go in the same call: a later $.theme call replaces both.
// Builds disagree on the backdrop's name key: most take `scene`, 2.1.321
// (which the desktop app can fall back to) takes `id`. Try `scene`, then `id`.
const GLASS = { blur: 0, opacity: 0.15 }
const PREFIX = 'onetheme-'

async function setTheme($: EngineInterface) {
  const [name, room] = await activeRoom($)
  const scene = `${PREFIX}${name}-${tag(JSON.stringify(room))}`.slice(0, 64)
  const withScene = { colors: theme, backdrop: { scene, glass: GLASS } } as ThemeSetArgs
  const withId = { colors: theme, backdrop: { id: scene, glass: GLASS } } as unknown as ThemeSetArgs
  const set = await $.theme.set(withScene).catch(() => $.theme.set(withId))
  if (!set.isDrawn) $.ui.log(`one-theme: the theme is set but not drawn here: ${set.reason}`, { to: 'debug' })
  return set
}

async function listRooms($: EngineInterface) {
  const [active] = await activeRoom($)
  const names = [...Object.keys(BUILT_IN), ...Object.keys(await ownRooms($))]
  return names.map(n => (n === active ? `${n} (puesta)` : n)).join(', ')
}

// The tool the personalizar skill saves rooms with.
const TOOL = 'room'
const TOOL_SPEC = {
  name: TOOL,
  description:
    'Saves, shows, switches or deletes a room of the one-theme backdrop. Use it at the end of the /one-theme:personalizar skill, which says what a room holds. ' +
    'action "save" keeps `room` under `name` and shows it; "use" shows the room `name`; "show" returns the room `name` as saved; "list" names the rooms; "delete" removes the room `name`. ' +
    'The built-in room "onega" cannot be changed or deleted. A room that fails the checks is refused with the list of what to fix.',
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['save', 'use', 'show', 'list', 'delete'] },
      name: { type: 'string', description: 'Room name: lowercase letters, digits and hyphens, up to 32.' },
      room: {
        type: 'object',
        description: 'lamp, window, motto (1-2 lines), painting (SVG shapes) and shelf (12 slots of SVG shapes or null), as the skill describes.',
      },
    },
    required: ['action'],
  },
}

export const register: Register = on => {
  // Neither a reload of this mod nor --resume keeps a theme, so set it here.
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'one-theme', description: 'Tema one-theme: /one-theme off | on | rooms | <habitación>' })
    await $.tool.register(TOOL_SPEC)
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) $.ui.toast(`one-theme: ${unpainted}`)
    if ((await $.store.get('off')) !== true) await setTheme($)
    return next(e)
  })

  on('command.run', { command: 'one-theme' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'off') {
      await $.store.set('off', true)
      await $.theme.clear()
      return { text: 'Tema desactivado: la app vuelve a su aspecto. /one-theme on lo trae de vuelta.' }
    }
    if (arg === 'on' || arg === '') {
      await $.store.delete('off')
      await setTheme($)
      return { text: `Tema activado. Habitación: ${(await activeRoom($))[0]}.` }
    }
    if (arg === 'rooms' || arg === 'habitaciones') return { text: `Habitaciones: ${await listRooms($)}. Crea la tuya con /one-theme:personalizar.` }
    if (BUILT_IN[arg] || (await ownRooms($))[arg]) {
      await $.store.set('active', arg)
      await $.store.delete('off')
      await setTheme($)
      return { text: `Habitación ${arg} puesta.` }
    }
    return { text: `No hay ninguna habitación "${arg}". Habitaciones: ${await listRooms($)}. Prueba /one-theme off, /one-theme on o /one-theme <habitación>.` }
  })

  on('tool.call', { tool: `mcp__one-theme__${TOOL}` }, async ($, e) => {
    // The model's arguments arrive on the event itself, beside `tool`.
    const input = e as unknown as { action?: string; name?: string; room?: unknown }
    const name = (input.name ?? '').trim().toLowerCase()
    const rooms = await ownRooms($)
    if (input.action === 'list') return { result: `Rooms: ${await listRooms($)}` }
    if (!NAME.test(name)) return { deny: 'name: lowercase letters, digits and hyphens, up to 32, starting with a letter or digit' }
    if (input.action === 'show') {
      const room = BUILT_IN[name] ?? rooms[name]
      return room ? { result: JSON.stringify(room) } : { deny: `no room ${name}` }
    }
    if (input.action === 'use') {
      if (!BUILT_IN[name] && !rooms[name]) return { deny: `no room ${name}; rooms: ${await listRooms($)}` }
      await $.store.set('active', name)
      await $.store.delete('off')
      await setTheme($)
      return { result: `Room ${name} is shown.` }
    }
    if (BUILT_IN[name]) return { deny: `${name} is a built-in room; save under another name` }
    if (input.action === 'delete') {
      if (!rooms[name]) return { deny: `no room ${name}` }
      delete rooms[name]
      await $.store.set('rooms', rooms)
      if ((await $.store.get('active')) === name) await $.store.set('active', DEFAULT_ROOM)
      await setTheme($)
      return { result: `Room ${name} deleted.` }
    }
    if (input.action === 'save') {
      const checked = checkRoom(input.room ?? {})
      if ('errors' in checked) return { deny: `The room was not saved. Fix these and call again:\n- ${checked.errors.join('\n- ')}` }
      rooms[name] = checked.room
      await $.store.set('rooms', rooms)
      await $.store.set('active', name)
      await $.store.delete('off')
      const set = await setTheme($)
      return { result: `Room ${name} saved and shown${set.isDrawn ? '' : ' (it draws in the desktop and mobile apps)'}. The person can switch with /one-theme <room>.` }
    }
    return { deny: 'action is save, use, show, list or delete' }
  })

  // The scene itself. This hook hears every mod's backdrop, and another mod
  // could use the same scene name, so it draws only its own.
  //
  // The desktop app moves a backdrop only when the drawing passes its check:
  // a short list of SVG elements and CSS functions, no viewport units, no
  // media queries but reduced motion's, and cheap enough to draw each frame.
  // Anything else it draws as a still copy. scene.ts keeps to those rules.
  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const props = e.props as { plugin: string; scene?: string; id?: string }
    if (props.plugin !== $.plugin.name || !(props.scene ?? props.id ?? '').startsWith(PREFIX)) return next(e)
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const [, room] = await activeRoom($)
    const { Svg } = $.ui.resolve(e)
    return Svg({ source: sceneSvg(room), alt: SCENE_ALT })
  })
}
