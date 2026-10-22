// iPad: le 6 app nella pagina in giù del riquadro della radio (swipe in giù: app, in su: «Casa», radio di partenza); sull'iPhone non ci sono
import { chromium } from 'playwright';
const S0 = process.env.OUT || './'; // screenshot dock_*.png
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const swipe = async (p, dy) => {
  const r = await p.evaluate(() => { const b = document.querySelector('#pRadio').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  await p.mouse.move(r.x, r.y); await p.mouse.down();
  for (let i = 1; i <= 8; i++) { await p.mouse.move(r.x, r.y + dy * i / 8); await p.waitForTimeout(16); }
  await p.mouse.up(); await p.waitForTimeout(600);
};
const state = p => p.evaluate(() => { const r = document.querySelector('#pRadio'); return r.classList.contains('apps') ? 'app' : r.classList.contains('act') ? 'casa' : 'radio'; });
for (const [w, h, pad] of [[820, 1180, 1], [1180, 820, 1], [420, 912, 0]]) {
  const ctx = await b.newContext(pad ? { viewport: { width: w, height: h }, screen: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, userAgent: IPAD } : { viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('cockpit.lastpos', JSON.stringify({ lat: 40.75, lng: 14.45, t: Date.now() })));
  await ctx.route('**/*', r => { const u = r.request().url(); return (u.startsWith('file://') || u.startsWith('data:')) ? r.continue() : r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(w / 2, 200); await p.waitForTimeout(400);
  const seq = ['partenza ' + await state(p)];
  await swipe(p, 120); seq.push('giù ' + await state(p));
  if (pad) await p.screenshot({ path: S0 + `dock_${w}.png` });
  const geo = await p.evaluate(() => { const r = s => document.querySelector(s)?.getBoundingClientRect(); const q = r('#pRadio'), y = [...document.querySelectorAll('.dapp')].map(e => e.getBoundingClientRect());
    if (!y.length || !y[0].width) return 'nessuna app visibile';
    return `riquadro ${Math.round(q.width)}×${Math.round(q.height)} | ${y.length} app ${Math.round(y[0].width)}×${Math.round(y[0].height)} | file: ${new Set(y.map(e => Math.round(e.top))).size} | vetro: ${getComputedStyle(document.querySelector('#appDock')).backgroundColor}`; });
  await swipe(p, 120); seq.push('giù ' + await state(p));
  await swipe(p, -120); seq.push('su ' + await state(p));
  await swipe(p, -120); seq.push('su ' + await state(p));
  await swipe(p, -120); seq.push('su ' + await state(p));
  await swipe(p, 120); seq.push('giù ' + await state(p));
  let tap = '';
  if (pad) { await swipe(p, 120); await p.click('.dapp[data-app="youtube"]'); await p.waitForTimeout(1200);
    tap = ` | tocco YouTube → ${await p.evaluate(() => document.querySelector('#app').classList.contains('ytopen') ? 'metà alta' : 'niente')}, riquadro ${await state(p)}`; }
  console.log(w, pad ? 'iPad' : 'iPhone', '|', seq.join(' → '), '|', geo + tap, '|', errs.join(' ') || 'ok');
  await ctx.close();
}
await b.close();
