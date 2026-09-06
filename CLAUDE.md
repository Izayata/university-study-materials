# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static HTML/CSS/vanilla-JS site (no build tool, no framework, no
`package.json`) hosting the site owner's own class notes, practice
exercises, and worked exam topics (Hungarian CS coursework, e.g.
"Magas szintű programozási nyelvek 2"-style content) — independently
produced, not affiliated with or endorsed by any specific university
(see `about.html`). Deployed via GitHub Pages (`Deploy from a branch`,
`main` / root) at the custom domain `fulesjegyzetek.hu`, monetized with
Google AdSense + a Buy Me a Coffee tip widget. Site content is Hungarian
(`lang="hu"`); file/folder names and code comments are intentionally
English — this was an explicit decision, don't translate identifiers.

## Development commands

There is no build, lint, or test step. The only command needed:

```
python -m http.server 8000
# then open http://localhost:8000
```

This is required (not optional) because `nav.html` is loaded via
`fetch()` in `script.js`, and browsers block `fetch()` on `file://`
pages due to CORS — double-clicking an HTML file will silently fail to
load the nav.

## Architecture

### Root-relative paths assume domain-root hosting

Every internal link and asset reference (`/style.css`, `/script.js`,
`/nav.html`, `/jegyzetek/`, etc.) is root-relative by design, because the
production home is the custom domain root `fulesjegyzetek.hu` (`CNAME`
file at the repo root + Cloudflare DNS + GitHub Pages custom-domain
setting, configured 2026-09-06 — see the Deployment state note below).
This still breaks navigation/styling when tested on the GitHub Pages
*project* subpath (`https://izayata.github.io/university-study-materials/`),
since the browser resolves `/nav.html` against the domain root, not the
repo subpath — confirmed 404 in testing there. On the real custom
domain this isn't an issue, since the domain root and the site root are
the same thing. Don't "fix" it by converting to relative paths unless
explicitly asked — that's a deliberate, previously-discussed tradeoff,
not a bug.

### Shared nav/footer, no framework

- `nav.html` is a bare HTML fragment (header + `<nav>`), not a full
  document. `script.js` `fetch()`s it into `<div id="site-header">` on
  every page, on `DOMContentLoaded`. Edit **only** `nav.html` to change
  menu items site-wide.
- The footer is *not* fetched — it's a JS template string
  (`renderFooter()` in `script.js`) injected into `<div id="site-footer">`.
  This avoids a second network round-trip for a small, rarely-changing
  block. If you need to change footer links, edit the string in
  `script.js`, not a fragment file.
- Active-link highlighting: every page's `<body data-nav-key="...">`
  must match a `data-nav-key` on one of the links in `nav.html`
  (`home`, `jegyzetek`, `gyakorlas`, `tetelek`, plus `about`/`privacy`
  used only for highlighting, since those links live in the footer, not
  the main nav). `script.js` sets `.is-active` after the nav fragment
  loads.
- `script.js` also auto-builds a table of contents (scans
  `main.content h2, h3` into `#toc-list` inside `<aside class="toc">`,
  present only on `with-toc` pages) and adds a copy button to every
  `<pre><code>` block. Both run unconditionally on every page load; they
  no-op if the target elements aren't present.

### Content model: three parallel sections

| Section (Hungarian) | Landing page | Template to copy | Filled example |
|---|---|---|---|
| Órai jegyzetek (class notes) | `/jegyzetek/` | `jegyzet-template.html` | `/jegyzetek/jegyzet1/` |
| Gyakorló feladatok (exercises) | `/gyakorlas/` | `gyakorlat-template.html` | `/gyakorlas/gyakorlat1/` |
| Kidolgozott tételek (worked exam topics) | `/tetelek/` | `tetel-template.html` | `/tetelek/tetel1/` |

There used to be a fourth section ("Labor") — it was merged into "Órai
jegyzetek" and no longer exists as a separate concept; don't reintroduce
a `labs/` path.

Each item page is a real, physical file (no server-side/client-side
router) using one of two equivalent patterns:
- Clean URL: `jegyzetek/jegyzetN/index.html` → served at `/jegyzetek/jegyzetN/`
- Flat file: `jegyzetN.html` → served at `/jegyzetN.html`

To add a new item: copy the matching `*-template.html`, fill in the
placeholder title/meta description/canonical URL/breadcrumb, link it
from that section's landing page card grid, and add it to
`sitemap.xml`. Full checklist is in `README.md` under "Adding a new
item".

### Ad slots and tip widget are static, not injected

`.ad-slot` blocks and the `.support-callout` (Buy Me a Coffee) are plain
HTML in every content page, not JS-generated — this is deliberate so the
AdSense crawler sees them on first paint. Their positions (post-intro,
mid-content, end-of-content-before-tip-widget) reflect a specific
placement strategy; preserve them when copying templates rather than
consolidating or repositioning ad slots.

### CSS naming

`.card-grid` / `.item-card` / `.item-meta` are shared, generic class
names used across all three sections (they were renamed from
lab-specific names during a refactor when the site grew beyond just
"Labor" content). Don't reintroduce section-specific class names
(e.g. `.lab-card`) — extend the generic ones instead.

### Site brand has no single source of truth

"Egyetemi segédanyagok" (placeholder brand name) is duplicated in three
places by construction: `nav.html`, the `renderFooter()` string in
`script.js`, and the `<title>`/`og:title` of every page. If asked to
rename the brand, all three must be updated together — there's no
config variable for it.

### Deployment state

- `origin` → `github.com/Izayata/university-study-materials.git`, `main`
  branch, GitHub Pages set to "Deploy from a branch" / root.
- Live at the custom domain `https://fulesjegyzetek.hu` (configured
  2026-09-06, HTTPS enforced). DNS is managed on Cloudflare (nameservers
  moved off Rackhost/dns24.hu): 4 `A` records on the apex pointing at
  GitHub Pages' IPs (`185.199.108.153`–`185.199.111.153`) plus a `www`
  `CNAME` to `izayata.github.io`, all kept **"DNS only" (unproxied)** —
  proxying (orange-cloud) would route traffic through Cloudflare's edge
  and conflict with GitHub Pages' own SSL cert unless the SSL/TLS mode
  is separately reconfigured, so don't turn proxying on without also
  addressing that. The old GitHub Pages subpath URL
  (`https://izayata.github.io/university-study-materials/`) still
  exists but is superseded — see the root-relative-paths note above for
  why it renders unstyled/without nav.
- `ads.txt`, `robots.txt`, `sitemap.xml`, and every page's
  `<link rel="canonical">` now point at `fulesjegyzetek.hu` (the
  `YOUR-DOMAIN.hu` placeholder is gone). `ads.txt` still has the
  `pub-XXXXXXXXXXXXXXXX` placeholder — needs the real AdSense publisher
  ID once an AdSense account exists.
- `about.html` and `privacy-policy.html` now have real content (bio,
  course scope/non-affiliation note, contact email, GDPR data-transfer
  and user-rights sections with a NAIH complaint link) instead of
  placeholder text. The privacy policy's consent-banner paragraph
  describes the EEA/UK/Swiss Funding Choices banner as already active —
  it isn't wired up yet, so that claim will be ahead of reality until
  it's implemented. See `README.md` "Before you deploy" for what's
  still open: AdSense publisher ID, Buy Me a Coffee username (currently
  `YOUR-USERNAME` in `script.js`'s `renderFooter()`), the Funding
  Choices banner itself, and applying for AdSense only once content
  exists across all three sections.
