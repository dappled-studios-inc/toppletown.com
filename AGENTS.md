# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static marketing website** for the "Topple Town" mobile game. It is plain HTML/CSS/JS with no build system, package manager, framework, or backend. It is deployed via GitHub Pages (see `CNAME` → `www.toppletown.com`).

Key files:
- `index.html`, `privacy.html` — pages
- `css/styles.css` — styles
- `js/main.js` — navigation, screenshot carousel, lightbox, and contact form logic
- `assets/` — images (icons, screenshots, splash art)
- `levels/*.json` + `manifest.json` — game level data served as static files (consumed by the mobile app, not the website UI)

### Running / developing

There are no dependencies to install and nothing to build. Serve the repository root over HTTP and open it in a browser:

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000/index.html`. Because paths in `index.html` are relative (e.g. `css/styles.css`, `js/main.js`, `assets/...`), always serve from the repo root, not a subdirectory. Node's `npx serve` also works if preferred.

### Linting / testing / building

There are no configured lint, test, or build tools in this repo. "Build" is a no-op (static files are served/deployed as-is). Validate changes by serving locally and viewing the page in a browser.

### Notes / gotchas
- The contact form (`js/main.js` → `initContactForm`) POSTs to an external Formspree endpoint; it will attempt a real network request when submitted.
- The trailer section embeds a YouTube iframe and the footer loads an external PixelPicked badge image, so parts of the page depend on external network access.
