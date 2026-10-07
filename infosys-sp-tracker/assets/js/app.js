/* UI layer. Renders views from data.js / research.js and writes every tick
 * through store.update(), which debounces a conditional save to Supabase.
 *
 * Rendering is string-templating into innerHTML plus event delegation on the
 * container: there are ~300 trackable rows and no partial-update complexity is
 * worth paying for at that size. Anything the user typed goes through esc().
 */

import {
  EXAM, WEEKS, PROBLEMS, SIMS, PRI, DIFF, WEEKDAYS, WEEKDAY_RITUAL, CHANNELS,
  MOCKS, MOCK_CONDITIONS, POSTMORTEM, CONSTRAINTS, TRIGGERS, PATTERN_LIST,
  TEMPLATES, STRATEGY_QA, TIMEBOXES, MISTAKES, TRAPS, CHECKLISTS, FINAL7,
  ERROR_CATEGORIES
} from './data.js';

import {
  SOURCE_TIERS, INACCESSIBLE, FORMAT_X, FORMAT_Y, CONFLICT, ROUND1_REPORTS,
  LEVELS, CLEARED_SAID, SIGNATURE, RECURRING, ADVANCED_DS, ADVANCED_REASONING,
  CYCLES, SKIP_LIST, SKIP_BEHAVIOURS, BORDERLINE, LANGUAGE_NOTE, THREE_THINGS,
  SOURCES
} from './research.js';

import { store, STATUS } from './store.js';

/* ------------------------------------------------------------------ utils */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const DAY_MS = 86400000;

function daysLeft() {
  const exam = new Date(`${EXAM.date}T09:00:00`);
  const now = new Date();
  return Math.ceil((exam - now) / DAY_MS);
}

function weekendsLeft() {
  const exam = new Date(`${EXAM.date}T09:00:00`);
  let n = 0;
  for (let d = new Date(); d < exam; d = new Date(+d + DAY_MS)) {
    if (d.getDay() === 6) n++;
  }
  return n;
}

const PSTATUS = [
  { v: '',            label: 'Not started',       icon: '○' },
  { v: 'solved',      label: 'Solved clean',      icon: '●' },
  { v: 'solved_hint', label: 'Solved with help',  icon: '◐' },
  { v: 'failed',      label: 'Failed / gave up',  icon: '×' }
];

const CORE = PROBLEMS.filter(p => p.wk !== 'pool');
const isDone = st => st === 'solved' || st === 'solved_hint';
const pstate = id => store.state.problems[id] || {};

function pct(done, total) { return total ? Math.round((done / total) * 100) : 0; }

/* Wraps a numeric meter so the value is always printed next to the bar —
 * colour never carries the magnitude on its own. */
function meter(name, done, total, extra = '') {
  const p = pct(done, total);
  return `<div class="meter-row">
    <div class="meter-top">
      <span class="name">${name}</span>
      <span class="num">${done}/${total} · ${p}%${extra}</span>
    </div>
    <div class="track" role="img" aria-label="${esc(name)}: ${done} of ${total} done, ${p} percent">
      <i class="fill${p === 100 ? ' done' : ''}" style="width:${p}%"></i>
    </div>
  </div>`;
}

function priChip(pri) {
  const m = PRI[pri];
  return m ? `<span class="chip ${m.cls}">${m.icon} ${m.label}</span>` : '';
}
function diffChip(d) { return `<span class="chip d-${d}" title="${DIFF[d]}">${DIFF[d]}</span>`; }

/* --------------------------------------------------------------- dashboard */

function viewDashboard() {
  const dl = daysLeft();
  const coreDone = CORE.filter(p => isDone(pstate(p.id).status)).length;
  const must = CORE.filter(p => p.pri === 'must');
  const mustDone = must.filter(p => isDone(pstate(p.id).status)).length;
  const wdDone = WEEKDAYS.filter(d => store.state.weekdays[d.id]).length;
  const tplMastered = TEMPLATES.filter(t => (store.state.templates[t.id] || 0) === 2).length;

  const errs = store.state.errors || [];
  const counts = ERROR_CATEGORIES.map(c => ({ ...c, n: errs.filter(e => e.cat === c.id).length }));
  const maxN = Math.max(1, ...counts.map(c => c.n));
  const worst = [...counts].sort((a, b) => b.n - a.n)[0];

  const nextUp = CORE.filter(p => !pstate(p.id).status && p.pri === 'must').slice(0, 6);

  return `
  <div class="view-head">
    <h1>Dashboard</h1>
    <p>One objective: maximise the probability of clearing the ${esc(EXAM.label)} on
    ${fmtDate(EXAM.date)} — with weekend coding only and weekday theory only.</p>
  </div>

  <div class="tiles">
    <div class="tile${dl <= 7 ? ' urgent' : ''}">
      <div class="label">Days to exam</div>
      <div class="value">${dl > 0 ? dl : (dl === 0 ? 'Today' : 'Past')}</div>
      <div class="sub">${fmtDate(EXAM.date)}</div>
    </div>
    <div class="tile">
      <div class="label">Weekends left</div>
      <div class="value">${weekendsLeft()}</div>
      <div class="sub">All real coding happens here</div>
    </div>
    <div class="tile">
      <div class="label">🔥 Must-do done</div>
      <div class="value">${mustDone}<span class="muted" style="font-size:.5em">/${must.length}</span></div>
      <div class="sub">${pct(mustDone, must.length)}% of the non-negotiable set</div>
    </div>
    <div class="tile">
      <div class="label">Templates from blank</div>
      <div class="value">${tplMastered}<span class="muted" style="font-size:.5em">/${TEMPLATES.length}</span></div>
      <div class="sub">Target: all 20 by 6 Nov</div>
    </div>
  </div>

  <div class="grid cols-2">
    <section class="card">
      <div class="card-head"><h2>Progress by week</h2><span class="muted small">${coreDone}/${CORE.length} core problems</span></div>
      ${WEEKS.map(w => {
        const ps = CORE.filter(p => p.wk === w.id);
        if (!ps.length) return '';
        const d = ps.filter(p => isDone(pstate(p.id).status)).length;
        return meter(`Week ${w.n} — ${w.title}`, d, ps.length);
      }).join('')}
      ${meter('Weekday theory sessions', wdDone, WEEKDAYS.length)}
      ${meter('Coding templates mastered', tplMastered, TEMPLATES.length)}
    </section>

    <section class="card">
      <div class="card-head"><h2>Failure categories</h2><span class="muted small">${errs.length} logged</span></div>
      ${errs.length === 0
        ? `<p class="muted">Nothing logged yet. After every weekend session and every mock,
           add one line per problem you got wrong. <strong>This histogram is what tells you
           what the final three days should fix — do not guess, count.</strong></p>`
        : `<div class="hist">${counts.map(c => `
            <div class="hist-row">
              <div class="hist-top"><span>${esc(c.label)}</span><span class="cnt">${c.n}</span></div>
              <div class="hist-bar" role="img" aria-label="${esc(c.label)}: ${c.n}">
                <i style="width:${(c.n / maxN) * 100}%"></i>
              </div>
              <div class="hist-fix">${esc(c.fix)}</div>
            </div>`).join('')}</div>
          ${worst && worst.n > 0 ? `<p class="small" style="margin-top:.8rem">
            <strong>Your biggest leak: ${esc(worst.label)}.</strong> ${esc(worst.fix)}.</p>` : ''}`}
    </section>
  </div>

  <section class="card">
    <div class="card-head"><h2>Next up</h2><span class="muted small">Unstarted 🔥 must-do, in plan order</span></div>
    ${nextUp.length === 0
      ? `<p class="muted">Every must-do problem has been started. Move to the <a href="#mocks">mocks</a>.</p>`
      : `<ul class="bare">${nextUp.map(p => `<li class="listrow">
          <div class="listrow-top">
            <span class="name"><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a>
              <span class="muted small">${esc(p.src)}</span></span>
            <span class="num">W${WEEKS.find(w => w.id === p.wk)?.n ?? '—'} · ${esc(p.day)}</span>
          </div>
          <div class="hist-fix">${esc(p.pat)}</div>
        </li>`).join('')}</ul>
      <p class="btn-row" style="margin-top:.8rem"><a class="btn primary" href="#problems">Open the problem list</a></p>`}
  </section>

  <div class="callout">
    <h3>The three things that actually matter</h3>
    <ol class="tight">${THREE_THINGS.map(t => `<li>${t}</li>`).join('')}</ol>
  </div>

  <div class="callout warn">
    <h3>Language choice — decide once, in Week 1</h3>
    <p>${LANGUAGE_NOTE}</p>
  </div>`;
}

function fmtDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/* -------------------------------------------------------------------- plan */

function viewPlan() {
  return `
  <div class="view-head">
    <h1>The 5-week plan</h1>
    <p><strong>Mon–Fri:</strong> videos, theory, pattern learning, dry-running on paper. No mandatory problem solving.
    <strong>Sat–Sun:</strong> all real coding, timed, plus a 45-minute single-problem simulation each Sunday evening.</p>
  </div>

  ${WEEKS.map(w => {
    const ps = CORE.filter(p => p.wk === w.id);
    const done = ps.filter(p => isDone(pstate(p.id).status)).length;
    const sim = SIMS.find(s => s.wk === w.id);
    return `<section class="card">
      <div class="card-head">
        <h2>Week ${w.n} — ${esc(w.title)}</h2>
        <span class="muted small">${esc(w.range)}</span>
      </div>
      <p><strong>Objective.</strong> ${esc(w.objective)}</p>
      ${ps.length ? meter('Problems this week', done, ps.length) : ''}

      <h3 style="margin-top:1rem">Topics</h3>
      <div class="chips">${w.topics.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>

      <h3 style="margin-top:1rem">Exact patterns to master</h3>
      <ul class="tight">${w.patterns.map(p => `<li>${p}</li>`).join('')}</ul>

      <div class="callout" style="margin-top:1rem">
        <h3>By the end of this week you should be able to</h3>
        <p>${esc(w.outcome)}</p>
      </div>

      ${sim ? `<div class="callout warn">
        <h3>45-minute simulation — ${esc(sim.when)}</h3>
        <p>${esc(sim.brief)}</p>
        <label class="check${store.state.sims[sim.id] ? ' done' : ''}">
          <input type="checkbox" data-kind="sim" data-id="${sim.id}" ${store.state.sims[sim.id] ? 'checked' : ''}>
          <span>Done — <em>${esc(sim.target)}</em></span>
        </label>
      </div>` : ''}

      <div class="callout stop">
        <h3>Do NOT waste time on this week</h3>
        <div class="chips">${w.avoid.map(a => `<span class="chip skip">${esc(a)}</span>`).join('')}</div>
      </div>
    </section>`;
  }).join('')}`;
}

/* ---------------------------------------------------------------- problems */

let pFilter = { wk: 'all', pri: 'all', status: 'all', q: '' };

function viewProblems() {
  const total = PROBLEMS.length;
  const done = PROBLEMS.filter(p => isDone(pstate(p.id).status)).length;

  const rows = PROBLEMS.filter(p => {
    if (pFilter.wk !== 'all' && p.wk !== pFilter.wk) return false;
    if (pFilter.pri !== 'all' && p.pri !== pFilter.pri) return false;
    const st = pstate(p.id).status || '';
    if (pFilter.status === 'todo' && st) return false;
    if (pFilter.status === 'done' && !isDone(st)) return false;
    if (pFilter.status === 'failed' && st !== 'failed') return false;
    if (pFilter.q) {
      const hay = `${p.title} ${p.src} ${p.pat} ${p.note || ''}`.toLowerCase();
      if (!hay.includes(pFilter.q.toLowerCase())) return false;
    }
    return true;
  });

  const byDay = new Map();
  for (const p of rows) {
    const w = WEEKS.find(x => x.id === p.wk);
    const key = p.wk === 'pool'
      ? '🟡 Overflow pool — only if a weekend finishes early'
      : `Week ${w.n} · ${p.day === 'sat' ? `Saturday ${w.sat}` : `Sunday ${w.sun}`}`;
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key).push(p);
  }

  return `
  <div class="view-head">
    <h1>Problems</h1>
    <p><strong>${CORE.length} core + ${PROBLEMS.length - CORE.length} overflow.</strong> Curated for pattern coverage,
    not count. Write the recurrence or approach <em>on paper first</em> — the onsite round checks your rough sheets.
    If you have not found the approach in 25 minutes, read the editorial, then <strong>close it and re-implement from blank</strong>.</p>
  </div>

  ${meter('All problems solved', done, total)}

  <div class="toolbar" style="margin-top:1rem">
    <select data-filter="wk" aria-label="Filter by week">
      <option value="all"${sel(pFilter.wk, 'all')}>All weeks</option>
      ${WEEKS.filter(w => CORE.some(p => p.wk === w.id)).map(w =>
        `<option value="${w.id}"${sel(pFilter.wk, w.id)}>Week ${w.n}</option>`).join('')}
      <option value="pool"${sel(pFilter.wk, 'pool')}>Overflow pool</option>
    </select>
    <select data-filter="pri" aria-label="Filter by priority">
      <option value="all"${sel(pFilter.pri, 'all')}>All priorities</option>
      <option value="must"${sel(pFilter.pri, 'must')}>🔥 Must do</option>
      <option value="should"${sel(pFilter.pri, 'should')}>🟠 Should do</option>
      <option value="iftime"${sel(pFilter.pri, 'iftime')}>🟡 If time</option>
    </select>
    <select data-filter="status" aria-label="Filter by status">
      <option value="all"${sel(pFilter.status, 'all')}>Any status</option>
      <option value="todo"${sel(pFilter.status, 'todo')}>Not started</option>
      <option value="done"${sel(pFilter.status, 'done')}>Solved</option>
      <option value="failed"${sel(pFilter.status, 'failed')}>Failed</option>
    </select>
    <input type="search" data-filter="q" placeholder="Search title or pattern…" value="${esc(pFilter.q)}" aria-label="Search problems">
  </div>

  ${rows.length === 0 ? `<p class="muted">Nothing matches that filter.</p>` : ''}

  ${[...byDay.entries()].map(([head, list]) => {
    const d = list.filter(p => isDone(pstate(p.id).status)).length;
    const diffs = ['E', 'M', 'H'].map(k => `${list.filter(p => p.diff === k).length}${k}`).join(' · ');
    return `<div class="group-head">${esc(head)} — ${list.length} problems (${diffs}) · ${d} done</div>
      <div class="plist">${list.map(problemRow).join('')}</div>`;
  }).join('')}`;
}

function sel(cur, v) { return cur === v ? ' selected' : ''; }

function problemRow(p) {
  const st = pstate(p.id);
  const status = st.status || '';
  return `<article class="prow${p.star ? ' starred' : ''}" data-status="${status}">
    <div class="prow-top">
      <span class="prow-n">${p.n}</span>
      <div class="prow-title">
        <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a><span class="src">${esc(p.src)}</span>
        <div class="prow-pat">${esc(p.pat)}</div>
      </div>
      <div class="chips">${diffChip(p.diff)}${priChip(p.pri)}</div>
    </div>
    ${p.note ? `<p class="prow-note">${p.star ? '<span class="star">★ </span>' : ''}${esc(p.note)}</p>` : ''}
    <div class="prow-ctl">
      <select data-kind="pstatus" data-id="${p.id}" aria-label="Status for ${esc(p.title)}">
        ${PSTATUS.map(s => `<option value="${s.v}"${sel(status, s.v)}>${s.icon} ${s.label}</option>`).join('')}
      </select>
      <input class="mins" type="number" min="0" max="600" step="5" placeholder="mins"
             value="${st.mins ?? ''}" data-kind="pmins" data-id="${p.id}" aria-label="Minutes taken">
      <input class="pnote" type="text" placeholder="What went wrong / the key insight…"
             value="${esc(st.note ?? '')}" data-kind="pnote" data-id="${p.id}" aria-label="Note">
    </div>
  </article>`;
}

/* ---------------------------------------------------------------- weekdays */

function viewWeekdays() {
  const done = WEEKDAYS.filter(d => store.state.weekdays[d.id]).length;
  const byWeek = WEEKS.map(w => ({ w, days: WEEKDAYS.filter(d => d.wk === w.id) })).filter(x => x.days.length);

  return `
  <div class="view-head">
    <h1>Weekday theory curriculum</h1>
    <p>Videos and paper only. <strong>No mandatory problem solving on a weekday.</strong>
    Rule: if you did not write anything on paper, the evening did not happen — watching is not studying,
    and Infosys interviewers literally inspect rough sheets in the onsite round, so paper fluency is a scored skill here.</p>
  </div>

  ${meter('Weekday sessions completed', done, WEEKDAYS.length)}

  <section class="card" style="margin-top:1rem">
    <h2>The format for every weekday evening (~75–90 min)</h2>
    <div class="kv">${WEEKDAY_RITUAL.map(r =>
      `<div><span class="kvk">${esc(r.mins)}</span><span class="kvv">${r.what}</span></div>`).join('')}</div>
  </section>

  ${byWeek.map(({ w, days }) => {
    const d = days.filter(x => store.state.weekdays[x.id]).length;
    return `<section class="card">
      <div class="card-head"><h2>Week ${w.n} — ${esc(w.title)}</h2><span class="muted small">${d}/${days.length}</span></div>
      <div class="checks">${days.map(day => `
        <label class="check${store.state.weekdays[day.id] ? ' done' : ''}">
          <input type="checkbox" data-kind="weekday" data-id="${day.id}" ${store.state.weekdays[day.id] ? 'checked' : ''}>
          <span>
            <strong>${esc(day.date)}${day.key ? ' <span class="star">★ key</span>' : ''}${day.taper ? ' <span class="chip">taper</span>' : ''}</strong>
            — ${esc(day.watch)}
            <span class="meta"><strong>Paper output:</strong> ${esc(day.paper)}</span>
          </span>
        </label>`).join('')}</div>
    </section>`;
  }).join('')}

  <section class="card">
    <h2>Channels, ranked for your situation</h2>
    <div class="kv">${CHANNELS.map(c =>
      `<div><span class="kvk">${c.rank ? `${c.rank}. ` : ''}${esc(c.name)}</span><span class="kvv">${c.why}</span></div>`).join('')}</div>
  </section>`;
}

/* ------------------------------------------------------------------- mocks */

const MRESULT = [
  { v: '',        label: '—' },
  { v: 'solved',  label: 'Solved, all tests' },
  { v: 'partial', label: 'Partial tests' },
  { v: 'brute',   label: 'Brute force submitted' },
  { v: 'failed',  label: 'Nothing submitted' }
];

function viewMocks() {
  return `
  <div class="view-head">
    <h1>Week 5 — mock schedule</h1>
    <p>Two formats are credibly reported, so you run both: a <strong>3-hour / 4-problem</strong> paper for Format Y,
    and a <strong>45-minute / 1-of-2</strong> sprint for Format X. The mock sets mirror the reported Infosys shape —
    an easy prefix/XOR problem, a binary-search-on-answer medium, a hard DP, and a small-n “complex” problem,
    because the Dec 2025 report's Q4 had <strong>n ≤ 20</strong>.</p>
  </div>

  <div class="callout stop">
    <h3>Conditions — non-negotiable</h3>
    <ul class="tight">${MOCK_CONDITIONS.map(c => `<li>${c}</li>`).join('')}</ul>
  </div>

  ${MOCKS.map(m => {
    const rec = store.state.mocks[m.id] || { results: {} };
    const res = rec.results || {};
    const solved = m.problems.filter(p => res[p.id] === 'solved').length;
    return `<section class="card">
      <div class="card-head">
        <h2>${esc(m.title)}</h2>
        <span class="muted small">${esc(m.when)}</span>
      </div>
      ${m.kind === 'sprint'
        ? `<p class="muted">Read both, pick one on <em>confidence</em> — not apparent difficulty — and finish it completely.</p>`
        : `<p class="muted">Scan all four first (12 min, no typing). Then easiest → second → hardest → anything on the fourth. Reserve the last 20 minutes.</p>`}

      <div class="toolbar">
        <label class="small muted">Date attempted
          <input type="date" data-kind="mockdate" data-id="${m.id}" value="${esc(rec.date || '')}" style="font:inherit;padding:.35rem .5rem;border:1px solid var(--grid);border-radius:6px;background:var(--raised);color:var(--ink)">
        </label>
        <span class="chip">${solved}/${m.problems.length} fully solved</span>
      </div>

      <div class="plist">${m.problems.map(p => `
        <article class="prow" data-status="${res[p.id] === 'solved' ? 'solved' : (res[p.id] === 'failed' ? 'failed' : (res[p.id] ? 'solved_hint' : ''))}">
          <div class="prow-top">
            <div class="prow-title">
              <a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.title)}</a><span class="src">${esc(p.src)}</span>
              <div class="prow-pat">${esc(p.pat)}</div>
            </div>
            <div class="chips">${diffChip(p.diff)}</div>
          </div>
          <div class="prow-ctl">
            <select data-kind="mockres" data-mock="${m.id}" data-id="${p.id}" aria-label="Result for ${esc(p.title)}">
              ${MRESULT.map(r => `<option value="${r.v}"${sel(res[p.id] || '', r.v)}>${r.label}</option>`).join('')}
            </select>
          </div>
        </article>`).join('')}</div>

      <div class="prow-ctl" style="margin-top:.8rem">
        <input class="pnote" type="text" placeholder="Post-mortem summary — biggest leak in this mock…"
               value="${esc(rec.note || '')}" data-kind="mocknote" data-id="${m.id}" aria-label="Mock notes">
      </div>
    </section>`;
  }).join('')}

  <section class="card">
    <h2>Post-mortem procedure</h2>
    <p class="muted">2.5 hours, and it matters more than the mock. Do this for <strong>every</strong> problem — including the ones you solved.</p>
    <ol class="tight">${POSTMORTEM.map(s => `<li>${s}</li>`).join('')}</ol>
    <p class="small"><strong>Then log each failure on the <a href="#errors">Error log</a> tab.</strong>
    The category histogram is what decides your final three days.</p>
  </section>`;
}

/* ---------------------------------------------------------------- strategy */

function viewStrategy() {
  return `
  <div class="view-head">
    <h1>Exam strategy</h1>
    <p>The single most important skill: <strong>read the constraints first</strong>. The Dec 2025 candidate recorded the
    exact bounds — Q1 n ≤ 1e5, Q2 n ≤ 1e5, Q3 n ≤ 1000, Q4 n ≤ 20. The constraint <em>is</em> the answer key for which technique.</p>
  </div>

  <section class="card">
    <h2>Constraint → technique</h2>
    <p class="muted small">Write the implied complexity on your rough sheet <em>before</em> you think about the algorithm.
    This one habit converts “I have no idea” into “it must be bitmask DP” on roughly a third of hard Infosys problems.</p>
    <div class="tw"><table class="stack-sm">
      <thead><tr><th>Constraint</th><th>Budget</th><th>What it means</th></tr></thead>
      <tbody>${CONSTRAINTS.map(c =>
        `<tr><td class="k"><code>${esc(c.bound)}</code></td><td class="muted small">${esc(c.budget)}</td><td>${c.means}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="card">
    <h2>Pattern-recognition cheat sheet</h2>
    <p class="muted small">Built for this exam. ★ marks the Infosys-specific triggers that generic roadmaps miss.</p>
    <div class="tw"><table class="stack-sm">
      <thead><tr><th>If the statement says…</th><th>Think</th></tr></thead>
      <tbody>${TRIGGERS.map(t =>
        `<tr><td class="k">${t.star ? '<span class="star">★</span> ' : ''}${esc(t.says)}</td><td>${esc(t.think)}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  <section class="card">
    <h2>The ${PATTERN_LIST.reduce((n, g) => n + g.items.length, 0)} patterns to recognise instantly</h2>
    ${PATTERN_LIST.map(g => `<h3 style="margin-top:.9rem">${esc(g.g)}</h3>
      <ol class="tight">${g.items.map(i => `<li>${esc(i)}</li>`).join('')}</ol>`).join('')}
  </section>

  ${TIMEBOXES.map(tb => `<section class="card">
    <h2>${esc(tb.fmt)}</h2>
    <div class="tw"><table class="stack-sm">
      <thead><tr><th>Window</th><th>Action</th></tr></thead>
      <tbody>${tb.rows.map(r => `<tr><td class="k"><code>${esc(r[0])}</code></td><td>${r[1]}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>`).join('')}

  <section class="card">
    <h2>When I see 3 or 4 problems</h2>
    <div class="kv">${STRATEGY_QA.map((qa, i) =>
      `<div><span class="kvk">${i + 1}. ${esc(qa.q)}</span><span class="kvv">${qa.a}</span></div>`).join('')}</div>
  </section>

  <div class="grid cols-2">
    <section class="card">
      <h2>Mistakes that make correct solutions fail</h2>
      <div class="kv">${MISTAKES.map(m =>
        `<div><span class="kvk">${m.t}</span><span class="kvv">${m.d}</span></div>`).join('')}</div>
    </section>
    <section class="card">
      <h2>Time-complexity traps</h2>
      <div class="kv">${TRAPS.map(t =>
        `<div><span class="kvk">${t.t}</span><span class="kvv">${t.d}</span></div>`).join('')}</div>
    </section>
  </div>`;
}

/* --------------------------------------------------------------- templates */

const TLEVEL = [
  { v: 0, label: 'Not tried' },
  { v: 1, label: 'Shaky — needed a peek' },
  { v: 2, label: 'From blank memory ✓' }
];

function viewTemplates() {
  const lv = id => Number(store.state.templates[id] || 0);
  const mastered = TEMPLATES.filter(t => lv(t.id) === 2).length;
  const shaky = TEMPLATES.filter(t => lv(t.id) === 1).length;

  return `
  <div class="view-head">
    <h1>Coding templates</h1>
    <p>Write each one from blank, twice, during 9–11 Nov. A template you can only recognise is worth nothing
    under a 40-minute clock — and “implementation bug” is the failure category that template drilling fixes.</p>
  </div>

  ${meter('Mastered from blank memory', mastered, TEMPLATES.length, shaky ? ` · ${shaky} shaky` : '')}

  <section class="card" style="margin-top:1rem">
    <div class="plist">${TEMPLATES.map(t => {
      const l = lv(t.id);
      return `<article class="prow" data-status="${l === 2 ? 'solved' : (l === 1 ? 'solved_hint' : '')}">
        <div class="prow-top">
          <span class="prow-n">${t.id.replace('t', '')}</span>
          <div class="prow-title">
            <strong>${esc(t.name)}</strong>
            <div class="prow-pat">${esc(t.detail)}</div>
          </div>
        </div>
        <div class="prow-ctl">
          <select data-kind="tpl" data-id="${t.id}" aria-label="Mastery of ${esc(t.name)}">
            ${TLEVEL.map(x => `<option value="${x.v}"${l === x.v ? ' selected' : ''}>${x.label}</option>`).join('')}
          </select>
        </div>
      </article>`;
    }).join('')}</div>
  </section>`;
}

/* -------------------------------------------------------------- checklists */

function viewChecklists() {
  return `
  <div class="view-head">
    <h1>Final 7 days &amp; checklists</h1>
    <p><strong>Nothing new enters your head from 5 Nov.</strong> Adding a topic now trades a reliable 60% for a
    fragile 70% — a bad trade.</p>
  </div>

  <section class="card">
    <h2>Day by day: Thu 5 Nov → Wed 11 Nov</h2>
    <div class="tw"><table class="stack-sm">
      <thead><tr><th>Day</th><th>Plan</th></tr></thead>
      <tbody>${FINAL7.map(d =>
        `<tr><td class="k">${esc(d.date)}<br><span class="chip">${d.kind}</span></td><td>${d.plan}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>

  ${CHECKLISTS.map(cl => {
    const done = cl.items.filter((_, i) => store.state.checklists[`${cl.id}.${i}`]).length;
    return `<section class="card">
      <div class="card-head"><h2>${esc(cl.title)}</h2><span class="muted small">${done}/${cl.items.length}</span></div>
      <div class="checks">${cl.items.map((it, i) => {
        const key = `${cl.id}.${i}`;
        const on = Boolean(store.state.checklists[key]);
        return `<label class="check${on ? ' done' : ''}">
          <input type="checkbox" data-kind="check" data-id="${key}" ${on ? 'checked' : ''}>
          <span>${it}</span>
        </label>`;
      }).join('')}</div>
    </section>`;
  }).join('')}`;
}

/* --------------------------------------------------------------- error log */

function viewErrors() {
  const errs = [...(store.state.errors || [])].sort((a, b) => b.ts - a.ts);
  const counts = ERROR_CATEGORIES.map(c => ({ ...c, n: errs.filter(e => e.cat === c.id).length }));
  const maxN = Math.max(1, ...counts.map(c => c.n));

  return `
  <div class="view-head">
    <h1>Error log</h1>
    <p>One line per problem you got wrong, every weekend and every mock. The histogram is the point:
    <strong>if “implementation bug” dominates, drill templates; if “pattern not recognised” dominates, drill the cheat sheet.
    Do not guess — count.</strong></p>
  </div>

  <section class="card">
    <h2>Add an entry</h2>
    <form id="errForm" class="toolbar" style="margin:0">
      <input type="text" name="label" placeholder="Problem or topic" required style="flex:1 1 11rem;font:inherit;font-size:.88rem;padding:.45rem .6rem;border:1px solid var(--grid);border-radius:6px;background:var(--raised);color:var(--ink)">
      <select name="cat" required aria-label="Failure category">
        ${ERROR_CATEGORIES.map(c => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}
      </select>
      <input type="text" name="note" placeholder="The specific bug or missed insight…" style="flex:2 1 14rem;font:inherit;font-size:.88rem;padding:.45rem .6rem;border:1px solid var(--grid);border-radius:6px;background:var(--raised);color:var(--ink)">
      <button class="btn primary" type="submit">Log it</button>
    </form>
  </section>

  <div class="grid cols-2">
    <section class="card">
      <div class="card-head"><h2>Failure categories</h2><span class="muted small">${errs.length} total</span></div>
      <div class="hist">${counts.map(c => `
        <div class="hist-row">
          <div class="hist-top"><span>${esc(c.label)}</span><span class="cnt">${c.n}</span></div>
          <div class="hist-bar" role="img" aria-label="${esc(c.label)}: ${c.n}"><i style="width:${(c.n / maxN) * 100}%"></i></div>
          <div class="hist-fix">${esc(c.fix)}</div>
        </div>`).join('')}</div>
    </section>

    <section class="card">
      <div class="card-head"><h2>Entries</h2></div>
      ${errs.length === 0 ? `<p class="muted">Empty. That is fine on day one and a problem by Week 3.</p>` : `
      <div class="checks">${errs.map(e => {
        const cat = ERROR_CATEGORIES.find(c => c.id === e.cat);
        return `<div class="check" style="grid-template-columns:1fr auto;cursor:default">
          <span>
            <strong>${esc(e.label)}</strong> <span class="chip">${esc(cat?.label || e.cat)}</span>
            ${e.note ? `<span class="meta">${esc(e.note)}</span>` : ''}
            <span class="meta">${new Date(e.ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
          </span>
          <button class="btn ghost small" data-kind="errdel" data-id="${esc(e.id)}" aria-label="Delete entry">✕</button>
        </div>`;
      }).join('')}</div>`}
    </section>
  </div>`;
}

/* ---------------------------------------------------------------- research */

function reportList(reports) {
  return reports.map(r => `<div class="card flat" style="margin-bottom:.7rem;background:var(--raised)">
    <div class="card-head" style="margin-bottom:.4rem">
      <h3 style="margin:0">${esc(r.src)}</h3>
      <span class="muted small nowrap">${esc(r.date)}</span>
    </div>
    <p style="margin-bottom:.4rem">${r.body}</p>
    <div class="chips">
      ${r.weight ? `<span class="chip shape">${esc(r.weight)}</span>` : ''}
      ${r.weak ? `<span class="chip pri-iftime">weaker evidence — search snippet only</span>` : ''}
      ${r.tier ? `<span class="tier tier-${r.tier.toLowerCase()}">Tier ${esc(r.tier)}</span>` : ''}
      ${r.url ? `<a class="chip" href="${esc(r.url)}" target="_blank" rel="noopener">source ↗</a>` : ''}
    </div>
  </div>`).join('');
}

function viewResearch() {
  return `
  <div class="view-head">
    <h1>Research &amp; evidence</h1>
    <p>Kept separate from the recommendations so the evidence is auditable on its own terms.
    Every format claim carries its source and date, and where sources conflict the conflict is shown
    rather than averaged away.</p>
  </div>

  <section class="card">
    <h2>Source quality tiers</h2>
    <div class="tw"><table class="stack-sm">
      <thead><tr><th>Tier</th><th>What</th><th>Trust</th></tr></thead>
      <tbody>${SOURCE_TIERS.map(t =>
        `<tr><td class="k"><span class="tier ${t.cls}">Tier ${t.tier}</span><br>${esc(t.name)}</td>
             <td class="small">${esc(t.what)}</td><td class="small">${t.trust}</td></tr>`).join('')}</tbody>
    </table></div>
    <div class="callout warn" style="margin-top:1rem">
      <h3>What could not be reached</h3><p class="small">${esc(INACCESSIBLE)}</p>
    </div>
  </section>

  <div class="callout stop">
    <h3>${esc(CONFLICT.title)}</h3>
    <ul class="tight">${CONFLICT.body.map(b => `<li>${b}</li>`).join('')}</ul>
  </div>

  <section class="card">
    <div class="card-head"><h2>${esc(FORMAT_X.name)}</h2><span class="chip shape">${esc(FORMAT_X.shape)}</span></div>
    ${reportList(FORMAT_X.reports)}
  </section>

  <section class="card">
    <div class="card-head"><h2>${esc(FORMAT_Y.name)}</h2><span class="chip shape">${esc(FORMAT_Y.shape)}</span></div>
    ${reportList(FORMAT_Y.reports)}
  </section>

  <section class="card">
    <h2>The Infosys signature — what is genuinely recurring</h2>
    <p class="muted small">Ranked by evidence weight (independent first-person reports), not syllabus prominence.</p>
    ${SIGNATURE.map(s => `<div class="card flat" style="background:var(--raised);margin-bottom:.7rem">
      <div class="card-head" style="margin-bottom:.4rem">
        <h3 style="margin:0">#${s.rank} — ${esc(s.name)}</h3>${priChip(s.pri)}
      </div>
      <ul class="tight small">${s.evidence.map(e => `<li>${e}</li>`).join('')}</ul>
      ${s.verdict ? `<p class="small" style="margin:0">${s.verdict}</p>` : ''}
    </div>`).join('')}
  </section>

  <section class="card">
    <h2>Recurring types by area</h2>
    ${RECURRING.map(g => `
      <h3 style="margin-top:1rem">${esc(g.g)}</h3>
      ${g.note ? `<p class="small callout warn">${g.note}</p>` : ''}
      <ol class="tight small">${g.items.map(([name, pri]) =>
        `<li>${name} ${pri === 'skip' ? '<span class="chip skip">❌ SKIP</span>' : priChip(pri)}</li>`).join('')}</ol>`).join('')}
  </section>

  <section class="card">
    <h2>Advanced data structures — the verdict</h2>
    <div class="tw"><table class="stack-sm">
      <thead><tr><th>Structure</th><th>Evidence</th><th>Verdict</th></tr></thead>
      <tbody>${ADVANCED_DS.map(a =>
        `<tr><td class="k">${esc(a.ds)}</td><td class="small">${a.evidence}</td>
             <td class="small">${a.pri === 'skip' ? '<span class="chip skip">❌</span> ' : priChip(a.pri) + ' '}${a.verdict}</td></tr>`).join('')}</tbody>
    </table></div>
    <p class="small muted" style="margin-top:.8rem"><strong>Reasoning.</strong> ${esc(ADVANCED_REASONING)}</p>
  </section>

  <section class="card">
    <h2>Levels &amp; compensation</h2>
    <div class="chips" style="margin-bottom:.7rem">${LEVELS.official.map(l =>
      `<span class="chip">${esc(l.role)} — ${esc(l.pay)}</span>`).join('')}</div>
    <p class="small muted">${LEVELS.officialNote}</p>
    <h3 style="margin-top:1rem">Threshold claims — all anecdotal</h3>
    <div class="tw"><table class="stack-sm">
      <thead><tr><th>Claim</th><th>Source</th><th>Label</th></tr></thead>
      <tbody>${LEVELS.claims.map(c =>
        `<tr><td>${esc(c.claim)}</td><td class="small muted">${esc(c.src)}</td>
             <td class="small"><span class="tier ${c.cls}">${esc(c.label)}</span></td></tr>`).join('')}</tbody>
    </table></div>
    <div class="callout" style="margin-top:1rem"><p class="small">${LEVELS.synthesis}</p></div>
  </section>

  <section class="card">
    <h2>Round-1 reports (the question pool is shared)</h2>
    <div class="kv">${ROUND1_REPORTS.map(r =>
      `<div><span class="kvk">${esc(r.date)} · ${esc(r.src)}</span><span class="kvv">${r.body}</span></div>`).join('')}</div>
  </section>

  <section class="card">
    <h2>Differences between cycles, shifts and years</h2>
    <div class="kv">${CYCLES.map(c =>
      `<div><span class="kvk">${esc(c.yr)}</span><span class="kvv">${c.what}</span></div>`).join('')}</div>
  </section>

  <section class="card">
    <h2>What candidates who cleared it said they prepared</h2>
    <div class="kv">${CLEARED_SAID.map(c =>
      `<div><span class="kvk">${esc(c.who)}</span><span class="kvv">${c.what}</span></div>`).join('')}</div>
  </section>

  <section class="card">
    <h2>What NOT to study</h2>
    <p class="muted small">Zero or negative ROI in 5 weekends.</p>
    ${SKIP_LIST.map(g => `<h3 style="margin-top:.9rem">${esc(g.g)}</h3>
      <div class="chips">${g.items.map(i => `<span class="chip skip">${esc(i)}</span>`).join('')}</div>
      ${g.note ? `<p class="small muted" style="margin-top:.4rem">${esc(g.note)}</p>` : ''}`).join('')}
    <h3 style="margin-top:1.2rem">Also skip these behaviours</h3>
    <div class="kv">${SKIP_BEHAVIOURS.map(b =>
      `<div><span class="kvk">${esc(b.t)}</span><span class="kvv">${b.d}</span></div>`).join('')}</div>
    <div class="callout" style="margin-top:1rem">
      <h3>🟡 Borderline — only if a weekend ends early</h3><p class="small">${esc(BORDERLINE)}</p>
    </div>
  </section>

  <section class="card">
    <h2>Sources</h2>
    <div class="kv">${SOURCES.map(s =>
      `<div><span class="kvk"><span class="tier tier-${s.tier.toLowerCase()}">${s.tier}</span>
        <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>
        <span class="muted small">· ${esc(s.date)}</span></span>
        <span class="kvv small">${esc(s.note)}</span></div>`).join('')}</div>
  </section>`;
}

/* ----------------------------------------------------------------- account */

function viewAccount() {
  const synced = store.lastSyncedAt
    ? new Date(store.lastSyncedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '—';
  return `
  <div class="view-head">
    <h1>Account &amp; data</h1>
    <p>Progress is stored as a single row in your own Supabase project, protected by Row Level Security,
    so the same ticks appear on your phone and your laptop.</p>
  </div>

  <section class="card">
    <h2>Sync</h2>
    <div class="kv">
      <div><span class="kvk">Signed in as</span><span class="kvv">${esc(store.user?.email || '—')}</span></div>
      <div><span class="kvk">Status</span><span class="kvv">${esc(store.status)}${store.message ? ` — ${esc(store.message)}` : ''}</span></div>
      <div><span class="kvk">Last synced</span><span class="kvv">${esc(synced)}</span></div>
      <div><span class="kvk">Conflict handling</span><span class="kvv">Every write is conditional on the row version last read. If the other device got there first the write is refused and you are asked, rather than losing a weekend of ticks.</span></div>
    </div>
    <div class="btn-row" style="margin-top:1rem">
      <button class="btn" id="btnSync" type="button">Check other device now</button>
      <button class="btn" id="btnExport" type="button">Export JSON backup</button>
      <button class="btn" id="btnImport" type="button">Import JSON</button>
      <button class="btn ghost" id="btnSignOut" type="button">Sign out</button>
    </div>
    <input type="file" id="fileImport" accept="application/json,.json" hidden>
  </section>

  <section class="card">
    <h2>Reset</h2>
    <p class="muted small">Clears every tick, note, mock result and error-log entry. There is no undo —
    export a backup first if you might want it.</p>
    <button class="btn danger" id="btnReset" type="button">Reset all progress</button>
  </section>`;
}

/* ------------------------------------------------------------------ router */

const VIEWS = {
  dashboard: viewDashboard, plan: viewPlan, problems: viewProblems,
  weekdays: viewWeekdays, mocks: viewMocks, strategy: viewStrategy,
  templates: viewTemplates, checklists: viewChecklists, errors: viewErrors,
  research: viewResearch, account: viewAccount
};

function currentView() {
  const v = location.hash.replace('#', '');
  return VIEWS[v] ? v : 'dashboard';
}

let rendering = false;
function render() {
  if (rendering) return;
  rendering = true;
  const name = currentView();
  const main = $('#main');
  const keepScroll = main.dataset.view === name;
  const y = window.scrollY;

  main.dataset.view = name;
  main.innerHTML = VIEWS[name]();

  $$('.nav a').forEach(a =>
    a.setAttribute('aria-current', a.dataset.view === name ? 'page' : 'false'));

  if (keepScroll) window.scrollTo(0, y); else main.focus({ preventScroll: true });
  rendering = false;
}

/* ------------------------------------------------------------------ status */

function paintStatus() {
  const pill = $('#syncPill');
  const txt = $('.sync-text', pill);
  const map = {
    [STATUS.BOOT]: ['boot', 'Starting…'],
    [STATUS.UNCONFIGURED]: ['error', 'Setup needed'],
    [STATUS.NO_SDK]: ['error', 'No sync — browse only'],
    [STATUS.SIGNED_OUT]: ['boot', 'Signed out'],
    [STATUS.LOADING]: ['saving', 'Loading…'],
    [STATUS.READY]: ['ready', 'Synced'],
    [STATUS.SAVING]: ['saving', 'Saving…'],
    [STATUS.OFFLINE]: ['offline', 'Offline — queued'],
    [STATUS.CONFLICT]: ['conflict', 'Conflict'],
    [STATUS.ERROR]: ['error', 'Error']
  };
  const [state, label] = map[store.status] || ['boot', store.status];
  pill.dataset.state = state;
  txt.textContent = label;
  pill.title = store.message || label;

  $('#gate').hidden = store.status !== STATUS.SIGNED_OUT;
  $('#setup').hidden = store.status !== STATUS.UNCONFIGURED;
  const noSdk = $('#noSdk');
  if (noSdk) noSdk.hidden = store.status !== STATUS.NO_SDK;
  $('#conflictBar').hidden = store.status !== STATUS.CONFLICT;
}

/* ------------------------------------------------------------------- wires */

function wireDelegation() {
  const main = $('#main');

  // Checkbox-shaped things.
  main.addEventListener('change', e => {
    const t = e.target;

    // Filter selects carry data-filter, not data-kind.
    if (t.dataset.filter) {
      pFilter[t.dataset.filter] = t.value;
      render();
      return;
    }

    const kind = t.dataset.kind;
    if (!kind) return;
    const id = t.dataset.id;

    if (kind === 'weekday')  store.update(s => { t.checked ? s.weekdays[id] = true : delete s.weekdays[id]; });
    if (kind === 'sim')      store.update(s => { t.checked ? s.sims[id] = true : delete s.sims[id]; });
    if (kind === 'check')    store.update(s => { t.checked ? s.checklists[id] = true : delete s.checklists[id]; });
    if (kind === 'tpl')      store.update(s => { s.templates[id] = Number(t.value); });

    if (kind === 'pstatus')  store.update(s => {
      s.problems[id] = { ...(s.problems[id] || {}), status: t.value };
    });
    if (kind === 'pmins')    store.update(s => {
      s.problems[id] = { ...(s.problems[id] || {}), mins: t.value === '' ? null : Number(t.value) };
    });

    if (kind === 'mockres')  store.update(s => {
      const m = s.mocks[t.dataset.mock] || { results: {} };
      m.results = { ...(m.results || {}), [id]: t.value };
      s.mocks[t.dataset.mock] = m;
    });
    if (kind === 'mockdate') store.update(s => {
      s.mocks[id] = { ...(s.mocks[id] || { results: {} }), date: t.value };
    });

    if (['weekday', 'sim', 'check', 'tpl', 'pstatus', 'mockres'].includes(kind)) render();
  });

  // Free-text fields: save on blur so we are not re-rendering mid-keystroke.
  main.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.filter) {
      pFilter[t.dataset.filter] = t.value;
      if (t.dataset.filter === 'q') { debounceRender(); } else { render(); }
      return;
    }
    const kind = t.dataset.kind, id = t.dataset.id;
    if (kind === 'pnote')    store.update(s => { s.problems[id] = { ...(s.problems[id] || {}), note: t.value }; });
    if (kind === 'mocknote') store.update(s => { s.mocks[id] = { ...(s.mocks[id] || { results: {} }), note: t.value }; });
  });

  // Buttons and forms.
  main.addEventListener('click', e => {
    const btn = e.target.closest('[data-kind="errdel"], #btnSync, #btnExport, #btnImport, #btnSignOut, #btnReset');
    if (!btn) return;

    if (btn.dataset.kind === 'errdel') {
      const id = btn.dataset.id;
      store.update(s => { s.errors = s.errors.filter(x => x.id !== id); });
      render();
      return;
    }
    if (btn.id === 'btnSync')   { store.checkRemote().then(() => { if (store.status !== STATUS.CONFLICT) toast('No newer version on the server.'); }); }
    if (btn.id === 'btnExport') { downloadBackup(); }
    if (btn.id === 'btnImport') { $('#fileImport').click(); }
    if (btn.id === 'btnSignOut'){ store.signOut(); }
    if (btn.id === 'btnReset')  {
      if (confirm('Clear every tick, note, mock result and error-log entry? This cannot be undone.')) {
        store.update(s => {
          s.problems = {}; s.weekdays = {}; s.templates = {};
          s.mocks = {}; s.sims = {}; s.checklists = {}; s.errors = [];
        });
        render();
      }
    }
  });

  main.addEventListener('submit', e => {
    if (e.target.id !== 'errForm') return;
    e.preventDefault();
    const f = new FormData(e.target);
    const label = String(f.get('label') || '').trim();
    if (!label) return;
    store.update(s => {
      s.errors.unshift({
        id: `e${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        ts: Date.now(),
        label,
        cat: String(f.get('cat')),
        note: String(f.get('note') || '').trim()
      });
    });
    render();
  });

  main.addEventListener('change', e => {
    if (e.target.id !== 'fileImport') return;
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(txt => store.importJSON(txt)).then(() => { render(); toast('Backup imported.'); })
      .catch(err => toast(`Import failed: ${err.message}`));
  });
}

let rTimer;
function debounceRender() { clearTimeout(rTimer); rTimer = setTimeout(render, 180); }

function downloadBackup() {
  const blob = new Blob([store.exportJSON()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `infosys-sp-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function toast(msg) {
  const pill = $('#syncPill');
  const txt = $('.sync-text', pill);
  const prev = txt.textContent;
  txt.textContent = msg;
  setTimeout(() => { txt.textContent = prev; paintStatus(); }, 2600);
}

function wireChrome() {
  // Theme: explicit choice wins over the OS setting, and is part of synced prefs.
  const root = document.documentElement;
  const applyTheme = () => {
    const t = store.state.prefs?.theme || 'auto';
    root.dataset.theme = t;
  };
  $('#themeToggle').addEventListener('click', () => {
    const order = ['auto', 'light', 'dark'];
    const cur = store.state.prefs?.theme || 'auto';
    const next = order[(order.indexOf(cur) + 1) % order.length];
    store.update(s => { s.prefs = { ...(s.prefs || {}), theme: next }; });
    applyTheme();
    toast(`Theme: ${next}`);
  });

  $('#syncPill').addEventListener('click', () => {
    if (store.status === STATUS.OFFLINE) store._drainOutbox();
    else store.checkRemote();
  });

  $('#cfMerge').addEventListener('click', () => store.resolveMerge().then(render));
  $('#cfRemote').addEventListener('click', () => store.resolveTakeRemote().then(render));
  $('#cfLocal').addEventListener('click', () => store.resolveKeepLocal().then(render));

  // Auth
  const gateMsg = $('#gateMsg');
  const say = (m, kind = '') => { gateMsg.textContent = m; gateMsg.dataset.kind = kind; };

  $('#emailForm').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#email').value.trim();
    say('Sending…');
    try {
      await store.sendCode(email);
      $('#emailForm').hidden = true;
      $('#codeForm').hidden = false;
      $('#code').focus();
      say(`Code sent to ${email}. Check your inbox — the link works too.`, 'ok');
    } catch (err) { say(err.message || 'Could not send the code.', 'err'); }
  });

  $('#codeForm').addEventListener('submit', async e => {
    e.preventDefault();
    say('Verifying…');
    try {
      await store.verifyCode($('#email').value.trim(), $('#code').value);
      say('');
    } catch (err) { say(err.message || 'That code did not work.', 'err'); }
  });

  $('#backToEmail').addEventListener('click', () => {
    $('#codeForm').hidden = true;
    $('#emailForm').hidden = false;
    say('');
  });

  applyTheme();
  return applyTheme;
}

/* -------------------------------------------------------------------- boot */

function tickCountdown() {
  const d = daysLeft();
  $('#countdown').textContent = d > 1
    ? `${d} days to ${fmtDate(EXAM.date)}`
    : d === 1 ? 'Tomorrow — good luck'
    : d === 0 ? 'Today. You have done the work.'
    : 'Exam date passed';
}

async function boot() {
  const applyTheme = wireChrome();
  wireDelegation();
  tickCountdown();
  setInterval(tickCountdown, 60_000);

  let lastTheme = null;
  store.subscribe(() => {
    paintStatus();
    const t = store.state.prefs?.theme || 'auto';
    if (t !== lastTheme) { lastTheme = t; applyTheme(); }
  });

  addEventListener('hashchange', render);
  render();
  paintStatus();

  await store.init();
  render();
  paintStatus();
}

boot();
