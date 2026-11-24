# spawnframe.dev

Static site for SpawnFrame, hosted on Cloudflare Pages. No build step: every push to `main` goes live.

| Path | File |
|---|---|
| `/` | `index.html` (studio home, SpawnFrame brand: `styles.css` with the brand spec's tokens, fonts in `fonts/`, logo and icons in `brand/`) |
| `/goldcraft/` | `goldcraft/index.html` (addon look, `goldcraft/goldcraft.css`); the tour is `goldcraft/demo.js` + `demo.css`: the addon window rebuilt from its own code and art (`goldcraft/art/`), with sample data. Stand-ins: icons from game-icons.net (CC BY 3.0, sprite in `goldcraft/icons.svg`), Marcellus font (OFL, `goldcraft/fonts/`) |
| `/privacy/` | `privacy/index.html` |
| anything else | `404.html` |

`_headers` sets security headers on Cloudflare Pages. No outside fonts, scripts or trackers, which the privacy page promises: Space Grotesk, Plus Jakarta Sans and JetBrains Mono (all SIL OFL) are self-hosted in `fonts/`.

Brand: `brand/mark.png` is the SF interlock cut out of its background; `mark-96.png` and `mark-256.png` for the header and hero; `icon-*.png`, `apple-touch-icon.png` and `/favicon.ico` on Midnight Navy. Still to do from the brand spec: hand-drawn SVGs (full mark, simplified 16 px micro mark, horizontal and stacked lockups).

## Cloudflare Pages settings
- Framework preset: None
- Build command: (empty)
- Build output directory: `/`

## To do
- Screenshots: put new PNGs in `goldcraft/img/` (home.png, market.png, bags.png, auctions.png) and uncomment the screenshots section in `goldcraft/index.html`.
- Add the Wago link next to CurseForge once the addon is listed there.

## Before every commit
Run `python3 tools/stamp.py`. It adds a version stamp (`?v=…`) to the site's CSS, JS and SVG links. Cloudflare lets browsers keep those files for up to 4 hours, so without a new stamp visitors can get a new page with an old script.
