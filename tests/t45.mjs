import { chromium } from 'playwright';
import fs from 'fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: 956, height: 440 }, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => localStorage.setItem('cockpit.v1', JSON.stringify({ radioItV1: true, stations: [{ name: 'Prova', url: 'https://stream.example/a.webm', site: '', logo: '' }] })));
await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://')) return r.continue();
  if (u.includes('stream.example')) return r.fulfill({ body: fs.readFileSync(new URL('../awake.webm', import.meta.url)), contentType: 'audio/webm', headers: { 'access-control-allow-origin': '*' } });
  return r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3800);
const st = async l => console.log(l, '|', (await p.textContent('#radioStatus')).trim(), '| playing:', await p.evaluate(() => document.querySelector('#pRadio').classList.contains('playing')), '| paused:', await p.evaluate(() => document.querySelector('#audio').paused));
for (const how of ['tap', 'click']) {
  const go = () => how === 'tap' ? p.tap('#wave') : p.click('#wave');
  await go(); await p.waitForTimeout(1500); await st(how + ' 1 (play)');
  await p.waitForTimeout(500); await go(); await p.waitForTimeout(1000); await st(how + ' 2 (pausa)');
}
await p.tap('#stLogo'); await p.waitForTimeout(1500); await st('tap logo (play)');
await p.waitForTimeout(500); await p.tap('#stLogo'); await p.waitForTimeout(1000); await st('tap logo (pausa)');
console.log(errs.join('\n') || 'no errors'); await b.close();
