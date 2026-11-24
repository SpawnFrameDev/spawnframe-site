# spawnframe.dev

Static site for SpawnFrame, hosted on Cloudflare Pages. No build step: every push to `main` goes live.

| Path | File |
|---|---|
| `/` | `index.html` (studio home, SpawnFrame brand: `styles.css` with the brand spec's tokens, fonts in `fonts/`, logo and icons in `brand/`) |
| `/goldcraft/` | `goldcraft/index.html` (addon look, `goldcraft/goldcraft.css`); the tour is `goldcraft/demo.js` + `demo.css`: the addon window rebuilt from its own code and art (`goldcraft/art/`), with sample data. Stand-ins: icons from game-icons.net (CC BY 3.0, sprite in `goldcraft/icons.svg`), Marcellus font (OFL, `goldcraft/fonts/`) |
| `/privacy/` | `privacy/index.html` |
| anything else | `404.html` |

`_headers` sets security headers on Cloudflare Pages. No outside fonts, scripts or trackers, which the privacy page promises: Space Grotesk, Plus Jakarta Sans and JetBrains Mono (all SIL OFL) are self-hosted in `fonts/`.

Brand (`brand/`): `logo-mark.svg` is the SF interlock traced from the master PNG (silver gradient + cyan pixels), with `logo-mark-flat.svg` (flat #C5D1E0) and single-colour `logo-mark-mono-light.svg` / `-mono-dark.svg` (pixels at 45%, per the spec). `app-icon.svg` is the mark on Midnight Navy; `icon-*.png`, `apple-touch-icon.png`, `/favicon.svg` and `/favicon.ico` are made from it. `mark.png` is the cut-out raster master. Still to do from the spec: a simplified 16 px micro mark, and horizontal/stacked lockup SVGs.

## Cloudflare Pages settings
- Framework preset: None
- Build command: (empty)
- Build output directory: `/`

## To do
- Screenshots: put new PNGs in `goldcraft/img/` (home.png, market.png, bags.png, auctions.png) and uncomment the screenshots section in `goldcraft/index.html`.
- Add the Wago link next to CurseForge once the addon is listed there.

## Before every commit
Run `python3 tools/stamp.py`. It adds a version stamp (`?v=…`) to the site's CSS, JS and SVG links. Cloudflare lets browsers keep those files for up to 4 hours, so without a new stamp visitors can get a new page with an old script.
