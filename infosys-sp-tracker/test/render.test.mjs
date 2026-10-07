import { chromium } from 'playwright';
import { FAKE_SDK } from './fake-sdk.mjs';

// Playwright finds its own browser unless an image provides one.
const LAUNCH = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

const VIEWS = ['dashboard','plan','problems','weekdays','mocks','strategy','templates','checklists','errors','research','account'];
const browser = await chromium.launch(LAUNCH);
let fail = 0;

for (const [name, vp] of [['mobile',{width:390,height:844}], ['laptop',{width:1440,height:900}]]) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errs.push(`console: ${m.text()}`); });

  // Intercept the SDK so the suite is hermetic: it must pass offline, and a
  // slow or blocked CDN must never look like a rendering failure.
  await page.route('**/@supabase/supabase-js**', r =>
    r.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: FAKE_SDK }));

  await page.goto('http://127.0.0.1:8138/', { waitUntil: 'networkidle' });

  for (const v of VIEWS) {
    await page.goto(`http://127.0.0.1:8138/#${v}`, { waitUntil: 'load' });
    await page.waitForTimeout(220);
    const info = await page.evaluate(() => {
      const main = document.querySelector('main');
      return {
        view: main.dataset.view,
        chars: main.innerText.length,
        h1: main.querySelector('h1')?.textContent ?? null,
        overflowX: document.documentElement.scrollWidth > window.innerWidth + 1
          ? document.documentElement.scrollWidth : 0
      };
    });
    const bad = [];
    if (info.view !== v) bad.push(`view mismatch (${info.view})`);
    if (info.chars < 150) bad.push(`too little content (${info.chars} chars)`);
    if (!info.h1) bad.push('no h1');
    if (info.overflowX) bad.push(`HORIZONTAL OVERFLOW: scrollWidth ${info.overflowX} > ${vp.width}`);
    if (bad.length) { fail++; console.log(`  ✗ ${name}/${v}: ${bad.join('; ')}`); }
    else console.log(`  ✓ ${name}/${v} — "${info.h1}" (${info.chars} chars)`);
  }

  // The harness serves stub credentials, so the site should be signed in with
  // no gate showing. A visible setup gate means config.js was not picked up.
  const gates = await page.evaluate(() => ({
    setup: !document.getElementById('setup').hidden,
    auth: !document.getElementById('gate').hidden,
    pill: document.querySelector('#syncPill .sync-text').textContent
  }));
  console.log(`  · gates on ${name}:`, JSON.stringify(gates));

  if (errs.length) { fail++; console.log(`  ✗ ${name} JS errors:\n    ` + errs.slice(0,8).join('\n    ')); }
  else console.log(`  ✓ ${name}: no JS errors`);

  await page.goto('http://127.0.0.1:8138/#dashboard', { waitUntil: 'load' });
  await page.screenshot({ path: `test/out/shot-${name}.png`, fullPage: false });
  await page.goto('http://127.0.0.1:8138/#problems', { waitUntil: 'load' });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `test/out/shot-${name}-problems.png`, fullPage: false });
  await ctx.close();
}

await browser.close();
console.log(fail ? `\n${fail} FAILURES` : '\nAll smoke checks passed');
process.exit(fail ? 1 : 0);
