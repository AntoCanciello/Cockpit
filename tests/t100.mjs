// iPad: pannello delle app nella mappa (1/3 × 1/4 della mappa, 2 file da 3, sopra la cornetta in verticale); sull'iPhone non c'è
import { chromium } from 'playwright';
const S0 = process.env.OUT || './'; // screenshot dock_*.png
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const [w, h, pad] of [[820, 1180, 1], [1180, 820, 1], [420, 912, 0]]) {
  const ctx = await b.newContext(pad ? { viewport: { width: w, height: h }, screen: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, userAgent: IPAD } : { viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('cockpit.lastpos', JSON.stringify({ lat: 40.75, lng: 14.45, t: Date.now() })));
  const nav = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (/^youtube:|youtube\.com/.test(u)) nav.push(u); return (u.startsWith('file://') || u.startsWith('data:')) ? r.continue() : r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('framenavigated', f => { if (/^youtube:/.test(f.url())) nav.push(f.url()); }); ctx.on('page', np => nav.push('nuova finestra ' + np.url()));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(w / 2, 200); await p.waitForTimeout(400);
  await p.screenshot({ path: S0 + `dock_${w}.png` });
  console.log(w, await p.evaluate(() => { const r = s => document.querySelector(s)?.getBoundingClientRect(); const m = r('#pMap'), d = r('#appDock'), c = r('#cToggle'), y = r('.dapp');
    if (!d || !d.width) return 'pannello nascosto';
    return `mappa ${Math.round(m.width)}×${Math.round(m.height)} | pannello ${Math.round(d.width)}×${Math.round(d.height)} (${(d.width / m.width).toFixed(2)} × ${(d.height / m.height).toFixed(2)}) a ${Math.round(d.left - m.left)} da sinistra, ${Math.round(m.bottom - d.bottom)} dal fondo | cornetta sotto a ${c && c.width ? Math.round(d.bottom - c.top) : '-'} | YouTube ${Math.round(y.width)}×${Math.round(y.height)}`; }));
  if (pad) { await p.click('.dapp'); await p.waitForTimeout(1800); console.log('  tocco YouTube →', nav.join(' , ') || 'niente', errs.join(' ') || 'ok'); }
  await ctx.close();
}
await b.close();
