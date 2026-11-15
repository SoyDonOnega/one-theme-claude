# Changelog

All notable changes to one-theme. Versions follow [Semantic Versioning](https://semver.org/); the version is the one in `plugin/.claude-plugin/plugin.json`. Installs follow `main`.

## 0.19.0 — 2026-11-15

### Changed
- The plugin lives in `plugin/`; the marketplace installs only that folder. Development files (`dev/`) and the README previews stay outside it.
- The old style screenshots (`docs/`, 34 MB) are gone from the repository and its history, so an install no longer copies them.

### Added
- Tests run with `claude plugin test plugin`: what a room may hold (`plugin/tests/room.test.ts`) and the session start, `/one-theme` command and room tool against the engine (`plugin/tests/register.test.ts`).
- Visual baselines in `dev/baselines` (onega at 1000 and 1600 px, dark and light, and a room with every piece changed), compared with Playwright in `dev/`.
- Current previews in the README, an icon and the author in the manifest.
- This changelog.

## 0.18.1 — 2026-11-15
- The sign's shape follows the motto: a room carries its own plate; a motto with no plate hangs on a plain enamel sign. onega keeps the fish. ([#18](https://github.com/SoyDonOnega/one-theme-claude/pull/18))

## 0.18.0 — 2026-11-15
- Renamed from caballero-nubes to one-theme. The shipped room is onega; people make their own with `/one-theme:personalizar`, keep several and switch with `/one-theme <room>`. Five lamps, five window weathers, a full neon alphabet, a custom painting and twelve custom shelf slots. ([#17](https://github.com/SoyDonOnega/one-theme-claude/pull/17))

## 0.17.0 — 2026-11-15
- The book on the lectern turns through four pictures in a seamless loop. ([#16](https://github.com/SoyDonOnega/one-theme-claude/pull/16))

## 0.16.3 — 2026-11-15
- The book's pages alternate red and blue on each turn. ([#15](https://github.com/SoyDonOnega/one-theme-claude/pull/15))

## 0.16.2 — 2026-11-15
- The book reads torii on the left, wave on the right. ([#14](https://github.com/SoyDonOnega/one-theme-claude/pull/14))

## 0.16.1 — 2026-11-15
- Japanese pixel pictures in the book, a three-shot photo strip and an Entroido Sargadelos figure. ([#13](https://github.com/SoyDonOnega/one-theme-claude/pull/13))

## 0.16.0 — 2026-11-15
- Shelf: a book on a lectern, a toy F1 car, a Hoptimist, Smiskis, a Sargadelos figure and a photo strip. ([#12](https://github.com/SoyDonOnega/one-theme-claude/pull/12))

## 0.15.2 — 2026-11-14
- Bigger sign; the arc lamp's glow matches the lantern's. ([#11](https://github.com/SoyDonOnega/one-theme-claude/pull/11))

## 0.15.1 — 2026-11-14
- Bigger sign, smaller lantern halo, clouds that drift in the painting. ([#10](https://github.com/SoyDonOnega/one-theme-claude/pull/10))

## 0.15.0 — 2026-11-14
- Three rows per side; the lantern hangs lower; bigger arc lamp and Clawd. ([#9](https://github.com/SoyDonOnega/one-theme-claude/pull/9))

## 0.14.1 — 2026-11-14
- Smaller, lower hanging pieces in two aligned rows. ([#8](https://github.com/SoyDonOnega/one-theme-claude/pull/8))

## 0.14.0 — 2026-11-14
- Hanging pieces stacked and enlarged; the desk front is one plain drawer. ([#7](https://github.com/SoyDonOnega/one-theme-claude/pull/7))

## 0.13.0 — 2026-11-14
- The middle stays empty: each side is drawn in its own scaling frame. ([#6](https://github.com/SoyDonOnega/one-theme-claude/pull/6))

## 0.12.5 — 2026-11-14
- No glass blur: the frosted panel's edge cut the scene. ([#5](https://github.com/SoyDonOnega/one-theme-claude/pull/5))

## 0.12.4 — 2026-11-14
- A veil down the middle keeps chat text readable; the command no longer says the theme is not drawn. ([#4](https://github.com/SoyDonOnega/one-theme-claude/pull/4))

## 0.12.3 — 2026-11-14
- Lighter glass so the scene shows through. ([#3](https://github.com/SoyDonOnega/one-theme-claude/pull/3))

## 0.12.2 — 2026-11-14
- Accept both backdrop `scene` and `id` keys, for the app's different engine builds. ([#2](https://github.com/SoyDonOnega/one-theme-claude/pull/2))

## 0.12.1 — 2026-11-14
- Use backdrop `id` for `$.theme.set`. ([#1](https://github.com/SoyDonOnega/one-theme-claude/pull/1))

## 0.12.0 — 2026-11-14
- First version in this repository, as caballero-nubes.
