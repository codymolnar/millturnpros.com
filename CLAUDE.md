# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static single-page website for Mill-Turn Pros (millturnpros.com), a CNC consulting business. Deployed via GitHub Pages at `codymolnar/millturnpros.com`. No build step — changes to files are deployed directly.

## File Structure

```
index.html        # Single-page app — all sections (navbar, hero, services, about, contact, game, footer)
css/styles.css    # All styling — dark charcoal + electric blue (#38bdf8) theme
js/main.js        # All JS — no frameworks, vanilla only
images/           # MTP-Logo.png + SVG assets
```

## Deployment

Push to `main` → GitHub Pages auto-deploys within ~1 minute. No build, no CI, no npm required.

```bash
git add css/styles.css js/main.js index.html
git commit -m "Your message"
git push
```

## Architecture Notes

**Single HTML file** — all sections live in `index.html` as anchored `<section id="...">` elements. Navigation uses `href="#section-id"` smooth scroll.

**CSS** — one flat `styles.css` file with CSS custom properties defined at `:root`. Key variables: `--accent` (electric blue `#38bdf8`), `--bg` (dark charcoal), `--text`. No preprocessor.

**JS** — one flat `main.js` with no imports or modules. Organized as a sequence of IIFEs and top-level listeners:
- Navbar sticky/scroll + mobile hamburger
- Intersection Observer scroll-reveal (`.fade-in` → `.visible`)
- Hero canvas particle animation (cursor-reactive, 55 particles)
- Stats count-up animation (triggers on scroll into view)
- Contact form submits via `fetch` to a Google Apps Script endpoint (`FORM_ENDPOINT`) using `mode: 'no-cors'`
- G-Code Challenge quiz game (19-question pool, 5 random per round, 15s timer)
- Active nav highlight on scroll

**Contact form** — POSTs JSON as `text/plain` to a Google Apps Script URL in `js/main.js`. The endpoint URL is hardcoded at the top of the form handler section.

## TODO Placeholders

Search for `<!-- TODO:` in `index.html` to find placeholder content (bio text, stat numbers, email, phone). The `toEmail` variable mentioned in DEPLOYMENT.md is now the `FORM_ENDPOINT` URL in `js/main.js`.

## node_modules / package.json

The `jimp` dependency in `package.json` is only used by `remove-bg.js` (a one-off image processing script). It is **not** part of the website — do not reference or bundle it.
