/* Served to the page in place of the real Supabase SDK. Implements just enough
 * of the client surface the store uses, over one in-memory row, including the
 * .eq('updated_at', ...) precondition that makes writes conditional. */
export const FAKE_SDK = `
let row = { state: {}, updated_at: 'v1' };
let seeded = false;
export function createClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: 'u1', email: 'test@example.com' }, access_token: 'tok' } } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({ error: null })
    },
    from() {
      const q = { f: {}, op: null, payload: null };
      q.select = () => q;
      q.eq = (c, v) => { q.f[c] = v; return q; };
      q.update = p => { q.op = 'update'; q.payload = p; return q; };
      q.insert = p => { q.op = 'insert'; q.payload = p; return q; };
      const run = async () => {
        if (q.op === 'update') {
          if ('updated_at' in q.f && q.f.updated_at !== row.updated_at) return { data: null, error: null };
          row = { state: q.payload.state, updated_at: 'v' + (Number(row.updated_at.slice(1)) + 1) };
          window.__row = row;
          return { data: { updated_at: row.updated_at }, error: null };
        }
        if (q.op === 'insert') { row = { state: q.payload.state, updated_at: 'v1' }; seeded = true; window.__row = row; return { data: row, error: null }; }
        window.__row = row;
        return { data: seeded ? row : null, error: null };
      };
      q.maybeSingle = run; q.single = run;
      return q;
    }
  };
}
`;
