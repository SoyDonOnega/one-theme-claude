---
name: personalizar
description: Builds the person's own room for the one-theme backdrop by asking sixteen questions (lamp, favourite painting, weather, motto, and one question for each of the twelve shelf slots), drawing each answer as a small piece in the room's style, and saving it with the mcp__one-theme__room tool. Use when the person runs /one-theme:personalizar or asks to personalise, change or create a room of the one-theme theme.
license: MIT
disable-model-invocation: true
---

# Personalise a one-theme room

The one-theme backdrop is a room around the conversation, printed in halftone dots on a sepia (dark) or cream (light) palette. The room `onega` ships with the theme. Each person can make their own rooms and switch between them. Clawd at the desk and the arc lamp over him never change.

## 1. Ask the questions

Ask in the person's language, one at a time, and wait for each answer. Keep each question short. Offer the choices where the question has them. If the person skips a question, leave that piece as it is in the `onega` room.

| # | Piece | Question | What to keep |
|---|---|---|---|
| 1 | Lamp | Which lamp do you like? Paper lantern, retro, design, chandelier or Tiffany. | `lamp`: `paper`, `retro`, `design`, `chandelier` or `tiffany` |
| 2 | Painting | What is your favourite painting? | `painting`: your pixel version of it |
| 3 | Window | What weather do you like? Rain, sun, snow, a starry night or a sunset. | `window`: `rain`, `sun`, `snow`, `stars` or `sunset` |
| 4 | Sign | Tell me a motto for the neon sign (one or two short lines). | `motto`: one or two lines |
| 5 | Shelf, top left | Where are you from? | `shelf[0]` |
| 6 | Shelf, top middle | Tell me about a trip that marked you. | `shelf[1]` |
| 7 | Shelf, top right | Which object defines you? | `shelf[2]` |
| 8 | Shelf, 2nd left | What do you collect? | `shelf[3]` |
| 9 | Shelf, 2nd middle | What music do you listen to? | `shelf[4]` |
| 10 | Shelf, 2nd right | Which sport do you follow? | `shelf[5]` |
| 11 | Shelf, 3rd left | What is your favourite series or character? | `shelf[6]` |
| 12 | Shelf, 3rd middle | How do you unwind at home? | `shelf[7]` |
| 13 | Shelf, 3rd right | What is your favourite drink? | `shelf[8]` |
| 14 | Shelf, bottom left | Tell me about a memory with someone. | `shelf[9]` |
| 15 | Shelf, bottom middle | What do you like to read? | `shelf[10]` |
| 16 | Shelf, bottom right | What is your favourite food? | `shelf[11]` |

Then ask what the room is called. Suggest the person's first name, in lowercase. The name `onega` is taken.

For each shelf answer, choose one object that stands for it. Examples from the `onega` room: from Galicia, a Sargadelos figure; a trip to Japan, an open book with Japanese prints; Formula 1, a toy F1 car; coffee, an espresso machine. Tell the person which object you chose for each answer before you save.

## 2. Draw each piece

Each piece is SVG markup: shapes only, no outer `<svg>`. The scene prints it in the room's dots, so draw it flat and simple:

- **Box.** A side slot (`shelf[0]`, `[2]`, `[3]`, `[5]`, `[6]`, `[8]`, `[9]`, `[11]`) is 100 × 100 units. A middle slot (`shelf[1]`, `[4]`, `[7]`, `[10]`) is 180 × 100. The painting is 140 × 192, portrait. The bottom edge (y = 100) is the shelf board, so stand objects on it. Anything outside the box is cut off.
- **Shapes.** Use only `g`, `rect`, `circle`, `ellipse`, `path`, `line`, `polyline`, `polygon`. For gentle movement you can add `animate` or `animateTransform` (SMIL), for example something that bobs, glows or turns. Do not use text, images, styles, `url()` or links.
- **Colour.** Paint with a class, never with `fill`. Use `class="f-<paint>"` to fill and `class="s-<paint>"` to stroke, plus `stroke-width`. For a stroke-only shape, write `fill="none"`. The paints follow the theme's light and dark palettes: `racer` (red), `frameRed`, `cape` (brick), `tie` (orange), `lamp`, `sunny` (yellow), `brass`, `leaf`, `leaf2`, `smiski` (pale green), `sky`, `fuji`, `cobalt`, `sleeveB` (blue-grey), `print` (pink), `sakura`, `porcelain` (white), `page`, `cloud`, `board`, `photoLight`, `photoMid`, `photoDark`, `metal`, `box`, `pot`, `curtain`, `knight` (near black), `tire`, `vinyl`, `ink`. Use three to six paints for each piece.
- **Detail.** The dots are 3 units apart, so shapes smaller than about 4 units disappear. Use bold, recognisable silhouettes, like the existing pieces: a figure, a cup, a car, a book.
- **Painting.** Fill the whole 140 × 192 box with a background first. Then draw a simplified pixel version of the painting: its composition, its main shapes and its colours.
- **Size.** Each slot can hold up to 5,000 characters. The painting can hold up to 12,000. All custom pieces together can hold up to 30,000.

Example of a side slot (a mug of tea):

```svg
<rect x="28" y="48" width="40" height="50" rx="6" class="f-porcelain"/>
<path d="M68 58q16 0 16 14t-16 14" class="s-porcelain" stroke-width="6" fill="none"/>
<rect x="28" y="56" width="40" height="8" class="f-leaf"/>
<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" dur="3s" repeatCount="indefinite"/><path d="M40 40q-6 -8 0 -16M54 40q-6 -8 0 -16" class="s-cloud" stroke-width="3" fill="none"/></g>
```

## 3. Save it

Load the tool with ToolSearch (`select:mcp__one-theme__room`), then call it:

```json
{ "action": "save", "name": "<room>", "room": { "lamp": "...", "window": "...", "motto": ["...", "..."], "painting": "<shapes>", "shelf": ["<shapes>", null, "..."] } }
```

`shelf` has 12 slots in the order of the table (top row first, left to right). Use `null` to keep the `onega` piece in a slot. If the tool refuses the room, it lists what to fix. Fix it and call again.

Then tell the person:

- The room is shown in the Code tab of the desktop and mobile apps.
- `/one-theme <room>` switches rooms.
- `/one-theme rooms` lists them.
- `/one-theme off` hides the theme.
- Running this skill again makes another room. Under the same name it replaces that room.

To change one piece later, call `{ "action": "show", "name": "<room>" }`, change only that piece, and save the room again under the same name.
