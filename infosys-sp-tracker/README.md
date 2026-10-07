# Infosys SP Prep

A 5-week preparation tracker for the **Infosys Specialist Programmer proctored coding round**, built
around what recent candidates actually reported rather than a generic DSA syllabus.

Static site — no build step, no server. Progress syncs through your own Supabase project, so the same
ticks show up on your phone and your laptop.

---

## What's in it

| Section | What it does |
|---|---|
| **Dashboard** | Countdown, per-week progress meters, must-do completion, and the failure-category histogram that decides your final three days |
| **5-week plan** | Per week: objective, topics, exact patterns, the outcome to hit, and an explicit *do not study this* list |
| **Problems** | 64 core + 10 overflow problems, curated for pattern coverage. Filter by week / priority / status, track status + minutes + a note per problem |
| **Weekday theory** | 26 weekday evenings of videos + paper work. No weekday problem solving is ever required |
| **Mocks** | Two 3-hour / 4-problem papers and two 45-minute 1-of-2 sprints, with per-problem results and the post-mortem procedure |
| **Exam strategy** | Constraint→technique table, 26-row pattern trigger sheet, both timebox plans, the ten in-exam decisions, failure modes, complexity traps |
| **Templates** | 20 templates to write from blank memory, tracked at three mastery levels |
| **Final 7 days** | Day-by-day taper plus night-before, exam-morning and one-page-sheet checklists |
| **Error log** | One line per problem you got wrong, bucketed into six failure categories, rendered as a histogram |
| **Research** | The full evidence base: every format claim with its source and date, source-quality tiers, and the two conflicting reported formats shown side by side rather than averaged |

The research section is deliberately separate from the recommendations. Where sources disagree — and on the
shape of this round they genuinely do — the site shows the disagreement instead of picking a winner.

---

## Setup (~5 minutes)

### 1. Create the Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a free project.
2. Open **SQL Editor → New query**, paste the whole of [`supabase/schema.sql`](supabase/schema.sql), and **Run**.
   That creates one `progress` table and the Row Level Security policies that restrict every row to its owner.

### 2. Point the site at it

Open **Project Settings → API** and copy:

| Supabase field | Goes into `config.js` as |
|---|---|
| Project URL | `SUPABASE_URL` |
| `anon` / publishable key | `SUPABASE_ANON_KEY` |

```js
// config.js
export const SUPABASE_URL = 'https://abcdefgh.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
```

Both values are **safe to commit publicly**. The publishable key grants no data access on its own —
RLS is what protects your rows. It is not a password.

### 3. Allow your site URL for sign-in links

**Authentication → URL Configuration** → add your deployed origin to **Redirect URLs**, e.g.
`https://<you>.github.io/infosys-sp-tracker/*`. Without this the emailed magic link bounces.
(The 6-digit code path still works regardless — useful when you read mail on a different device.)

### 4. Deploy

Any static host works. Pick one:

**GitHub Pages** — Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
Pages on a **private** repo needs a paid plan, so either make the repo public or use one of the options below.

**Netlify / Vercel / Cloudflare Pages** — import the repo, leave the build command empty, publish
directory `/`. All three deploy private repos on their free tiers.

**Locally** — `python3 -m http.server 8000`, then open `http://localhost:8000`.
It must be served over HTTP, not opened as a `file://` path: the page uses ES modules.

Then open the site, enter your email, and paste the 6-digit code.

---

## How sync works

State is **one JSONB document per user** in `public.progress`. The state is a single document edited by one
person on two devices, so a document store needs no migrations when the plan changes, and a
whole-document write is the natural unit.

Writes are **optimistic-concurrency**, not last-write-wins:

```
UPDATE progress SET state = ?  WHERE user_id = ?  AND updated_at = <version last read>
```

If the row moved underneath you — your phone saved while the laptop tab was open — zero rows match, the
write is refused, and the site offers three explicit resolutions:

- **Merge both** (default) — union of every tick from both devices; template mastery takes the higher level,
  the error log dedupes by id. Right answer for checkbox-shaped data.
- **Use other device** — discard local unsaved edits.
- **Keep this device** — overwrite the server.

Supporting details:

- The tab re-checks the server on `visibilitychange`, so switching back to a stale tab surfaces the
  conflict instead of silently clobbering.
- `localStorage` holds **only a durable outbox** for a write that failed while offline, replayed on
  `online`. It is never the source of truth — the server row always is. This matters because the whole
  point of the backend is that progress follows you between devices.
- **Account & data** has JSON export/import for backups, and a reset.

---

## Layout

```
index.html                 shell: topbar, nav, auth gate, conflict bar
config.js                  your Supabase URL + publishable key
config.example.js          the same file with placeholders, for reference
supabase/schema.sql        table + RLS policies + updated_at trigger
assets/css/styles.css      mobile-first; sidebar from 960px
assets/js/data.js          the plan: weeks, problems, weekday curriculum, mocks, strategy, templates
assets/js/research.js      the evidence base: reports, sources, tiers, conflicts
assets/js/store.js         Supabase adapter: auth, load, conditional save, conflict resolution, outbox
assets/js/app.js           views + event delegation
```

Editing the plan means editing `data.js` only — the render code reads everything from there.
**Never renumber an existing problem `id`**: ids are the keys your saved progress is stored under.

## Development

```bash
npm i          # playwright-core, for the browser suites only
npm start      # serve at http://localhost:8137
npm test       # store logic: union semantics, optimistic concurrency, outbox replay
npm run test:ui  # renders every view at 390px and 1440px, then drives the signed-in flow
```

`npm test` runs in Node with a fake Supabase client — no project and no network needed.
`npm run test:ui` serves a temp copy with stub credentials and intercepts the SDK import, so the
browser suites exercise the real signed-in path, including the cross-device conflict merge.
Screenshots land in `test/out/`.

What the suites cover:

| Suite | Checks |
|---|---|
| `store.test.mjs` | Union keeps every tick from both devices; template mastery takes the higher level; the error log dedupes; a write wins when the row has not moved; **a write is refused when the other device got there first**; merge saves the union; a failed write is queued and replayed |
| `render.test.mjs` | All 11 views render at 390px and 1440px with no JS errors and **no horizontal overflow** |
| `ui.test.mjs` | Every control writes through to the server row; the histogram updates; the conflict bar appears, merges and clears; export downloads |

## Notes

- **Responsive.** Mobile-first. One breakpoint at 960px swaps the scrolling tab strip for a sidebar;
  tables either scroll horizontally or restack as cards below 620px. Tap targets are ≥36px.
- **Theme.** Auto / light / dark, cycled from the topbar; the choice is part of synced prefs.
- **Colour.** The palette is validated for colour-vision deficiency against both the light and the dark
  surface (`#fcfcfb` / `#1a1a19`), and every meter and histogram bar prints its number next to it, so
  colour never carries a value on its own. Status colours are reserved for problem status only.
- **Print.** Chrome and controls drop out, so any section prints as a clean handout — useful for the
  one-page sheet on 8 Nov.
