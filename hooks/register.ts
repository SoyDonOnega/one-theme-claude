// caballero-nubes: a theme for the Code tab of the Claude desktop app (and the
// mobile app), built from ishuagrawal/claude-code-themes' rainy-window (MIT). It follows the docs' recipe for a theme: one `$.theme.set` call
// with both the colors and a backdrop scene, at session start, and a
// `ui.render` hook that draws that scene at the `Backdrop` site.
// https://code.claude.com/docs/en/plugins/mods/interface#put-a-backdrop-behind-the-conversation
//
// The scene is Clawd's room on a rainy day, under a painting of a knight above
// a sea of clouds, with Clawd typing at his desk. It's one drawing that animates on
// its own, so it never redraws.

import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { SCENE_ALT, sceneSvg } from './scene'

const SCENE = 'caballero-nubes'

// Cream paper and ink by day, a lamp-lit navy by night, to match the scene.
const { theme, problems } = makeColors({
  label: 'Caballero sobre las nubes',
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

// Colors and backdrop go in the same call: a later $.theme call replaces both.
// Builds disagree on the backdrop's name key: most take `scene`, 2.1.321
// (which the desktop app can fall back to) takes `id`. Try `scene`, then `id`.
const GLASS = { blur: 6, opacity: 0.45 }
const THEME = { colors: theme, backdrop: { scene: SCENE, glass: GLASS } } as ThemeSetArgs
const THEME_ID = { colors: theme, backdrop: { id: SCENE, glass: GLASS } } as unknown as ThemeSetArgs

async function setTheme($: EngineInterface) {
  const set = await $.theme.set(THEME).catch(() => $.theme.set(THEME_ID))
  if (!set.isDrawn) $.ui.log(`caballero-nubes: the theme is set but not drawn here: ${set.reason}`, { to: 'debug' })
  return set
}

export const register: Register = on => {
  // Neither a reload of this mod nor --resume keeps a theme, so set it here.
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'caballero-nubes', description: 'Tema Caballero sobre las nubes: /caballero-nubes off | on' })
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) $.ui.toast(`caballero-nubes: ${unpainted}`)
    if ((await $.store.get('off')) !== true) await setTheme($)
    return next(e)
  })

  on('command.run', { command: 'caballero-nubes' }, async ($, e) => {
    const arg = e.args.trim()
    if (arg === 'off') {
      await $.store.set('off', true)
      await $.theme.clear()
      return { text: 'Tema desactivado: la app vuelve a su aspecto. /caballero-nubes on lo trae de vuelta.' }
    }
    if (arg === 'on' || arg === '') {
      await $.store.delete('off')
      await setTheme($)
      return { text: 'Tema activado.' }
    }
    return { text: 'Prueba /caballero-nubes off o /caballero-nubes on.' }
  })

  // The scene itself. This hook hears every mod's backdrop, and another mod
  // could use the same scene name, so it draws only its own.
  //
  //
  // The desktop app moves a backdrop only when the drawing passes its check:
  // a short list of SVG elements and CSS functions, no viewport units, no
  // media queries but reduced motion's, and cheap enough to draw each frame.
  // Anything else it draws as a still copy. scene.ts keeps to those rules.
  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const props = e.props as { plugin: string; scene?: string; id?: string }
    if (props.plugin !== $.plugin.name || (props.scene ?? props.id) !== SCENE) return next(e)
    if (e.surface !== 'desktop' && e.surface !== 'mobile') return next(e)
    const { Svg } = $.ui.resolve(e)
    return Svg({ source: sceneSvg(), alt: SCENE_ALT })
  })
}
