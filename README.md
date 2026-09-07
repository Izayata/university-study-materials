# University Lab Notes — starter site

Static HTML/CSS/JS site for hosting class notes, practice exercises, and
worked exam topics, built for GitHub Pages + a custom domain, with
AdSense ad slots and a tip-jar widget placed in every content template.

## Content structure

Three parallel content sections, each with its own landing page, template,
and one filled example:

| Section (Hungarian) | Landing page | Template | Example |
|---|---|---|---|
| Órai jegyzetek (class notes) | `/jegyzetek/` | `jegyzet-template.html` | `/jegyzetek/jegyzet1/` |
| Gyakorló feladatok (exercises) | `/gyakorlas/` | `gyakorlat-template.html` | `/gyakorlas/gyakorlat1/` |
| Kidolgozott tételek (worked exam topics) | `/tetelek/` | `tetel-template.html` | `/tetelek/tetel1/` |

## File-based routing

Every page is a real, physical HTML file — no build step, no client-side
router. Two supported patterns:

- Clean URL: `jegyzetek/jegyzet1/index.html` → served at `/jegyzetek/jegyzet1/`
- Flat file: `jegyzet2.html` → served at `/jegyzet2.html`

Copy the relevant `*-template.html` for each new item and pick whichever
pattern you prefer; both are equally crawlable.

## Local testing

`nav.html` is loaded via `fetch()`, which browsers block on `file://` pages
due to CORS. Serve the folder over local HTTP instead:

```
python -m http.server 8000
# then open http://localhost:8000
```

(or use VS Code's "Live Server" extension.)

## Before you deploy

1. Replace every `YOUR-DOMAIN.hu` placeholder (in `<link rel="canonical">`,
   `robots.txt`, `sitemap.xml`, `ads.txt`) with your real domain.
2. Replace `pub-XXXXXXXXXXXXXXXX` in `ads.txt` with your AdSense publisher ID.
3. Fill in `about.html` and `privacy-policy.html` with real content —
   AdSense reviewers check for both, and a missing/thin privacy policy is
   one of the most common rejection reasons.
4. The tip-jar link now points to Ko-fi (`https://ko-fi.com/<username>`,
   set in `script.js`'s `renderFooter()` and every content
   template/item page) — replace it if you want a different
   platform/username.
5. Add a `CNAME` file at the repo root containing just your domain
   (e.g. `notes.YOUR-DOMAIN.hu`) once you've configured the DNS record —
   this is what GitHub Pages needs to map the custom domain. Do this last,
   after DNS is actually pointed there, so Pages doesn't 404.
6. If you expect EEA/UK/Swiss student traffic and enable personalized ads,
   set up Google's free "Funding Choices" consent banner and load its
   script in `<head>` before the AdSense script (see comments in
   `privacy-policy.html`).
7. Apply for AdSense only after a handful of items are published with real
   content in every section — a near-empty site is the other common
   rejection reason.
8. The site brand is currently "Füles Jegyzetek" (set in `nav.html`,
   `script.js`'s footer, and every `<title>`) — rename it in all three
   places if you want something different.

## Content nesting: section → course → item

Each of the three sections (`jegyzetek`, `gyakorlas`, `tetelek`) nests
items one level under a course landing page:
`/<szekció>/<kurzus-slug>/<itemN>/`, e.g.
`/jegyzetek/prog-nyelvek-2/jegyzet1/`. The section landing pages
(`jegyzetek/index.html` etc.) list courses, and each course landing
page lists that course's items. A course's slug is a short,
URL-safe, descriptive name (lowercase, hyphens — e.g. `prog-nyelvek-2`
for "Magas szintű programozási nyelvek 2") picked once and reused
identically across all three sections for the same course.

## Adding a new course

1. Copy `course-template.html` into each section it applies to, e.g.
   `jegyzetek/<kurzus-slug>/index.html`,
   `gyakorlas/<kurzus-slug>/index.html`,
   `tetelek/<kurzus-slug>/index.html`.
2. Fill in the course name, code, and a short description in each.
3. Link each one from that section's landing page card grid (e.g.
   `jegyzetek/index.html`).
4. Add an entry to `sitemap.xml` for each new course landing page.

## Adding a new item

1. Copy the matching template (`jegyzet-template.html`,
   `gyakorlat-template.html`, or `tetel-template.html`) into its
   course's folder, e.g. `jegyzetek/prog-nyelvek-2/jegyzet2/index.html`.
2. Replace the placeholder title, meta description, canonical URL, and
   breadcrumb (item number and course link).
3. Paste your content as plain `<p>`, `<h2>/<h3>`, `<ul>`, and
   `<pre><code>` — the three ad slots and the tip widget are already
   positioned.
4. Add a link to it from that course's landing page card grid (e.g.
   `jegyzetek/prog-nyelvek-2/index.html`).
5. Add an entry to `sitemap.xml`.
6. If it's a new note/exercise/topic that references others, cross-link
   them (see how `gyakorlat1` links back to `jegyzet1`).
