# Satyrn AI Static Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page static HTML/CSS/JS landing page for Satyrn AI at `site/`, styled with Pico CSS's classless mode and themed from the SATYRN logo/avatar art, deployable to Cloudflare Pages with no build step.

**Architecture:** Plain semantic HTML (`header`, `nav`, `main`, `section`, `article`, `footer`) styled by a locally-vendored copy of Pico CSS's classless build, themed entirely through CSS custom-property overrides (no utility classes, no bespoke component CSS beyond layout). Dark/light theming follows Pico's own `prefers-color-scheme` mechanism, with a manual toggle switch reusing the existing `site.js`/`data-theme-toggle` checkbox pattern already used by the `tdom`/Starlette app in this repo (that toggle affects native form-control coloring, not the CSS variable cascade — see the design spec's "Technical approach" section for why that's acceptable here).

**Tech Stack:** HTML5, CSS3 (Pico CSS v2.1.1 classless, vendored — no CDN), vanilla JS (copied from `src/satyrn_ai_theme/static/site.js`), no build tooling.

## Global Constraints

- Everything must be self-contained under `site/` with no CDN or external network dependency at runtime (design spec: "Technical approach").
- No JavaScript framework, no build step — Cloudflare Pages serves `site/` directly (design spec: "Deployment").
- Use classless Pico CSS: semantic HTML only, theming via CSS custom-property overrides, no `class="btn-primary"`-style bespoke component classes (design spec: "Technical approach").
- Reuse `src/satyrn_ai_theme/static/site.js` and its `data-theme-toggle` checkbox pattern as-is, unmodified (design spec: "Technical approach").
- Palette: parchment `#f7f1e3` background / ink `#1c1a17` text in light mode; burnt-orange `#c8722c` and Saturn gold `#e8b93d` as primary accents; muted indigo `#2d3f6b` as a secondary accent (design spec: "Brand source material").
- Copy is fixed by the design spec: headline "AI Our Way", the value-proposition paragraph, the "Jupyter for agents" mission paragraph, and the four pillars (Open Source, Community-Owned, Local-First, European) (design spec: "Copy direction").
- File layout is fixed by the design spec's "File layout" section — do not deviate from the listed paths except where this plan explicitly notes a refinement (favicon format, below).

---

## File Structure

```
site/
  index.html                       # the single page
  css/
    pico.classless.min.css         # vendored Pico v2.1.1 classless build
    style.css                      # brand variable overrides + layout rules
  js/
    site.js                        # copied verbatim from src/satyrn_ai_theme/static/site.js
  assets/
    satyrn-logo-light.svg          # copy of "SATYRN (2).svg" — solid black wordmark, light mode
    satyrn-logo-dark.svg           # copy of "SATYRN (1).svg" — faded wordmark, dark mode
    avatar.svg                     # copy of avatar2.svg — hero illustration
    favicon.png                    # ringed-planet-only crop, see Task 2 (PNG, not SVG —
                                    # the source SVGs have no clean sub-path to extract just
                                    # the ring without also pulling in wordmark letterforms
                                    # that arc down into that region; a raster crop from a
                                    # rendered PNG is the practical way to isolate it cleanly)
```

---

### Task 1: Scaffold the site directory and vendor Pico CSS

**Files:**
- Create: `site/index.html` (placeholder shell only — full markup comes in Task 3)
- Create: `site/css/pico.classless.min.css`
- Create: `site/css/style.css` (empty file, populated in Task 4)
- Create: `site/js/site.js` (copy of `src/satyrn_ai_theme/static/site.js`)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: `site/css/pico.classless.min.css` (vendored Pico stylesheet, linked by later tasks), `site/js/site.js` (theme-toggle script, linked by later tasks), the `site/` directory tree itself

- [ ] **Step 1: Create the directory tree**

```bash
mkdir -p site/css site/js site/assets
```

- [ ] **Step 2: Vendor Pico's classless build**

Download the exact build used elsewhere in this repo (Pico v2.1.1) in its classless variant, and save it locally so the page has no CDN dependency:

```bash
curl -fsSL "https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css" -o site/css/pico.classless.min.css
```

- [ ] **Step 3: Verify the vendored file**

```bash
head -c 120 site/css/pico.classless.min.css
```

Expected: output starts with `@charset "UTF-8";/*!` and mentions `Pico CSS` and `v2.1.1`.

- [ ] **Step 4: Copy the theme-toggle script verbatim**

```bash
cp src/satyrn_ai_theme/static/site.js site/js/site.js
diff src/satyrn_ai_theme/static/site.js site/js/site.js
```

Expected: `diff` produces no output (files identical).

- [ ] **Step 5: Create an empty style.css placeholder**

```bash
touch site/css/style.css
```

- [ ] **Step 6: Create a minimal placeholder index.html so the directory is a working page**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>Satyrn AI — AI Our Way</title>
    <link rel="stylesheet" href="css/pico.classless.min.css">
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body>
    <main>
      <h1>Satyrn AI</h1>
    </main>
    <script type="module" src="js/site.js"></script>
  </body>
</html>
```

Write this to `site/index.html`.

- [ ] **Step 7: Serve and verify it loads**

```bash
python3 -m http.server 8123 --directory site &
sleep 1
curl -fsS http://localhost:8123/ | grep -o '<h1>Satyrn AI</h1>'
kill %1
```

Expected: prints `<h1>Satyrn AI</h1>`.

- [ ] **Step 8: Commit**

```bash
git add site/index.html site/css/pico.classless.min.css site/css/style.css site/js/site.js
git commit -m "Scaffold static site directory and vendor Pico classless CSS"
```

---

### Task 2: Prepare and copy visual assets

**Files:**
- Create: `site/assets/satyrn-logo-light.svg` (copy of `src/satyrn_ai_theme/static/SATYRN (2).svg`)
- Create: `site/assets/satyrn-logo-dark.svg` (copy of `src/satyrn_ai_theme/static/SATYRN (1).svg`)
- Create: `site/assets/avatar.svg` (copy of `src/satyrn_ai_theme/static/avatar2.svg`)
- Create: `site/assets/favicon.png`

**Interfaces:**
- Consumes: `src/satyrn_ai_theme/static/SATYRN (1).svg`, `src/satyrn_ai_theme/static/SATYRN (2).svg`, `src/satyrn_ai_theme/static/avatar2.svg`
- Produces: `site/assets/satyrn-logo-light.svg`, `site/assets/satyrn-logo-dark.svg`, `site/assets/avatar.svg`, `site/assets/favicon.png` (all referenced by `site/index.html` in Task 3)

- [ ] **Step 1: Copy the wordmark and avatar SVGs with their new names**

```bash
cp "src/satyrn_ai_theme/static/SATYRN (2).svg" site/assets/satyrn-logo-light.svg
cp "src/satyrn_ai_theme/static/SATYRN (1).svg" site/assets/satyrn-logo-dark.svg
cp src/satyrn_ai_theme/static/avatar2.svg site/assets/avatar.svg
```

- [ ] **Step 2: Verify the three files copied correctly**

```bash
diff "src/satyrn_ai_theme/static/SATYRN (2).svg" site/assets/satyrn-logo-light.svg
diff "src/satyrn_ai_theme/static/SATYRN (1).svg" site/assets/satyrn-logo-dark.svg
diff src/satyrn_ai_theme/static/avatar2.svg site/assets/avatar.svg
```

Expected: all three `diff` commands produce no output.

- [ ] **Step 3: Render the avatar SVG to a PNG so the favicon can be cropped from it**

The avatar's balloon (a ringed planet with no lettering near it) is a cleaner favicon source than the wordmark logos, whose "SATYRN" letters arc down into the ring area and can't be cropped out with a rectangular crop. Render at a fixed, reproducible size:

```bash
mkdir -p /tmp/satyrn-favicon
qlmanage -t -s 1200 -o /tmp/satyrn-favicon site/assets/avatar.svg
ls /tmp/satyrn-favicon
```

Expected: produces `avatar.svg.png` at 1200×1200 pixels (verify with `sips -g pixelWidth -g pixelHeight /tmp/satyrn-favicon/avatar.svg.png` — should print `pixelWidth: 1200` / `pixelHeight: 1200`).

- [ ] **Step 4: Crop the ringed-planet balloon out of the render**

This crop box (pixels, on the 1200×1200 render from Step 3) isolates the balloon cleanly, with no wordmark letters or badge-circle border bleeding in:

```bash
uv run --with pillow python3 -c "
from PIL import Image
im = Image.open('/tmp/satyrn-favicon/avatar.svg.png').convert('RGBA')
crop = im.crop((780, 130, 1090, 400))
crop = crop.resize((256, 216), Image.LANCZOS)
crop.save('site/assets/favicon.png')
print(crop.size)
"
```

Expected: prints `(256, 216)`.

- [ ] **Step 5: Verify the favicon visually**

Read `site/assets/favicon.png` and confirm it shows a clean gold ringed-planet balloon on a cream background with no stray letterforms or border-arc fragments. If any text or arc fragment is visible, adjust the crop box in Step 4 (nudge the left/top edges inward) and re-run.

- [ ] **Step 6: Commit**

```bash
git add site/assets/
git commit -m "Add copied and cropped visual assets for the static site"
```

---

### Task 3: Build the page markup and content

**Files:**
- Modify: `site/index.html` (replace the Task 1 placeholder with the full page)

**Interfaces:**
- Consumes: `site/css/pico.classless.min.css`, `site/css/style.css`, `site/js/site.js`, `site/assets/satyrn-logo-light.svg`, `site/assets/satyrn-logo-dark.svg`, `site/assets/avatar.svg`, `site/assets/favicon.png` (all from Tasks 1–2)
- Produces: the DOM structure and `id`/`class` hooks Task 4's CSS targets: `header > nav`, `img.logo-light` / `img.logo-dark`, `label[data-theme-toggle-label] input[data-theme-toggle]`, `section#hero` with `.hero-grid`, `section#pillars` with `.pillars-grid` and four `article`, `section#mission` with `.mission-grid`, `footer#get-involved`

- [ ] **Step 1: Write the full page markup**

Replace the contents of `site/index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <title>Satyrn AI — AI Our Way</title>
    <meta name="description" content="Satyrn is Jupyter for agents: open source, community-owned, local-first AI tooling for Python developers.">
    <link rel="icon" type="image/png" href="assets/favicon.png">
    <link rel="stylesheet" href="css/pico.classless.min.css">
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body>
    <header>
      <nav>
        <ul>
          <li>
            <a href="#" aria-label="Satyrn AI home">
              <img class="logo-light" src="assets/satyrn-logo-light.svg" alt="Satyrn" height="40">
              <img class="logo-dark" src="assets/satyrn-logo-dark.svg" alt="Satyrn" height="40">
            </a>
          </li>
        </ul>
        <ul>
          <li><a href="#mission">Mission</a></li>
          <li><a href="#local-first">Local-First</a></li>
          <li><a href="#get-involved">Get Involved</a></li>
          <li>
            <label>
              <input type="checkbox" role="switch" data-theme-toggle aria-label="Toggle dark mode">
            </label>
          </li>
        </ul>
      </nav>
    </header>

    <main>
      <section id="hero">
        <div class="hero-grid">
          <div class="hero-text">
            <p><mark>Jupyter for agents</mark></p>
            <h1>AI Our Way</h1>
            <p>Python developers want AI they can trust: open source, community-owned, local-first, thriving and innovative. Cherry on top? European.</p>
            <p>
              <a href="#get-involved" role="button">Get Involved</a>
              <a href="#mission">Read the mission &rarr;</a>
            </p>
          </div>
          <div class="hero-image">
            <img src="assets/avatar.svg" alt="Illustration of a curly-haired girl holding a balloon shaped like a ringed planet, the Satyrn mascot" width="600">
          </div>
        </div>
      </section>

      <section id="pillars">
        <h2>Built on four pillars</h2>
        <div class="pillars-grid">
          <article>
            <h3>Open Source</h3>
            <p>Every line is public. Fork it, audit it, ship it — no black boxes.</p>
          </article>
          <article>
            <h3>Community-Owned</h3>
            <p>Built by the people who use it, governed in the open, not owned by a single vendor.</p>
          </article>
          <article id="local-first">
            <h3>Local-First</h3>
            <p>Runs on your machine, on your terms — no mandatory round-trip to someone else's cloud.</p>
          </article>
          <article>
            <h3>European</h3>
            <p>Developed under European data and governance norms, from the ground up.</p>
          </article>
        </div>
      </section>

      <section id="mission">
        <div class="mission-grid">
          <img src="assets/satyrn-logo-light.svg" class="mission-mark logo-light" alt="" width="180">
          <img src="assets/satyrn-logo-dark.svg" class="mission-mark logo-dark" alt="" width="180">
          <div>
            <h2>Jupyter for agents</h2>
            <p>Satyrn is &ldquo;Jupyter for agents&rdquo;: a project to keep coding and coders in agentic coding by building subagents and tooling that helps Local AI succeed. From us, for us.</p>
          </div>
        </div>
      </section>
    </main>

    <footer id="get-involved">
      <img class="logo-light" src="assets/satyrn-logo-light.svg" alt="Satyrn" height="32">
      <img class="logo-dark" src="assets/satyrn-logo-dark.svg" alt="Satyrn" height="32">
      <p>AI our way.</p>
      <p>
        <a href="#">GitHub</a> &middot;
        <a href="#">Community</a>
      </p>
      <p><small>&copy; 2026 Satyrn AI</small></p>
    </footer>

    <script type="module" src="js/site.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify the page is well-formed and every referenced asset resolves**

```bash
python3 -m http.server 8123 --directory site &
sleep 1
for path in / css/pico.classless.min.css css/style.css js/site.js \
  assets/satyrn-logo-light.svg assets/satyrn-logo-dark.svg assets/avatar.svg assets/favicon.png; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:8123/$path")
  echo "$path -> $code"
done
kill %1
```

Expected: every line prints `-> 200`.

- [ ] **Step 3: Verify section anchors are present**

```bash
grep -o 'id="[a-z-]*"' site/index.html
```

Expected output includes `id="hero"`, `id="pillars"`, `id="local-first"`, `id="mission"`, `id="get-involved"`.

- [ ] **Step 4: Commit**

```bash
git add site/index.html
git commit -m "Add full landing page markup and copy"
```

---

### Task 4: Theme and layout CSS

**Files:**
- Modify: `site/css/style.css`

**Interfaces:**
- Consumes: the CSS custom properties defined by `site/css/pico.classless.min.css` (`--pico-background-color`, `--pico-color`, `--pico-h1-color` through `--pico-h6-color`, `--pico-primary`, `--pico-primary-background`, `--pico-primary-hover`, `--pico-primary-hover-background`, `--pico-primary-underline`, `--pico-primary-focus`, `--pico-primary-inverse`, `--pico-muted-color`, `--pico-card-background-color`, `--pico-card-border-color`); the `.logo-light`/`.logo-dark`, `#hero .hero-grid`, `#pillars .pillars-grid`, `#mission .mission-grid` hooks from Task 3
- Produces: the final visual theme, consumed only by the browser (last task with a CSS deliverable)

- [ ] **Step 1: Write the brand palette and logo-swap rules**

Replace the contents of `site/css/style.css` with:

```css
/* Brand palette — light mode (default) */
:root {
  --pico-background-color: #f7f1e3;
  --pico-color: #1c1a17;
  --pico-h1-color: #1c1a17;
  --pico-h2-color: #1c1a17;
  --pico-h3-color: #1c1a17;
  --pico-h4-color: #1c1a17;
  --pico-h5-color: #1c1a17;
  --pico-h6-color: #1c1a17;
  --pico-muted-color: #6b5f4d;
  --pico-primary: #c8722c;
  --pico-primary-background: #c8722c;
  --pico-primary-border: #c8722c;
  --pico-primary-underline: rgba(200, 114, 44, 0.5);
  --pico-primary-hover: #a85f22;
  --pico-primary-hover-background: #a85f22;
  --pico-primary-hover-border: #a85f22;
  --pico-primary-hover-underline: #a85f22;
  --pico-primary-focus: rgba(232, 185, 61, 0.5);
  --pico-primary-inverse: #f7f1e3;
  --pico-card-background-color: #fffaf0;
  --pico-card-border-color: rgba(28, 26, 23, 0.15);
  --pico-border-color: rgba(28, 26, 23, 0.15);
}

/* Brand palette — dark mode (follows OS preference, same mechanism Pico itself uses) */
@media only screen and (prefers-color-scheme: dark) {
  :root:not([data-theme]) {
    --pico-background-color: #1c1a17;
    --pico-color: #f0e6d2;
    --pico-h1-color: #f0e6d2;
    --pico-h2-color: #f0e6d2;
    --pico-h3-color: #f0e6d2;
    --pico-h4-color: #f0e6d2;
    --pico-h5-color: #f0e6d2;
    --pico-h6-color: #f0e6d2;
    --pico-muted-color: #b8ab8f;
    --pico-primary: #e8b93d;
    --pico-primary-background: #c8722c;
    --pico-primary-border: #c8722c;
    --pico-primary-underline: rgba(232, 185, 61, 0.5);
    --pico-primary-hover: #f2cc63;
    --pico-primary-hover-background: #a85f22;
    --pico-primary-hover-border: #a85f22;
    --pico-primary-hover-underline: #f2cc63;
    --pico-primary-focus: rgba(232, 185, 61, 0.5);
    --pico-primary-inverse: #1c1a17;
    --pico-card-background-color: #26221d;
    --pico-card-border-color: rgba(240, 230, 210, 0.15);
    --pico-border-color: rgba(240, 230, 210, 0.15);
  }
}

/* Logo swap: show the solid-text mark in light mode, the faded-text mark in dark mode */
.logo-dark {
  display: none;
}

@media only screen and (prefers-color-scheme: dark) {
  :root:not([data-theme]) .logo-light {
    display: none;
  }
  :root:not([data-theme]) .logo-dark {
    display: inline;
  }
}

nav img {
  vertical-align: middle;
}
```

- [ ] **Step 2: Add the hero, pillars, and mission layout rules**

Append to `site/css/style.css`:

```css
/* Hero */
#hero .hero-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 3rem;
  align-items: center;
}

#hero .hero-image img {
  width: 100%;
  height: auto;
}

/* Pillars */
#pillars .pillars-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

/* Mission */
#mission .mission-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  align-items: center;
}

.mission-mark.logo-dark {
  display: none;
}

@media only screen and (prefers-color-scheme: dark) {
  :root:not([data-theme]) .mission-mark.logo-light {
    display: none;
  }
  :root:not([data-theme]) .mission-mark.logo-dark {
    display: inline;
  }
}

/* Footer */
footer#get-involved {
  text-align: center;
}

footer#get-involved img {
  display: inline-block;
}

footer#get-involved .logo-dark {
  display: none;
}

@media only screen and (prefers-color-scheme: dark) {
  :root:not([data-theme]) footer#get-involved .logo-light {
    display: none;
  }
  :root:not([data-theme]) footer#get-involved .logo-dark {
    display: inline-block;
  }
}

/* Responsive: stack the hero and pillars below 900px */
@media (max-width: 900px) {
  #hero .hero-grid {
    grid-template-columns: 1fr;
  }

  #pillars .pillars-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  #mission .mission-grid {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

@media (max-width: 520px) {
  #pillars .pillars-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Verify the CSS parses and loads with no console errors**

```bash
python3 -m http.server 8123 --directory site &
sleep 1
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8123/css/style.css
kill %1
```

Expected: `200`.

- [ ] **Step 4: Visual check in the browser**

Open `http://localhost:8123/` in a browser (or use the Claude Browser preview tool pointed at the `site` dev server). Confirm:
- Background is parchment/cream, text is ink black, in light mode.
- The nav shows the solid-black-text logo in light mode.
- The four pillar cards render side by side on a wide viewport, and stack to 2-then-1 columns as the viewport narrows below 900px and 520px.
- The hero shows text on the left, the avatar illustration on the right, on a wide viewport, and stacks on narrow viewports.
- Toggling the OS/browser color scheme to dark (e.g. via browser devtools "emulate CSS prefers-color-scheme") switches the background to ink black, text to parchment, and swaps both the nav and mission logos to the faded-text dark-mode mark.

- [ ] **Step 5: Commit**

```bash
git add site/css/style.css
git commit -m "Add brand theme and responsive layout CSS"
```

---

### Task 5: Verify the theme-toggle switch

**Files:**
- None modified (this task is verification-only, exercising Task 1's copied `site.js` against Task 3's markup and Task 4's CSS)

**Interfaces:**
- Consumes: `site/js/site.js` (Task 1), the `input[data-theme-toggle]` element in `site/index.html` (Task 3)
- Produces: nothing (no later task depends on this one)

- [ ] **Step 1: Serve the site and open it in the browser**

```bash
python3 -m http.server 8123 --directory site &
sleep 1
```

Open `http://localhost:8123/` in the Claude Browser preview tool.

- [ ] **Step 2: Confirm the toggle switch is present and wired up**

Check the browser console for JS errors on load (there should be none), and confirm `document.querySelector('[data-theme-toggle]')` is non-null.

- [ ] **Step 3: Click the toggle switch**

Click the checkbox in the nav. Confirm:
- `localStorage.getItem('theme')` becomes `"dark"` after the click (and `"light"` if clicked again).
- `document.documentElement.style.colorScheme` matches the same value.

This confirms `site.js` is running correctly against the new markup — per the design spec, the switch does not force the brand-color CSS variables (those stay keyed to the OS `prefers-color-scheme`, matching Pico's own dark-mode mechanism), so no visual color change from the click alone is expected.

- [ ] **Step 4: Stop the server**

```bash
kill %1
```

No commit — this task makes no file changes.

---

### Task 6: Final cross-browser and responsive verification

**Files:**
- None modified (verification-only)

**Interfaces:**
- Consumes: the complete site from Tasks 1–4
- Produces: nothing (final task)

- [ ] **Step 1: Serve the site**

```bash
python3 -m http.server 8123 --directory site &
sleep 1
```

- [ ] **Step 2: Check the page at desktop width**

Open `http://localhost:8123/` in the Claude Browser preview tool at a desktop viewport (1280×800). Confirm the hero, pillars (4-across), and mission sections all render without overlapping text or images, and the nav logo and links are visible in a single row.

- [ ] **Step 3: Check the page at mobile width**

Resize the preview viewport to mobile (375×812). Confirm the hero stacks (text above image or vice versa), pillars stack to a single column, and the nav does not overflow horizontally.

- [ ] **Step 4: Confirm no broken links or missing assets**

```bash
grep -o 'src="[^"]*"\|href="[^"]*"' site/index.html | sed 's/^\(src\|href\)="//;s/"$//' | grep -v '^#' | while read -r path; do
  if [ -f "site/$path" ]; then
    echo "OK: $path"
  else
    echo "MISSING: $path"
  fi
done
```

Expected: every local asset path (everything except the `#`-anchor and placeholder `#` links) prints `OK:`.

- [ ] **Step 5: Stop the server**

```bash
kill %1
```

No commit — this task makes no file changes. If Step 2–4 surface any issue, fix it in the relevant earlier task's files and re-run this task's checks before considering the plan complete.
