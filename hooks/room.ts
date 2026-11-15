// A person's room, checked before it is kept: the choices against their
// lists, the motto against the sign's alphabet, and each custom piece
// against the few SVG shapes the scene draws in its dots. A piece holds only
// shapes, groups and SMIL animation, painted with the room's own palette
// classes (`f-<paint>` fills, `s-<paint>` strokes): no styles, links, text,
// images or scripts, so it cannot reach outside the drawing.

import { LAMPS, MOTTO_CHARS, PAINT_NAMES, type Room, WEATHERS } from './scene'

const TAGS = new Set(['g', 'rect', 'circle', 'ellipse', 'path', 'line', 'polyline', 'polygon', 'animate', 'animateTransform'])
const ATTRS = new Set([
  'x', 'y', 'width', 'height', 'rx', 'ry', 'cx', 'cy', 'r', 'd', 'points', 'x1', 'y1', 'x2', 'y2',
  'transform', 'class', 'opacity', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill', 'fill-rule',
  'attributeName', 'type', 'values', 'keyTimes', 'dur', 'repeatCount', 'begin', 'calcMode', 'from', 'to',
])
// The most a piece may hold, in characters, so the whole scene stays under
// the app's limit for a backdrop.
export const LIMITS = { slot: 5000, painting: 12000, total: 30000 }
export const SHELF_SLOTS = 12
export const MOTTO_LINE = 14

// Checks one piece; returns what is wrong with it, or nothing.
function checkPiece(svg: string, where: string, max: number): string[] {
  const errors: string[] = []
  if (svg.length > max) errors.push(`${where}: ${svg.length} characters, at most ${max}`)
  const tag = /<\s*(\/?)\s*([A-Za-z]+)((?:\s+[A-Za-z:-]+\s*=\s*"[^"<>]*")*)\s*(\/?)\s*>/g
  const stack: string[] = []
  let last = 0
  for (const m of svg.matchAll(tag)) {
    if (svg.slice(last, m.index).trim()) errors.push(`${where}: text outside a tag near "${svg.slice(last, m.index).trim().slice(0, 20)}"`)
    last = (m.index ?? 0) + m[0].length
    const [, closing, name = '', attrs = '', selfClosing] = m
    if (!TAGS.has(name)) {
      errors.push(`${where}: <${name}> is not allowed (use ${[...TAGS].join(', ')})`)
      continue
    }
    if (closing) {
      if (stack.pop() !== name) errors.push(`${where}: </${name}> closes nothing open`)
      continue
    }
    for (const a of attrs.matchAll(/([A-Za-z:-]+)\s*=\s*"([^"]*)"/g)) {
      const [, key = '', value = ''] = a
      if (!ATTRS.has(key)) errors.push(`${where}: attribute ${key} is not allowed`)
      else if (/url|javascript|[<>&]/i.test(value)) errors.push(`${where}: ${key} holds a reference or markup`)
      else if (key === 'fill' && value !== 'none') errors.push(`${where}: fill may only be "none"; paint with a class`)
      else if (key === 'class') {
        for (const cls of value.split(/\s+/).filter(Boolean)) {
          const paint = /^[fs]-([A-Za-z0-9]+)$/.exec(cls)?.[1]
          if (!paint || !PAINT_NAMES.includes(paint)) errors.push(`${where}: class ${cls} is not a palette paint (f-<paint> or s-<paint>)`)
        }
      } else if (key === 'transform' && /[a-z]/i.test(value.replace(/translate|rotate|scale|skewX|skewY|matrix/g, ''))) errors.push(`${where}: transform may only translate, rotate, scale, skew or matrix`)
    }
    if (!selfClosing) stack.push(name)
  }
  if (svg.slice(last).trim()) errors.push(`${where}: text outside a tag at the end`)
  if (stack.length) errors.push(`${where}: <${stack.join('>, <')}> left open`)
  return errors
}

// Folds accents and case so a motto fits the sign's alphabet: "¡Ánimo!" is
// "ANIMO!".
export function mottoLine(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ¡¿]/g, '').toUpperCase().trim()
}

// Checks a room as the tool receives it; returns the room to keep, or the
// list of what to fix.
export function checkRoom(input: unknown): { room: Room } | { errors: string[] } {
  if (typeof input !== 'object' || input === null) return { errors: ['room must be an object'] }
  const raw = input as Record<string, unknown>
  const errors: string[] = []
  const room: Room = {}
  for (const key of Object.keys(raw)) if (!['lamp', 'window', 'motto', 'painting', 'shelf'].includes(key)) errors.push(`unknown field ${key}`)
  if (raw.lamp !== undefined) {
    if (LAMPS.includes(raw.lamp as never)) room.lamp = raw.lamp as Room['lamp']
    else errors.push(`lamp must be one of ${LAMPS.join(', ')}`)
  }
  if (raw.window !== undefined) {
    if (WEATHERS.includes(raw.window as never)) room.window = raw.window as Room['window']
    else errors.push(`window must be one of ${WEATHERS.join(', ')}`)
  }
  if (raw.motto !== undefined) {
    const lines = Array.isArray(raw.motto) ? raw.motto : [raw.motto]
    if (lines.length < 1 || lines.length > 2 || lines.some(l => typeof l !== 'string')) errors.push('motto is one or two lines of text')
    else {
      const folded = (lines as string[]).map(mottoLine)
      for (const line of folded) {
        if (line.length > MOTTO_LINE) errors.push(`motto line "${line}" is ${line.length} characters, at most ${MOTTO_LINE}`)
        const bad = [...line].filter(ch => !MOTTO_CHARS.includes(ch))
        if (bad.length) errors.push(`motto line "${line}" uses ${[...new Set(bad)].join('')}; the sign has ${MOTTO_CHARS.join('')}`)
      }
      room.motto = folded
    }
  }
  let total = 0
  if (raw.painting !== undefined) {
    if (typeof raw.painting !== 'string') errors.push('painting is SVG markup')
    else {
      errors.push(...checkPiece(raw.painting, 'painting', LIMITS.painting))
      room.painting = raw.painting
      total += raw.painting.length
    }
  }
  if (raw.shelf !== undefined) {
    if (!Array.isArray(raw.shelf) || raw.shelf.length > SHELF_SLOTS) errors.push(`shelf is a list of up to ${SHELF_SLOTS} slots`)
    else {
      room.shelf = raw.shelf.map((piece, i) => {
        if (piece === null || piece === undefined || piece === '') return null
        if (typeof piece !== 'string') {
          errors.push(`shelf[${i}] is SVG markup or null`)
          return null
        }
        errors.push(...checkPiece(piece, `shelf[${i}]`, LIMITS.slot))
        total += piece.length
        return piece
      })
    }
  }
  if (total > LIMITS.total) errors.push(`the custom pieces hold ${total} characters together, at most ${LIMITS.total}`)
  return errors.length ? { errors } : { room }
}
