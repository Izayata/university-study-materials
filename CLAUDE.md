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
