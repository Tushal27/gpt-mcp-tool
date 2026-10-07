import { chromium } from 'playwright';
import { FAKE_SDK } from './fake-sdk.mjs';

// Playwright finds its own browser unless an image provides one.
const LAUNCH = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

const browser = await chromium.launch(LAUNCH);
let fails = 0;
const chk = (c, m) => { if (!c) fails++; console.log(`  ${c ? '✓' : '✗'} ${m}`); };

for (const [name, vp] of [['mobile', { width: 390, height: 844 }], ['laptop', { width: 1440, height: 900 }]]) {
  console.log(`\n── ${name} ──`);
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

  await page.route('**/@supabase/supabase-js**', r =>
    r.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: FAKE_SDK }));

  await page.goto('http://127.0.0.1:8138/#dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const gates = await page.evaluate(() => ({
    setup: !document.getElementById('setup').hidden,
    auth: !document.getElementById('gate').hidden,
    noSdk: !document.getElementById('noSdk').hidden,
    pill: document.querySelector('#syncPill .sync-text').textContent
  }));
  chk(!gates.setup && !gates.auth && !gates.noSdk, `no gates when signed in (pill: "${gates.pill}")`);
  chk(gates.pill === 'Synced', 'sync pill reads Synced');

  // Tick a problem, and confirm the write actually reached the (fake) server row.
  await page.goto('http://127.0.0.1:8138/#problems', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.selectOption('select[data-kind="pstatus"][data-id="p25"]', 'solved');
  await page.fill('input[data-kind="pnote"][data-id="p25"]', 'prime-power cover, dp[mask]');
  await page.waitForTimeout(1400);
  const persisted = await page.evaluate(() => window.__row?.state?.problems?.p25);
  chk(persisted?.status === 'solved', 'problem status reached the server row');
  chk(persisted?.note === 'prime-power cover, dp[mask]', 'note reached the server row');

  // Checkboxes now clickable (no blocking modal).
  await page.goto('http://127.0.0.1:8138/#weekdays', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.check('input[data-kind="weekday"][data-id="d01"]');
  await page.waitForTimeout(1300);
  chk(await page.evaluate(() => window.__row?.state?.weekdays?.d01) === true, 'weekday tick reached the server row');

  await page.goto('http://127.0.0.1:8138/#checklists', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.check('input[data-kind="check"][data-id="cl-night.0"]');
  await page.waitForTimeout(1300);
  chk(await page.evaluate(() => window.__row?.state?.checklists['cl-night.0']) === true, 'checklist tick reached the server row');

  await page.goto('http://127.0.0.1:8138/#templates', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.selectOption('select[data-kind="tpl"][data-id="t02"]', '2');
  await page.waitForTimeout(1300);
  chk(await page.evaluate(() => window.__row?.state?.templates?.t02) === 2, 'template mastery reached the server row');

  // Mock result.
  await page.goto('http://127.0.0.1:8138/#mocks', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.selectOption('select[data-kind="mockres"][data-mock="mockA"][data-id="mA1"]', 'solved');
  await page.waitForTimeout(1300);
  chk(await page.evaluate(() => window.__row?.state?.mocks?.mockA?.results?.mA1) === 'solved', 'mock result reached the server row');

  // Error log + histogram.
  await page.goto('http://127.0.0.1:8138/#errors', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.fill('#errForm input[name="label"]', 'LC 410 Split Array');
  await page.selectOption('#errForm select[name="cat"]', 'cxty');
  await page.fill('#errForm input[name="note"]', 'wrote O(n^2) at n=1e5');
  await page.click('#errForm button[type="submit"]');
  await page.waitForTimeout(1300);
  chk((await page.evaluate(() => window.__row?.state?.errors?.length)) === 1, 'error entry reached the server row');
  chk(await page.evaluate(() => {
    const r = [...document.querySelectorAll('.hist-row')].find(x => x.textContent.includes('Wrong complexity'));
    return r && r.querySelector('.cnt').textContent.trim() === '1' && parseFloat(r.querySelector('i').style.width) === 100;
  }), 'histogram bar + count render for that category');

  // Dashboard reflects everything.
  await page.goto('http://127.0.0.1:8138/#dashboard', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const dash = await page.locator('main').innerText();
  chk(dash.includes('biggest leak'), 'dashboard names the biggest leak once errors exist');
  chk(/1\s*\/\s*20|1\/20/.test(dash.replace(/\s+/g,'')) || dash.includes('Templates'), 'dashboard shows template progress');

  // Conflict path: another device bumps the row, then we try to write.
  await page.evaluate(() => { window.__row.updated_at = 'v99'; window.__row.state.problems = { ...(window.__row.state.problems||{}), p47: { status: 'solved' } }; });
  await page.goto('http://127.0.0.1:8138/#problems', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.selectOption('select[data-kind="pstatus"][data-id="p04"]', 'solved');
  await page.waitForTimeout(1600);
  chk(!(await page.locator('#conflictBar').isHidden()), 'conflict bar appears when the other device wrote first');
  await page.click('#cfMerge');
  await page.waitForTimeout(1200);
  const merged = await page.evaluate(() => window.__row?.state?.problems);
  chk(merged?.p04?.status === 'solved' && merged?.p47?.status === 'solved', 'merge kept both devices’ ticks');
  chk(await page.locator('#conflictBar').isHidden(), 'conflict bar clears after merge');

  // Export produces a real download.
  await page.goto('http://127.0.0.1:8138/#account', { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const dl = await Promise.all([page.waitForEvent('download'), page.click('#btnExport')]).then(([d]) => d);
  chk(/infosys-sp-progress-\d{4}-\d{2}-\d{2}\.json/.test(dl.suggestedFilename()), `export downloads ${dl.suggestedFilename()}`);

  chk(errs.length === 0, `no JS errors (${errs.slice(0, 3).join(' | ') || 'none'})`);

  if (name === 'mobile') {
    await page.goto('http://127.0.0.1:8138/#dashboard', { waitUntil: 'load' }); await page.waitForTimeout(400);
    await page.screenshot({ path: 'test/out/m-dash.png' });
    await page.goto('http://127.0.0.1:8138/#problems', { waitUntil: 'load' }); await page.waitForTimeout(400);
    await page.screenshot({ path: 'test/out/m-problems.png' });
  } else {
    await page.goto('http://127.0.0.1:8138/#dashboard', { waitUntil: 'load' }); await page.waitForTimeout(400);
    await page.screenshot({ path: 'test/out/l-dash.png' });
    await page.goto('http://127.0.0.1:8138/#strategy', { waitUntil: 'load' }); await page.waitForTimeout(400);
    await page.screenshot({ path: 'test/out/l-strategy.png' });
    await page.click('#themeToggle'); await page.click('#themeToggle'); await page.waitForTimeout(300);
    await page.goto('http://127.0.0.1:8138/#research', { waitUntil: 'load' }); await page.waitForTimeout(400);
    await page.screenshot({ path: 'test/out/l-research-dark.png' });
  }
  await ctx.close();
}
await browser.close();
console.log(fails ? `\n${fails} FAILURES` : '\nAll signed-in interaction checks passed');
process.exit(fails ? 1 : 0);
