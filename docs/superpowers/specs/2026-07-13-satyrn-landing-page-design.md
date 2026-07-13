# Satyrn AI static landing page

## Purpose

A single-page static marketing site for Satyrn AI, deployed to Cloudflare
Pages via GitHub. It is independent of the existing `tdom`/Starlette app in
`src/satyrn_ai_theme/` (which remains a separate theme package) — this is a
plain HTML/CSS/JS site, no server-side rendering, no build step.

## Brand source material

Visual language is drawn from the existing illustrated assets in
`src/satyrn_ai_theme/static/`:

- `SATYRN (2).svg` — hand-drawn "SATYRN" wordmark in solid black ink, arched
  over a cream/gold ringed-planet balloon with a burnt-orange ring and a
  looping string tail. Reads clearly on light backgrounds. Used as the nav
  logo in light mode.
- `SATYRN (1).svg` — the same ringed-balloon graphic, but with a faded/light
  wordmark that only reads on dark backgrounds. Used as the nav logo in dark
  mode.
- `avatar2.svg` — a curly-haired girl in a colorful patterned dress holding
  the ringed-planet balloon, surrounded by gold stars, inside a gold-bordered
  circle on cream. Used as the hero illustration.

Palette pulled from these assets: parchment/cream background (`#f7f1e3`),
ink black (`#1c1a17`) for text and headings, Saturn gold (`#e8b93d`) and
burnt-orange (`#c8722c`) as primary/accent colors, muted indigo (`#2d3f6b`,
from the avatar's dress) as a secondary accent.

## Copy direction

- Headline: "AI Our Way"
- Value proposition: Python developers want AI they can trust — open source,
  community-owned, local-first, thriving and innovative, and European.
- Mission: Satyrn is "Jupyter for agents" — a project to keep coding and
  coders central to agentic coding, by building subagents and tooling that
  help local AI succeed. From us, for us.
- Four pillars: Open Source, Community-Owned, Local-First, European.

## Technical approach

Built on Pico CSS's **classless** mode: semantic HTML (`header`, `nav`,
`main`, `section`, `article`, `footer`) styled directly by Pico with no
utility classes, themed by overriding Pico's CSS custom properties
(`--pico-primary`, `--pico-background-color`, `--pico-h1-color`, etc.) rather
than writing bespoke component classes. Pico is vendored locally (not loaded
from a CDN) since the site must be fully self-contained for Cloudflare Pages.

Dark/light theming reuses the existing toggle mechanism from
`src/satyrn_ai_theme/static/site.js` and the `data-theme-toggle` checkbox
pattern from `header.py`, copied as-is. Note: that script sets
`document.documentElement.style.colorScheme`, which affects native form
control coloring but does not itself gate CSS rules — so, consistent with how
the existing app already behaves, this site's brand color overrides for dark
mode are keyed off `@media (prefers-color-scheme: dark)` (the OS preference),
the same mechanism Pico's own dark variant uses. The toggle is included for
parity with the rest of the project; forcing a manual override independent of
OS preference is out of scope for this page.

## File layout

New top-level `site/` directory, independent of the Python package:

```
site/
  index.html
  css/
    pico.classless.min.css   # vendored Pico v2.1.1 classless build
    style.css                # brand variable overrides + hero/nav layout
  js/
    site.js                  # copied as-is from src/satyrn_ai_theme/static/site.js
  assets/
    satyrn-logo-light.svg    # copy of "SATYRN (2).svg"
    satyrn-logo-dark.svg     # copy of "SATYRN (1).svg"
    avatar.svg               # copy of avatar2.svg
    favicon.svg               # small ringed-planet mark cropped from the logo art
```

## Page sections (single page, `site/index.html`)

1. **Nav** — logo (theme-swapped per above), anchor links (Mission ·
   Local-First · Get Involved), theme-toggle switch.
2. **Hero** — badge ("Jupyter for agents"), headline ("AI Our Way"), value
   proposition paragraph, avatar illustration, primary CTA button.
3. **Pillars** — four `<article>` cards: Open Source, Community-Owned,
   Local-First, European, each with a one-line description.
4. **Mission** — the "From us, for us" narrative paragraph, accompanied by
   the ringed-Saturn mark.
5. **Footer** — wordmark, tagline, placeholder GitHub/community links,
   copyright line.

## Deployment

No build step. Cloudflare Pages (connected via GitHub) points its output
directory at `site/`.

## Out of scope

- Server-side rendering or integration with the `tdom`/Starlette app.
- A working manual dark/light override independent of OS preference (see
  Technical approach above).
- Additional pages beyond the single landing page.
- Real GitHub/community links (placeholders only, to be filled in later).
