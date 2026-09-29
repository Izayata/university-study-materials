# Füles Jegyzetek

Static HTML/CSS/JS site for hosting class notes, practice exercises, and
worked exam topics, served by GitHub Pages at
`https://fulesjegyzetek.hu`, with AdSense ad slots and a Ko-fi tip
widget placed in every content template.
`CLAUDE.md` has the full conventions and the history behind them.

## Content structure

Four parallel content sections, each with its own landing page, template,
and a filled example where one exists:

| Section (Hungarian) | Landing page | Template | Example |
|---|---|---|---|
| Órai jegyzetek (class notes) | `/jegyzetek/` | `jegyzet-template.html` | `/jegyzetek/de-ttk-matematika-bsc/jegyzet1/` |
| Gyakorló feladatok (exercises) | `/gyakorlas/` | `gyakorlat-template.html` | none yet |
| Kidolgozott tételek (worked exam topics) | `/tetelek/` | `tetel-template.html` | `/tetelek/deik-mernokinformatikus-bsc-2017/tetel1/` |
| Oktatói jegyzetek (instructor's/tutoring notes) | `/oktatoi/` | `oktatoi-jegyzet-template.html` | `/oktatoi/inbpm0315-21/jegyzet1/` |

## File-based routing

Every page is a real, physical HTML file — no build step, no client-side
router. Two supported patterns:

- Clean URL: `tetelek/deik-mernokinformatikus-bsc-2017/tetel1/index.html`
  → served at `/tetelek/deik-mernokinformatikus-bsc-2017/tetel1/`
- Flat file: `jegyzet2.html` → served at `/jegyzet2.html`

Every item on the site uses the clean-URL pattern, nested under its
course. The flat-file pattern loses that nesting, so keep it for a
course-less one-off.

## Local testing

`nav.html` is loaded via `fetch()`, which browsers block on `file://` pages
due to CORS. Serve the folder over local HTTP instead:

```
python -m http.server 8000
# then open http://localhost:8000
```

(or use VS Code's "Live Server" extension.)

## Before you deploy

Already done: the domain (`fulesjegyzetek.hu` in every canonical URL,
`robots.txt`, `sitemap.xml` and `ads.txt`), the `CNAME` file, real
content in `about.html` and `privacy-policy.html`, and the Ko-fi tip
link. Still open:

1. Replace `pub-XXXXXXXXXXXXXXXX` in `ads.txt` with your AdSense publisher ID.
2. If you expect EEA/UK/Swiss student traffic and enable personalized ads,
   set up Google's free "Funding Choices" consent banner and load its
   script in `<head>` before the AdSense script (see comments in
   `privacy-policy.html`). The privacy policy already describes this
   banner as active, so it's ahead of reality until this is done.
3. Apply for AdSense only after a handful of items are published with real
   content in every section (`gyakorlas/` is still empty) — a
   near-empty site is one of the most common rejection reasons.
4. The site brand is currently "Füles Jegyzetek" (set in `nav.html`,
   `script.js`'s footer, and every `<title>`) — rename it in all three
   places if you want something different.

## Content nesting: section → course → item

Each of the four sections (`jegyzetek`, `gyakorlas`, `tetelek`,
`oktatoi`) nests items one level under a course landing page:
`/<szekció>/<kurzus-slug>/<itemN>/`, e.g.
`/oktatoi/inbpm0315-21/jegyzet1/`. The section landing pages
(`jegyzetek/index.html` etc.) list courses, and each course landing
page lists that course's items. A course's slug is a short,
URL-safe, descriptive name (lowercase, hyphens — e.g.
`deik-mernokinformatikus-bsc-2017`) picked once and reused identically
across every section the course appears in. A course doesn't have to
appear in every section.

Two courses add a second landing-page level between the course and its
items: `jegyzetek/deik-mernokinformatikus-bsc-2017/` by semester
(`semester-template.html`), and `jegyzetek/de-ttk-matematika-bsc/` by
topic (for example `kombinatorika-es-grafelmelet/`). Use that level
only when the site owner asks for it; see `CLAUDE.md` for the
details.

## Adding a new course

1. Copy `course-template.html` into each section it applies to, e.g.
   `jegyzetek/<kurzus-slug>/index.html`,
   `gyakorlas/<kurzus-slug>/index.html`,
   `tetelek/<kurzus-slug>/index.html`,
   `oktatoi/<kurzus-slug>/index.html`.
2. Fill in the course name and a short description in each.
3. Link each one from that section's landing page card grid (e.g.
   `jegyzetek/index.html`).
4. Add an entry to `sitemap.xml` for each new course landing page.

## Adding a new item

1. Copy the matching template (`jegyzet-template.html`,
   `gyakorlat-template.html`, `tetel-template.html` or
   `oktatoi-jegyzet-template.html`) into its course's folder, e.g.
   `oktatoi/inbpm0315-21/jegyzet11/index.html`. Some series keep a
   shape that differs from their template (see `CLAUDE.md`); for
   those, copy the newest existing item instead.
2. Replace the placeholder title, meta description, canonical URL, and
   breadcrumb (item number and course link).
3. Paste your content as plain `<p>`, `<h2>/<h3>`, `<ul>`, and
   `<pre><code>` — the three ad slots and the tip widget are already
   positioned.
4. Add a link to it from that course's landing page card grid (e.g.
   `oktatoi/inbpm0315-21/index.html`).
5. Add an entry to `sitemap.xml`.
6. If it's a new note/exercise/topic that references others, cross-link
   them.
