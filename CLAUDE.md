# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static HTML/CSS/vanilla-JS site (no build tool, no framework, no
`package.json`) hosting the site owner's own class notes, practice
exercises, and worked exam topics (Hungarian CS coursework, e.g.
"Java alapok"-style content) — independently produced, not affiliated
with or endorsed by any specific university
(see `about.html`). Deployed via GitHub Pages (`Deploy from a branch`,
`main` / root) at the custom domain `fulesjegyzetek.hu`, monetized with
Google AdSense + a Ko-fi tip widget. Site content is Hungarian
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

### Content model: three parallel sections, nested by course

| Section (Hungarian) | Landing page | Item template | Filled example |
|---|---|---|---|
| Órai jegyzetek (class notes) | `/jegyzetek/` | `jegyzet-template.html` | `/jegyzetek/java-alapok/jegyzet1/` |
| Gyakorló feladatok (exercises) | `/gyakorlas/` | `gyakorlat-template.html` | `/gyakorlas/java-alapok/gyakorlat1/` |
| Kidolgozott tételek (worked exam topics) | `/tetelek/` | `tetel-template.html` | `/tetelek/deik-mernokinformatikus-bsc-2017/tetel1/` |

There used to be a fourth section ("Labor") — it was merged into "Órai
jegyzetek" and no longer exists as a separate concept; don't reintroduce
a `labs/` path.

Each section nests items one level under a **course landing page**
(added 2026-09-07, since the site now covers — or will cover — more
than one university course): `/<szekció>/<kurzus-slug>/<itemN>/`.
Course slugs are hand-picked, descriptive, URL-safe names — not a
course code or a generic "kurzus1" counter — chosen once per course
and reused identically across every section that course appears in.
The section landing pages (`jegyzetek/index.html` etc.) list courses
via `.card-grid`/`.item-card`; each course landing page (copied from
`course-template.html`) then lists that course's items the same way.

A course does not need to appear under all three sections — `tetelek/`
currently has a different course (`deik-mernokinformatikus-bsc-2017`,
added 2026-09-09) than `jegyzetek/`/`gyakorlas/` (`java-alapok`),
since `java-alapok`'s only `tétel` was retired (see below) and never
replaced with real `java-alapok`-specific exam content. Don't assume
every course-landing page has counterparts in the other two sections.

The course was originally named after its official university title,
"Magas szintű programozási nyelvek 2" (course code `INBPM0315-21`) —
both were removed site-wide on 2026-09-08 per a university request not
to identify the site's content by the official course name/code (the
slug was renamed too, from `prog-nyelvek-2`, since it was itself
derived from the forbidden name). The same request also covers
course-specific pedagogical-format terms, not just the name/code
itself: `jegyzet1`'s "1. labor gyakorlat" became "1 óra" the same day
for this reason. Don't reintroduce the old name, the course code, or
"labor gyakorlat"-style session labels, and don't add a course-code
field back to `course-template.html`'s item-meta — it was deliberately
removed along with this rename.

Both course-related URL migrations so far (adding the course layer,
then renaming its slug) left the old URLs 404ing rather than adding
redirect stubs — GitHub Pages has no native redirect support, and the
site's traffic/indexing has been negligible so far. Revisit this
default if that changes.

Each page (course landing or item) is a real, physical file (no
server-side/client-side router) using one of two equivalent patterns:
- Clean URL: `jegyzetek/java-alapok/jegyzet1/index.html` → served at `/jegyzetek/java-alapok/jegyzet1/`
- Flat file: `jegyzet2.html` → served at `/jegyzet2.html` (loses the course-nesting; only use this for a course-less one-off, if that ever comes up)

To add a new course: copy `course-template.html` into each relevant
section, fill in the placeholders, link it from that section's landing
page, and add it to `sitemap.xml`. To add a new item: copy the matching
`*-template.html` into its course's folder, fill in the placeholder
title/meta description/canonical URL/breadcrumb, link it from that
course's landing page card grid, and add it to `sitemap.xml`. Full
checklists are in `README.md` under "Adding a new course" and "Adding
a new item".

### Ad slots and tip widget are static, not injected

`.ad-slot` blocks and the `.support-callout` (Ko-fi) are plain
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

### Tables

Added 2026-09-09 (the second `tétel` under `deik-mernokinformatikus-bsc-2017`
was the first content to need one — a TCP/UDP comparison). Wrap every
`<table>` in `<div class="table-scroll">` so wide tables scroll
horizontally on narrow viewports instead of squeezing the table itself
illegible — see `style.css`'s "Tables" section (styles read from the
same `--color-border`/`--color-bg-alt` variables as everything else,
no new colors introduced). Reuse this pattern rather than inventing a
new one for future tabular content.

### Dark-only theme

The site has exactly one theme — dark — defined entirely through CSS
custom properties in `style.css`'s `:root` (`--color-bg`, `--color-text`,
`--color-border`, etc.); every themed rule in the file reads from these,
with one deliberate exception (`.support-btn`, the Ko-fi button, is
hardcoded black/white and needs no variable). There used to be a
`@media (prefers-color-scheme: dark)` override for a second, light
palette; it was removed on 2026-09-07 after the site was found to
inconsistently appear light or dark depending on each visitor's own
OS/browser setting — dark was made the only theme rather than just the
fallback. Every page's `<head>` also carries
`<meta name="color-scheme" content="dark">` and
`<meta name="theme-color" content="#0d1117">` so browser-native chrome
(scrollbars, form controls, mobile address-bar/status-bar tint)
matches too — both tags are already in every `*-template.html`, so new
pages inherit them. Don't reintroduce a light palette, a
`prefers-color-scheme` query, or a manual light/dark toggle without an
explicit ask — this was a deliberate simplification, not an oversight.

### Site brand has no single source of truth

"Füles Jegyzetek" (site brand) is duplicated in three places by
construction: `nav.html`, the `renderFooter()` string in `script.js`,
and the `<title>`/`og:title` of every page. If asked to rename the
brand, all three must be updated together — there's no config variable
for it.

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
  it's implemented. The tip widget was switched from the Buy Me a
  Coffee placeholder to Ko-fi (`https://ko-fi.com/izayata`, updated in
  `script.js`'s `renderFooter()` and every content template/item page)
  — chosen because Ko-fi charges 0% on one-time tips (vs. Buy Me a
  Coffee's flat 5%) and both Stripe and PayPal payouts are supported in
  Hungary. See `README.md` "Before you deploy" for what's still open:
  AdSense publisher ID, the Funding Choices banner itself, and applying
  for AdSense only once content exists across all three sections.

## Content style guide

Derived by reading the three live articles (`jegyzet1`, `gyakorlat1`,
`tetel1`) closely on 2026-09-09, not invented — every rule below is
backed by an actual pattern in the published content. This documents
how to *write* new jegyzet/gyakorlat/tétel content so it reads as one
voice; it doesn't cover HTML/CSS mechanics (see Architecture above)
or scope/length decisions for new items — those are per-item calls,
not something to standardize here.

### Two deliberate voices — don't blend them

- **Jegyzet (class notes) and gyakorlat (exercises)**: informal,
  addresses students directly in 2nd-person plural ("ti" register),
  imperative verbs — `"Írjatok egy..."`, `"Nyissatok egy
  szövegszerkesztőt..."`, `"Gondolkodjatok el rajta..."` — sometimes
  mixed with 1st-person-plural "we" when describing what happens
  together in class: `"ma ezeket Java szintaxisban gyakoroljuk be"`.
  This is a classroom voice — the writer is present, talking to the
  room.
- **Tétel (worked exam topics)**: formal, impersonal 3rd person, no
  "ti"/"mi" anywhere — reads like an actual exam-answer document:
  `"A változó egy elnevezett memóriaterület, amely egy értéket tárol,
  és amelynek értéke a program futása során megváltozhat."` This is
  intentional, not a gap to fix — a kidolgozott tétel is a portable,
  formal answer, not a classroom transcript.

### Em dash as the default connector

The single most consistent fingerprint across all three articles:
when a sentence needs to explain *why* a claim is true, or attach a
qualifying aside, it's appended to the same sentence with an em dash
(—) rather than started as a new sentence or introduced with a colon.
Examples as actually written:

- `"...ismeritek az előző félévből — ma ezeket Java szintaxisban
  gyakoroljuk be, nem nulláról tanuljuk."`
- `"A do-while ciklus magját előbb végrehajtja... — ezért a törzse
  mindig lefut legalább egyszer..."`
- `"...egy nevet (azonosítót) és — sok nyelvben — egy adattípust
  rendelünk."` (tétel's more formal register still uses it, just more
  sparingly, and sometimes as a mid-sentence parenthetical pair rather
  than a trailing clause)

Use this pattern for new content rather than defaulting to a second
sentence or a semicolon.

### Bold marks the one load-bearing phrase, never decoration

Bold is reserved for the single word/phrase that changes a sentence's
meaning if a reader skims past it: the term being defined
(`"**Java:** A Java egy statikusan típusos..."`), a key constraint
(`"**egy** parancssori argumentumként"`, `"**akkor is írja ki legalább
egyszer**"`), or the one fact worth flagging
(`"**Fontos megfigyelés:** a folyamat mindkét operációs rendszeren
**ugyanaz**..."`). Never bold a whole sentence, and never use bold for
generic emphasis.

### Arrows (→) show transformation, not just sequence

Used consistently for "this becomes/produces that": command → output
(`` `javac Hello.java` → létrejön a `Hello.class` ``), before → after
(`` `int truncated = (int) 4.9;` → `4` ``), or a step chain
(`` szerkesztés → `javac` → `java` ``). Use `→` in prose for this —
not "->" or "ami azt eredményezi, hogy".

### Quotation marks: straight ASCII, not Hungarian typographic

`"..."` throughout, for both quoted informal terms (`"burok"`,
`"write once, run anywhere"`) and quoted proper nouns (course names,
"Java alapok"). Not „lower-upper" Hungarian typographic quotes —
straight quotes are simpler and match how quotes already appear
inside `<code>` strings (`<code>"Sziasztok!"</code>`), so prose quotes
never visually clash with code quotes on the same page.

### Term definitions: two valid patterns, pick by context

- **Standalone paragraph** (jegyzet style, for a term that needs real
  explanation): `"**Fordító (compiler):** A javac parancs a Java
  forráskódot... fordítja."` — bold term (+ English name in parens if
  relevant), colon, then the explanation as normal prose in the same
  paragraph.
- **List-item label** (tétel style, for a short set of related terms
  that don't each need a paragraph): `"**Egész szám (integer)** — pl.
  `42`"` — bold term as the list item's lead-in, em dash, then a
  minimal example. No colon in this variant.

### Structural pattern per item type

**Jegyzet**: Tematika (`<ul>` outline, no elaboration) → Kontextus (2
short paragraphs on why this session matters / what's assumed already
known) → one `<h2>` per major topic (prose + `<h3>` for
platform-specific variants like Windows/Linux + code blocks) →
Gyakorlat (in-class exercise list, `<ol>`) → Puffer (buffer-time note
— present because a jegyzet page is literally a class-session agenda
with a time budget).

**Gyakorlat**: short intro paragraph only (no Tematika/Kontextus
headings) stating what's covered and any constraints → one `<h2>` per
exercise, numbered and difficulty-tagged inline in the heading itself
(`"N. feladat (Nehézség) — Cím"`) → each exercise gets 1–2 short
paragraphs stating the task, optionally a `"Példa: ..."` usage example
and/or a `"Segítség:"` hint or reflective question for harder ones. No
Puffer section — this is take-home work, not a scheduled class.

**Tétel**: short intro paragraph → "A tétel szövege" (`<h2>` +
`<blockquote>` containing the literal official exam question, phrased
as a formal imperative — `"Mutassa be..."`) → "Kidolgozás" (`<h2>`,
the actual answer, broken into `<h3>` subsections) → "Kapcsolódó
fogalmak" (`<h2>`, closing bullet list of related terms, no
elaboration — just the terms). No Gyakorlat/Puffer sections.

Deliberate exception: `tetelek/deik-mernokinformatikus-bsc-2017/tetel1/`
(added 2026-09-09) omits "A tétel szövege" entirely — its source notes
had no literal one-line exam question, only a topic outline — and uses
a "Témák" `<h2>` outline instead (adapting jegyzet's Tematika
pattern), confirmed with the site owner rather than invented. It also
goes one level deeper than any other tétel (numbered subtopics with
their own labeled sub-groups): rather than a 4th heading level —
`script.js`'s ToC only scans `h2, h3`, and `style.css` has no `h4`
styling — those sub-group labels are bold lead-in text before their
own `<ul>` (e.g. `<p><strong>Processzor technológiák:</strong></p>`).
Don't "fix" either of these into the standard pattern; they reflect
what the source material actually is, not a mistake.

### `item-meta` line: intentionally different per type, not drift

- Jegyzet: `Course · Session label · Frissítve: date` (3 parts) — e.g.
  `"Java alapok · 1 óra · Frissítve: 2026-09-08"`.
- Gyakorlat: `Course · Frissítve: date` (2 parts, no session label) —
  e.g. `"Java alapok · Frissítve: 2026-09-08"`.
- Tétel: `Frissítve: date` only (1 part — no course name at all) — e.g.
  `"Frissítve: 2026-09-05"`.

Don't unify these into one shared pattern. Jegyzet/gyakorlat are tied
to a specific course session; a tétel is meant to read as a portable,
course-agnostic reference, so it doesn't carry a course name — that's
by design, confirmed 2026-09-09.

### H1: no numbered prefix

Live convention (confirmed 2026-09-09, and `jegyzet-template.html`
updated to match): the `<h1>` is a bare descriptive title with no
"N. Jegyzet —" / "N. Gyakorlat —" / "N. Tétel —" prefix — the
breadcrumb already carries the item number, so repeating it in the H1
is redundant. `jegyzet1`'s `<h1>Java fordítási folyamat, alapok</h1>`
is the reference example. (`gyakorlat-template.html`/
`tetel-template.html` already matched this in spirit before — their
live examples use a numbered lead-in as part of a genuinely
descriptive title, e.g. `"1. hét — Gyakorló feladatok"`, rather than a
mechanical "N. Gyakorlat —" restatement; use judgment per item rather
than copying either pattern mechanically.)

## Task execution workflow

Follow this for every task. Don't skip steps, don't reorder them, and stop at the first
thing that doesn't hold rather than working around it. When a step says **STOP**, stop
and ask — do not improvise a recovery.

### Repo settings

- Default branch: `main` · Remote: `origin`
- Task IDs: not used in this repo — there is no issue tracker or epic doc. Omit the
  task-ID segment from branch names, commit trailers, and PR titles always.
- Test / lint / types / build: none exist (no `package.json`, no build step — see
  "Development commands" above). There is no automated gate; verification is manual —
  see step 5.

### Asking me things

I would rather answer a question than review a wrong guess. Asking is not a failure and
not an interruption — it is cheaper than the branch we'd have to throw away. Nothing in
this workflow is a reason to proceed on an assumption you aren't confident in.

**Ask whenever:**

- the task can be read more than one way, and the readings produce different code
- you'd have to invent something the task didn't specify — a name, a rule, a threshold,
  a convention, an edge-case behaviour
- you're unsure an API, library or config option works the way you're about to use it,
  and you can't verify it
- the task turns out to be larger, or to touch more, than its description implied
- you're about to do something that's hard to undo

**Ask well:**

- **Early.** A question before branching costs nothing. The same question after a PR is
  open costs a rewrite.
- **Batched.** Collect the open questions and ask them together, not one per turn.
- **Closed, not open.** "A or B — I'd take B because X" beats "how should I do this?"
  Give a lean; I'll usually just confirm it.
- **With a default.** Say what you'll do if I don't answer, so I can stay silent when it
  doesn't matter.
- **Numbered**, so I can reply "1: yes, 2: option B" instead of writing an essay.

**Don't ask about:**

- anything you can find out yourself — read the file, run the command, check the config,
  look at how the rest of the codebase already does it
- permission to take a step this workflow already says to take
- taste calls inside your own remit; make them, note them in one line, move on
- ten things when two of them actually change the outcome

**If I don't answer:** don't stall and don't guess silently. Take the default you named,
mark it as an assumption in the commit body and in the PR description, and carry on.

### 0. Preflight

```bash
git status --porcelain    # must be empty
git fetch origin
```

- Working tree not clean → **STOP**. Never stash, reset, discard or commit work you
  didn't create.
- Task ambiguous, or you'd have to guess at intent → **STOP** and ask before branching.
  Questions are cheap now and expensive after a PR exists.

### 1. Get onto an up-to-date `main`

```bash
git rev-parse --abbrev-ref HEAD    # where am I?
git checkout main                  # only if not already there
git pull --ff-only origin main
```

- `--ff-only` is deliberate: if the pull can't fast-forward, local `main` has diverged
  from origin. → **STOP**. Don't merge, rebase or force anything to resolve it.

### 2. Create the branch

Name: `<type>/<slug>` — the prefix must be exactly one of:

| prefix     | use for                                                          |
|------------|--------------------------------------------------------------------|
| `feature/` | new capability that didn't exist                                   |
| `fix/`     | behaviour that is broken                                            |
| `update/`  | changing something that already works — deps, config, copy, content, refactor |

No task IDs in this repo — the name is always `<type>/<slug>`, e.g.
`feature/gyakorlat-search-filter`.

Slug: lowercase, hyphens, 3–5 words, describing **the change** — not the task title
copied verbatim.

```bash
git checkout -b feature/gyakorlat-search-filter
```

- Branch already exists (locally or on origin) → **STOP**. It may be unfinished work.

### 3. Confirm, and take a baseline

```bash
git rev-parse --abbrev-ref HEAD    # must be the new branch
```

Never commit to `main`. If you find yourself on `main` with changes, **STOP**.

There's no test suite to run as a baseline. Instead: serve the site locally
(`python -m http.server 8000`) and load the page(s) you're about to touch — and, if
you're touching `nav.html`, `script.js`, or `style.css`, one page of each type
(`jegyzetek`, `gyakorlas`, `tetelek`) since those are shared across every page. Note
anything already broken (console errors, visual issues) before you change anything —
pre-existing problems are not yours; report them, don't fix them in this branch.

### 4. Execute the task

Build the change directly — there's no test suite to drive a red/green cycle for a
static content site.

- **Content pages** (new or edited `jegyzetek`/`gyakorlas`/`tetelek` items, or the
  templates): follow the existing template structure and the conventions already
  documented above — root-relative paths, ad-slot placement, `data-nav-key`,
  canonical URL, breadcrumb, sitemap entry.
- **Shared files** (`script.js`, `style.css`, `nav.html`): these run/apply on every
  page unconditionally, so a change here has site-wide blast radius even if the task
  only mentioned one page.
- **Stay inside the task.** Anything you notice but weren't asked to do — dead code, a
  bad name, a missing sitemap entry elsewhere — goes on a follow-up list for the end.
  It does not go in this branch.
- If `script.js` ever grows real logic worth unit-testing, adding a test runner is a
  separate decision to raise explicitly — not something to improvise mid-task.

### 5. Verification gate

```bash
python -m http.server 8000
```

- Load every page you changed, plus one page of each type you didn't touch (to catch
  shared `nav.html`/`script.js`/`style.css` regressions).
- Check the browser console for errors on each page loaded.
- Click every link/button you added or touched.
- Compare against the baseline from step 3 — new issues are yours to fix; pre-existing
  ones get reported, not fixed here.
- If something looks broken and you're not sure it's related to your change, say so and
  **STOP** rather than guessing.

### 6. Commit — atomically

One commit per logically complete change. Related changes only.

```bash
git status          # read it
git add <paths>     # or: git add -p
```

Never `git add -A` without reading `git status` first. Never mix a fix with a
refactor, a feature with a formatting sweep, or code with unrelated changes — if it
can't be described in one subject line without "and", it's two commits.

```
<type>(<scope>): <imperative subject, ≤50 chars, no full stop>

Why the change was needed: what the content/behaviour was, what it is
now. Anything non-obvious about the approach, and what you deliberately
chose not to do. Wrap at 72 characters.
```

- `type`: `feat` `fix` `refactor` `content` `docs` `chore` `style`
- Subject in the imperative — "add gyakorlat search filter", not "added ...".
- The body explains **why**. The diff already shows what.
- Never `wip`, `fixes`, `misc`, `updates`, or an empty body on a non-trivial change.
- No task-ID trailer (none exist in this repo).
- **Attribution note:** Claude Code currently appends `Co-Authored-By` /
  `Claude-Session` trailers to every commit it creates, per the session's own
  attribution policy — this applies regardless of what's written here and isn't
  something this workflow can turn off.

### 7. Push

```bash
git push -u origin HEAD
```

- Never force-push `main`.
- On your own branch, only `--force-with-lease`, never bare `--force`.
- Pushes to `main` are blocked by a GitHub ruleset (no deletion, no force-push, PR
  required). A refused push is the guardrail working — **STOP** and ask. Never use
  `--no-verify`, never disable hooks, never change `core.hooksPath` to get a push
  through.

### 8. Open the PR

**Title** — the commit subject if there's one commit, otherwise one sentence covering
the whole change.

**Body:**

```
## What
One paragraph, plain language.

## Why
The problem this solves.

## How
Decisions a reviewer would otherwise have to reverse-engineer from the diff.

## Testing
What you checked locally (see step 5), and what wasn't covered.

## Risk & rollback
What could break, and how to revert.

## Notes
Follow-ups noticed and deliberately left out of scope.
```

```bash
gh pr create --base main --title "..." --body "..."
```

If `gh` isn't available, say so and give the title and body to paste manually.

**Do not merge the PR.** Opening it is where the task ends — merging is a separate,
explicit decision.

---

### Stop conditions

Stop and ask rather than improvising, at any point:

- dirty working tree, or changes you didn't make
- `main` diverged from origin
- the branch already exists
- scope is ambiguous, or the task needs a decision that hasn't been made
- pre-existing issues found during the step-3 baseline check
- something that looks broken and you're not sure it's related to your change
- merge conflicts
- the task turns out to require touching secrets, DNS/Cloudflare config, GitHub Pages
  settings, or the branch ruleset — things with site-wide or account-wide blast radius
  that weren't mentioned in it
- the change is growing past what the task described
- you're uncertain about anything where guessing wrong would be expensive to undo —
  uncertainty is itself a reason to ask, not a thing to work around

### Report when done

Branch name · commit subjects · verification results (including the baseline from
step 3) · PR link · follow-ups left out, listed explicitly.
