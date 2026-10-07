/* Serves a copy of the site with stub Supabase credentials, then runs the
 * browser suites against it. The real client is intercepted per-test, so no
 * network and no Supabase project are needed.
 *
 *   npm i && npm run test:ui
 */
import { spawn } from 'node:child_process';
import { cp, mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const PORT = 8138;

const dir = await mkdtemp(join(tmpdir(), 'ispt-site-'));
await cp(ROOT, dir, { recursive: true });
await writeFile(join(dir, 'config.js'),
  `export const SUPABASE_URL='https://faked.supabase.co';\nexport const SUPABASE_ANON_KEY='faked-anon-key';\n`);
await mkdir(join(ROOT, 'test/out'), { recursive: true });

const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'],
  { cwd: dir, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 1200));

let code = 0;
for (const suite of ['render.test.mjs', 'ui.test.mjs']) {
  console.log(`\n=== ${suite}`);
  const r = spawn('node', [join(ROOT, 'test', suite)], { stdio: 'inherit', cwd: ROOT });
  const status = await new Promise(res => r.on('close', res));
  if (status !== 0) code = status;
}

server.kill();
await rm(dir, { recursive: true, force: true });
process.exit(code);
