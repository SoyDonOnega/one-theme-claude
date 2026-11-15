# Changelog

All notable changes to one-theme. Versions follow [Semantic Versioning](https://semver.org/); the version is the one in `plugin/.claude-plugin/plugin.json`. Installs follow `main`.

## 1.0.0 — 2026-11-15

First release.

- An animated room around the conversation in the Code tab of the Claude desktop and mobile apps, printed in halftone dots: sepia in dark mode, cream in light mode. The middle stays empty for the chat; each side scales to fit its margin.
- The room **onega** ships with the theme: a paper lantern over a painting of a knight above a sea of clouds, an open shelf (a Sargadelos Entroido figure, a book on a lectern turning through four Japanese pixel prints, a Hoptimist, Smiskis, vinyls, a toy F1 car, a plush, a turntable, an espresso machine, a photo-booth strip, books and ramen), a KEEP SWIMMING neon sign, a rainy window, and Clawd at the desk under an arc lamp.
- `/one-theme:personalizar` builds a person's own room from sixteen questions (lamp, painting, weather, motto, and one per shelf slot), drawing each answer as a small piece; the sign's shape refers to the motto. Rooms are kept on the person's machine; `/one-theme <room>` switches, `/one-theme rooms` lists, `/one-theme off` and `on` hide and show the theme.
- Five lamps (paper, retro, design, chandelier, Tiffany), five window weathers (rain, sun, snow, stars, sunset) and a full neon alphabet for the motto.
- Custom pieces are checked before they are kept: shapes and palette classes only, no links, text, images or scripts, and size limits.
- Tests (`claude plugin test plugin`) and visual baselines (`dev/`, Playwright).
