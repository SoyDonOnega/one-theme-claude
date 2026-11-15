// What a room may hold: each check in room.ts, accepted and refused.
import { expect, test } from 'claude-code/testing'

import { checkRoom, LIMITS } from '../hooks/room'

const errorsOf = (room: unknown) => {
  const checked = checkRoom(room)
  return 'errors' in checked ? checked.errors : []
}

test('a full room within the rules is kept', async () => {
  const checked = checkRoom({
    lamp: 'tiffany',
    window: 'snow',
    motto: ['¡Ánimo', 'siempre!'],
    sign: '<path d="M0 0H280V170H0Z" class="f-fuji"/>',
    painting: '<rect x="0" y="0" width="140" height="192" class="f-sky"/>',
    shelf: [
      '<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="2s" repeatCount="indefinite"/><circle cx="50" cy="70" r="20" class="f-leaf"/></g>',
      null,
      '<path d="M10 90q10 -20 20 0" class="s-racer" stroke-width="4" fill="none"/>',
    ],
  })
  expect('room' in checked).toBe(true)
  if ('room' in checked) expect(checked.room.motto).toEqual(['ANIMO', 'SIEMPRE!'])
})

test('an empty room is the onega room', async () => {
  expect(checkRoom({})).toEqual({ room: {} })
})

test('choices outside their lists are refused', async () => {
  expect(errorsOf({ lamp: 'neon' }).join()).toMatch(/lamp must be one of/)
  expect(errorsOf({ window: 'fog' }).join()).toMatch(/window must be one of/)
  expect(errorsOf({ colour: 'red' }).join()).toMatch(/unknown field colour/)
})

test('a motto outside the sign alphabet or too long is refused', async () => {
  expect(errorsOf({ motto: ['HOLA€'] }).join()).toMatch(/uses €/)
  expect(errorsOf({ motto: ['A'.repeat(15)] }).join()).toMatch(/at most 14/)
  expect(errorsOf({ motto: ['A', 'B', 'C'] }).join()).toMatch(/one or two lines/)
})

test('scripts, images, links and foreign paint are refused', async () => {
  const refused = [
    ['<script>alert(1)</script>', /<script> is not allowed/],
    ['<image href="x.png"/>', /<image> is not allowed/],
    ['<foreignObject></foreignObject>', /<foreignObject> is not allowed/],
    ['<rect fill="url(#p)" class="f-sky"/>', /reference or markup/],
    ['<rect fill="red"/>', /fill may only be "none"/],
    ['<rect class="f-nope"/>', /not a palette paint/],
    ['<rect style="fill:red"/>', /attribute style is not allowed/],
    ['<rect onload="x()"/>', /attribute onload is not allowed/],
    ['<g transform="url(#x)"/>', /reference or markup/],
    ['<g>', /left open/],
    ['hello<rect/>', /text outside a tag/],
  ] as const
  for (const [svg, message] of refused) expect(errorsOf({ shelf: [svg] }).join()).toMatch(message)
})

test('pieces past their size limits are refused', async () => {
  const big = (n: number) => '<rect x="1" y="1" width="2" height="2" class="f-sky"/>'.repeat(Math.ceil(n / 52) + 1)
  expect(errorsOf({ shelf: [big(LIMITS.slot)] }).join()).toMatch(/at most 5000/)
  expect(errorsOf({ sign: big(LIMITS.sign) }).join()).toMatch(/at most 8000/)
  expect(errorsOf({ painting: big(LIMITS.painting) }).join()).toMatch(/at most 12000/)
  const slots = Array.from({ length: 12 }, () => big(LIMITS.slot - 100).slice(0, LIMITS.slot - 60))
  expect(errorsOf({ shelf: slots }).join()).toMatch(/together/)
  expect(errorsOf({ shelf: Array.from({ length: 13 }, () => null) }).join()).toMatch(/up to 12 slots/)
})
