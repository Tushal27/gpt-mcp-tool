/* Tests for the parts of the store that can lose data: the union used by both
 * conflict-merge and outbox replay, and the optimistic-concurrency refusal. */
import assert from 'node:assert/strict';
import { mkdtemp, cp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';

// fileURLToPath, not .pathname: on Windows .pathname yields "/C:/..." which is
// not a usable filesystem path.
const SRC = fileURLToPath(new URL('..', import.meta.url));
const dir = await mkdtemp(join(tmpdir(), 'ispt-'));
await cp(SRC, dir, { recursive: true });
await writeFile(join(dir, 'config.js'),
  `export const SUPABASE_URL='https://test.supabase.co';export const SUPABASE_ANON_KEY='test-key';`);

/* A fake Supabase: one row, a version counter, and an UPDATE that honours the
 * .eq('updated_at', ...) precondition exactly as Postgres would. */
function fakeSupabase(row) {
  const authCbs = [];
  const api = {
    __row: row,
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'u1', email: 'a@b.c' }, access_token: 't' } } }),
      onAuthStateChange: cb => { authCbs.push(cb); return { data: { subscription: { unsubscribe() {} } } }; },
      signOut: async () => ({})
    },
    from() {
      const q = { _filters: {}, _op: null, _payload: null };
      q.select = () => q;
      q.eq = (col, val) => { q._filters[col] = val; return q; };
      q.update = payload => { q._op = 'update'; q._payload = payload; return q; };
      q.insert = payload => { q._op = 'insert'; q._payload = payload; return q; };
      q.maybeSingle = async () => run(q);
      q.single = async () => run(q);
      return q;
    }
  };
  function run(q) {
    if (q._op === 'update') {
      if ('updated_at' in q._filters && q._filters.updated_at !== api.__row.updated_at) {
        return { data: null, error: null };            // zero rows matched
      }
      api.__row = { state: q._payload.state, updated_at: `v${Number(api.__row.updated_at.slice(1)) + 1}` };
      return { data: { updated_at: api.__row.updated_at }, error: null };
    }
    if (q._op === 'insert') { api.__row = { state: q._payload.state, updated_at: 'v1' }; return { data: api.__row, error: null }; }
    return { data: api.__row, error: null };
  }
  return api;
}

async function freshStore(row) {
  const fake = fakeSupabase(row);
  const sdk = `export const createClient = () => (globalThis.__FAKE__);`;
  globalThis.__FAKE__ = fake;
  globalThis.__SUPABASE_SDK_URL__ = 'data:text/javascript;base64,' + Buffer.from(sdk).toString('base64');
  globalThis.window = globalThis;
  globalThis.addEventListener = () => {};
  globalThis.document = { addEventListener: () => {}, visibilityState: 'visible' };
  globalThis.localStorage = {
    _m: new Map(),
    getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
    setItem(k, v) { this._m.set(k, v); },
    removeItem(k) { this._m.delete(k); }
  };
  // import() takes a URL. A bare Windows path ("C:\\...") is rejected as an
  // unsupported scheme, so convert before appending the cache-buster.
  const url = pathToFileURL(join(dir, 'assets/js/store.js'));
  const mod = await import(`${url.href}?t=${Math.random()}`);
  await mod.store.init();
  return { store: mod.store, fake, unionStates: mod.unionStates };
}

test('union keeps every tick from both devices', async () => {
  const { unionStates } = await freshStore({ state: {}, updated_at: 'v1' });
  const phone = { problems: { p01: { status: 'solved' } }, weekdays: { d01: true }, templates: { t01: 2 },
                  mocks: {}, sims: {}, checklists: { 'cl-night.0': true },
                  errors: [{ id: 'e1', ts: 1, label: 'A', cat: 'bug' }], prefs: {} };
  const laptop = { problems: { p02: { status: 'failed' } }, weekdays: { d02: true }, templates: { t01: 1, t02: 2 },
                   mocks: {}, sims: { s1: true }, checklists: {},
                   errors: [{ id: 'e2', ts: 2, label: 'B', cat: 'edge' }], prefs: {} };
  const u = unionStates(phone, laptop);
  assert.equal(u.problems.p01.status, 'solved', 'phone tick survived');
  assert.equal(u.problems.p02.status, 'failed', 'laptop tick survived');
  assert.deepEqual(Object.keys(u.weekdays).sort(), ['d01', 'd02']);
  assert.equal(u.templates.t01, 2, 'template mastery takes the HIGHER level');
  assert.equal(u.templates.t02, 2);
  assert.equal(u.sims.s1, true);
  assert.equal(u.checklists['cl-night.0'], true);
  assert.deepEqual(u.errors.map(e => e.id), ['e2', 'e1'], 'error log deduped and newest-first');
});

test('union merges per-problem fields instead of replacing the object', async () => {
  const { unionStates } = await freshStore({ state: {}, updated_at: 'v1' });
  const u = unionStates(
    { problems: { p01: { status: 'solved', mins: 30 } }, errors: [] },
    { problems: { p01: { note: 'overflow bug' } }, errors: [] }
  );
  assert.equal(u.problems.p01.status, 'solved', 'status from the other device kept');
  assert.equal(u.problems.p01.mins, 30, 'minutes kept');
  assert.equal(u.problems.p01.note, 'overflow bug', 'local note kept');
});

test('a write wins when the row has not moved', async () => {
  const { store, fake } = await freshStore({ state: { v: 1, problems: {}, errors: [] }, updated_at: 'v7' });
  store.update(s => { s.problems.p01 = { status: 'solved' }; });
  await store._flush();
  assert.equal(store.status, 'ready');
  assert.equal(fake.__row.state.problems.p01.status, 'solved');
  assert.equal(store.serverUpdatedAt, 'v8', 'local version advanced to the server version');
});

test('a write is REFUSED when the other device got there first', async () => {
  const { store, fake } = await freshStore({ state: { v: 1, problems: {}, errors: [] }, updated_at: 'v1' });

  // The phone saves while this tab is open.
  fake.__row = { state: { v: 1, problems: { p99: { status: 'solved' } }, errors: [] }, updated_at: 'v2' };

  store.update(s => { s.problems.p01 = { status: 'solved' }; });
  await store._flush();

  assert.equal(store.status, 'conflict', 'conflict surfaced instead of clobbering');
  assert.equal(fake.__row.state.problems.p99.status, 'solved', "the phone's tick is still on the server");
  assert.equal(fake.__row.state.problems.p01, undefined, 'this tab did NOT overwrite it');
});

test('merge resolution saves the union and clears the conflict', async () => {
  const { store, fake } = await freshStore({ state: { v: 1, problems: {}, errors: [] }, updated_at: 'v1' });
  fake.__row = { state: { v: 1, problems: { p99: { status: 'solved' } }, errors: [] }, updated_at: 'v2' };
  store.update(s => { s.problems.p01 = { status: 'solved' }; });
  await store._flush();
  assert.equal(store.status, 'conflict');

  await store.resolveMerge();
  assert.equal(store.status, 'ready');
  assert.equal(fake.__row.state.problems.p01.status, 'solved', 'this tab survived the merge');
  assert.equal(fake.__row.state.problems.p99.status, 'solved', 'the phone survived the merge');
});

test('a failed write is queued and replayed, not lost', async () => {
  const { store, fake } = await freshStore({ state: { v: 1, problems: {}, errors: [] }, updated_at: 'v1' });

  const realFrom = fake.from;
  fake.from = () => { throw new Error('network down'); };
  store.update(s => { s.problems.p42 = { status: 'solved' }; });
  await store._flush();
  assert.equal(store.status, 'offline', 'offline status shown');
  assert.ok(globalThis.localStorage.getItem('ispt.outbox'), 'write queued in the outbox');

  fake.from = realFrom;
  await store._drainOutbox();
  assert.equal(fake.__row.state.problems.p42.status, 'solved', 'queued tick reached the server');
  assert.equal(globalThis.localStorage.getItem('ispt.outbox'), null, 'outbox cleared after success');
});
