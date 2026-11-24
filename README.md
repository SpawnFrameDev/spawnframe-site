# spawnframe.dev

Static site for SpawnFrame, hosted on Cloudflare Pages. No build step: every push to `main` goes live.

| Path | File |
|---|---|
| `/` | `index.html` (studio home, clean look, `styles.css`) |
| `/goldcraft/` | `goldcraft/index.html` (addon look, `goldcraft/goldcraft.css`); the tour is `goldcraft/demo.js` + `demo.css`: the addon window rebuilt from its own code and art (`goldcraft/art/`), with sample data. Stand-ins: icons from game-icons.net (CC BY 3.0, sprite in `goldcraft/icons.svg`), Marcellus font (OFL, `goldcraft/fonts/`) |
| `/privacy/` | `privacy/index.html` |
| anything else | `404.html` |

`_headers` sets security headers on Cloudflare Pages. No outside fonts, scripts or trackers, which the privacy page promises.

## Cloudflare Pages settings
- Framework preset: None
- Build command: (empty)
- Build output directory: `/`

## To do
- Screenshots: put new PNGs in `goldcraft/img/` (home.png, market.png, bags.png, auctions.png) and uncomment the screenshots section in `goldcraft/index.html`.
- Add the Wago link next to CurseForge once the addon is listed there.
