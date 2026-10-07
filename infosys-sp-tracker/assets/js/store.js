/* Supabase-backed state store.
 *
 * Why a single JSONB document per user: the tracker state is one document edited
 * by one person on two devices. A document store needs no migrations when the
 * plan changes, and a whole-document write is the natural unit.
 *
 * Why optimistic concurrency instead of plain last-write-wins: with a phone and
 * a laptop both open, a blind UPDATE silently discards whichever device saved
 * first. So every write is conditional on the updated_at we last read; if the
 * row moved underneath us the write is rejected and the user is asked, rather
 * than losing a weekend of ticks.
 *
 * localStorage is used ONLY as a durable outbox for writes that failed while
 * offline — never as the source of truth. The server row is always authoritative.
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config.js';

const SDK_URL = globalThis.__SUPABASE_SDK_URL__
  || 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SCHEMA_VERSION = 1;
const OUTBOX_KEY = 'ispt.outbox';
const SAVE_DEBOUNCE_MS = 900;

export const STATUS = {
  BOOT: 'boot',
  UNCONFIGURED: 'unconfigured',
  NO_SDK: 'no_sdk',
  SIGNED_OUT: 'signed_out',
  LOADING: 'loading',
  READY: 'ready',
  SAVING: 'saving',
  OFFLINE: 'offline',
  CONFLICT: 'conflict',
  ERROR: 'error'
};

export function emptyState() {
  return {
    v: SCHEMA_VERSION,
    problems: {},   // id -> { status, mins, note }
    weekdays: {},   // id -> true
    templates: {},  // id -> 0 | 1 | 2
    mocks: {},      // mockId -> { date, results: {pid: 'solved'|'partial'|'failed'}, note }
    sims: {},       // simId -> true
    checklists: {}, // itemKey -> true
    errors: [],     // { id, ts, label, cat, note }
    prefs: { theme: 'auto' }
  };
}

/* Fill in anything a newer schema version added, without clobbering saved data. */
function migrate(raw) {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;
  return {
    ...base,
    ...raw,
    v: SCHEMA_VERSION,
    problems: raw.problems || {},
    weekdays: raw.weekdays || {},
    templates: raw.templates || {},
    mocks: raw.mocks || {},
    sims: raw.sims || {},
    checklists: raw.checklists || {},
    errors: Array.isArray(raw.errors) ? raw.errors : [],
    prefs: { ...base.prefs, ...(raw.prefs || {}) }
  };
}

class Store {
  constructor() {
    this.sb = null;
    this.user = null;
    this.accessToken = null;
    this.state = emptyState();
    this.status = STATUS.BOOT;
    this.message = '';
    this.serverUpdatedAt = null;  // raw server string, never re-serialised
    this.lastSyncedAt = null;
    this.incoming = null;         // the other device's state, when a conflict is live
    this._listeners = new Set();
    this._timer = null;
    this._inflight = false;
  }

  subscribe(fn) { this._listeners.add(fn); return () => this._listeners.delete(fn); }
  _emit() { for (const fn of this._listeners) fn(this); }

  _setStatus(status, message = '') {
    this.status = status;
    this.message = message;
    this._emit();
  }

  get configured() {
    return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY &&
      !SUPABASE_URL.includes('YOUR_') && !SUPABASE_ANON_KEY.includes('YOUR_'));
  }

  async init() {
    if (!this.configured) {
      this._setStatus(STATUS.UNCONFIGURED);
      return;
    }
    let createClient;
    try {
      ({ createClient } = await import(SDK_URL));
    } catch {
      // Offline, or the CDN is blocked. The plan is still worth reading, so the
      // UI degrades to browse-only rather than showing a blank page.
      this._setStatus(STATUS.NO_SDK, 'Could not load the Supabase client — browsing without sync.');
      return;
    }

    this.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });

    const { data: { session } } = await this.sb.auth.getSession();
    this.sb.auth.onAuthStateChange((_event, s) => {
      const nextUser = s?.user ?? null;
      const changed = (nextUser?.id ?? null) !== (this.user?.id ?? null);
      this.user = nextUser;
      this.accessToken = s?.access_token ?? null;
      if (!nextUser) {
        this.state = emptyState();
        this._setStatus(STATUS.SIGNED_OUT);
      } else if (changed) {
        this.load();
      }
    });

    this.user = session?.user ?? null;
    this.accessToken = session?.access_token ?? null;
    if (this.user) await this.load();
    else this._setStatus(STATUS.SIGNED_OUT);

    // A write that failed offline is retried as soon as we are back.
    addEventListener('online', () => this._drainOutbox());
    // Flush pending edits before the tab goes away.
    addEventListener('pagehide', () => this._flushSync());
    // Coming back to the tab is the cheapest moment to notice the other device.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.user) this.checkRemote();
    });
  }

  /* ----------------------------------------------------------------- auth */

  async sendCode(email) {
    const { error } = await this.sb.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true, emailRedirectTo: location.href.split('#')[0] }
    });
    if (error) throw error;
  }

  async verifyCode(email, token) {
    const { error } = await this.sb.auth.verifyOtp({ email, token: token.trim(), type: 'email' });
    if (error) throw error;
  }

  async signOut() {
    await this._flush();
    await this.sb.auth.signOut();
  }

  /* ----------------------------------------------------------------- load */

  async load() {
    this._setStatus(STATUS.LOADING);
    const { data, error } = await this.sb
      .from('progress')
      .select('state, updated_at')
      .eq('user_id', this.user.id)
      .maybeSingle();

    if (error) { this._setStatus(STATUS.ERROR, error.message); return; }

    if (!data) {
      // First sign-in on this account: create the row so later writes can be
      // conditional updates rather than upserts.
      const fresh = emptyState();
      const { data: created, error: insErr } = await this.sb
        .from('progress')
        .insert({ user_id: this.user.id, state: fresh })
        .select('state, updated_at')
        .single();
      if (insErr) { this._setStatus(STATUS.ERROR, insErr.message); return; }
      this.state = migrate(created.state);
      this.serverUpdatedAt = created.updated_at;
    } else {
      this.state = migrate(data.state);
      this.serverUpdatedAt = data.updated_at;
    }

    this.lastSyncedAt = Date.now();
    this._setStatus(STATUS.READY);
    this._drainOutbox();
  }

  /** Did the other device write since we loaded? Does not change local state. */
  async checkRemote() {
    if (!this.user || this.status === STATUS.CONFLICT) return;
    const { data, error } = await this.sb
      .from('progress')
      .select('state, updated_at')
      .eq('user_id', this.user.id)
      .maybeSingle();
    if (error || !data) return;
    if (data.updated_at !== this.serverUpdatedAt) {
      this.incoming = { state: migrate(data.state), updated_at: data.updated_at };
      this._setStatus(STATUS.CONFLICT, 'Another device saved newer progress.');
    }
  }

  /* ---------------------------------------------------------------- write */

  /** Mutate local state and schedule a save. The mutator gets the live object. */
  update(mutator) {
    mutator(this.state);
    this._emit();
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._flush(), SAVE_DEBOUNCE_MS);
  }

  async _flush() {
    if (!this.user || this._inflight) return;
    if (this.status === STATUS.CONFLICT) return;
    this._inflight = true;
    this._setStatus(STATUS.SAVING);

    const payload = JSON.parse(JSON.stringify(this.state));
    try {
      const { data, error } = await this.sb
        .from('progress')
        .update({ state: payload })
        .eq('user_id', this.user.id)
        .eq('updated_at', this.serverUpdatedAt)   // optimistic concurrency
        .select('updated_at')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Zero rows matched: the row moved under us.
        this._inflight = false;
        await this.checkRemote();
        return;
      }

      this.serverUpdatedAt = data.updated_at;
      this.lastSyncedAt = Date.now();
      this._clearOutbox();
      this._inflight = false;
      this._setStatus(STATUS.READY);
    } catch (err) {
      this._inflight = false;
      this._queueOutbox(payload);
      this._setStatus(STATUS.OFFLINE, err.message || 'Could not reach Supabase — change queued.');
    }
  }

  /* Best-effort synchronous save on tab close. keepalive lets the browser finish
   * the request after the page is gone; if it cannot, the outbox catches it. */
  _flushSync() {
    if (!this.user || !this.configured || this.status === STATUS.CONFLICT) return;
    const payload = JSON.parse(JSON.stringify(this.state));
    // Queue first: if the keepalive request never lands, the outbox replays it.
    this._queueOutbox(payload);
    if (!this.accessToken) return;
    try {
      const url = `${SUPABASE_URL}/rest/v1/progress?user_id=eq.${encodeURIComponent(this.user.id)}`;
      fetch(url, {
        method: 'PATCH',
        keepalive: true,
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ state: payload })
      }).catch(() => {});
    } catch { /* the outbox is the fallback */ }
  }

  /* -------------------------------------------------------------- conflict */

  /** Take the other device's version and discard local unsaved edits. */
  async resolveTakeRemote() {
    if (!this.incoming) return;
    this.state = this.incoming.state;
    this.serverUpdatedAt = this.incoming.updated_at;
    this.incoming = null;
    this._clearOutbox();
    this.lastSyncedAt = Date.now();
    this._setStatus(STATUS.READY);
  }

  /** Keep this device's version and overwrite the server. */
  async resolveKeepLocal() {
    if (!this.incoming) return;
    this.serverUpdatedAt = this.incoming.updated_at;  // so the conditional write matches
    this.incoming = null;
    this._setStatus(STATUS.SAVING);
    await this._flush();
  }

  /** Union of both versions — the safest default for checkbox-shaped data. */
  async resolveMerge() {
    if (!this.incoming) return;
    this.state = unionStates(this.incoming.state, this.state);
    this.serverUpdatedAt = this.incoming.updated_at;
    this.incoming = null;
    this._setStatus(STATUS.SAVING);
    await this._flush();
  }

  /* ---------------------------------------------------------------- outbox */

  _queueOutbox(payload) {
    try {
      localStorage.setItem(OUTBOX_KEY, JSON.stringify({ uid: this.user.id, payload, ts: Date.now() }));
    } catch { /* private mode / quota — nothing we can do, and nothing depends on it */ }
  }

  _clearOutbox() {
    try { localStorage.removeItem(OUTBOX_KEY); } catch { /* ignore */ }
  }

  async _drainOutbox() {
    if (!this.user || this.status === STATUS.CONFLICT) return;
    let queued;
    try { queued = JSON.parse(localStorage.getItem(OUTBOX_KEY) || 'null'); } catch { return; }
    if (!queued || queued.uid !== this.user.id) return;

    // The queued payload is an older snapshot of THIS device. Union it into the
    // live state so nothing a flaky network ate gets dropped, then save normally.
    this.state = unionStates(migrate(queued.payload), this.state);
    this._emit();
    await this._flush();
  }

  /* ---------------------------------------------------------------- export */

  exportJSON() {
    return JSON.stringify({ exportedAt: new Date().toISOString(), state: this.state }, null, 2);
  }

  async importJSON(text) {
    const parsed = JSON.parse(text);
    const next = migrate(parsed.state ?? parsed);
    this.update(s => { Object.assign(s, next); });
    await this._flush();
  }
}

/* Union of two states. `mine` wins any field-level tie; set-like maps union;
 * template mastery takes the higher level; the error log dedupes by id. */
export function unionStates(theirs = {}, mine = {}) {
  const errorsById = new Map();
  for (const e of [...(theirs.errors || []), ...(mine.errors || [])]) errorsById.set(e.id, e);
  return {
    ...mine,
    problems:   mergeRecords(theirs.problems, mine.problems),
    weekdays:   { ...theirs.weekdays, ...mine.weekdays },
    templates:  mergeMax(theirs.templates, mine.templates),
    mocks:      mergeRecords(theirs.mocks, mine.mocks),
    sims:       { ...theirs.sims, ...mine.sims },
    checklists: { ...theirs.checklists, ...mine.checklists },
    errors:     [...errorsById.values()].sort((a, b) => b.ts - a.ts),
    prefs:      { ...theirs.prefs, ...mine.prefs }
  };
}

function mergeRecords(a, b) {
  const out = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) {
    out[k] = (v && typeof v === 'object') ? { ...(out[k] || {}), ...v } : v;
  }
  return out;
}

function mergeMax(a, b) {
  const out = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) out[k] = Math.max(Number(out[k] || 0), Number(v || 0));
  return out;
}

export const store = new Store();
