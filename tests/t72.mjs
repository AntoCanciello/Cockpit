import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, screen: { width: 912, height: 420 }, deviceScaleFactor: 2 });
const cfg = JSON.stringify({ glass: 'glass-light', wall: 'aurora', lefty: true, radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true });
await ctx.addInitScript(([c]) => { Object.defineProperty(screen, 'orientation', { value: { angle: 90, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = 90; localStorage.setItem('cockpit.v1', c); }, [cfg]);
await ctx.route('**/*', r => r.request().url().startsWith('file://') || r.request().url().startsWith('data:') ? r.continue() : r.abort());
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(456, 60);
await p.evaluate(() => { document.getElementById('islProbe').style.width = '68px'; dispatchEvent(new Event('resize')); }); await p.waitForTimeout(500);
// cambi di schermata rapidi, poi controllo che forma e contorno coincidano con il riquadro
const check = async lbl => console.log(lbl, await p.evaluate(() => [...document.querySelectorAll('.isl-t')].map(el => {
  const r = el.getBoundingClientRect(), l = el.querySelector('.isl-line').getBoundingClientRect();
  return `${el.id || 'rail'} riquadro ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} contorno ${Math.round(l.left)},${Math.round(l.top)} ${Math.round(l.width)}x${Math.round(l.height)}`; }).join(' | ')));
for (const m of ['map', 'home', 'radio', 'home', 'contacts', 'home']) { await p.evaluate(m => document.querySelector(`[data-go="${m}"]`).click(), m); await p.waitForTimeout(80); }
await check('subito:'); await p.screenshot({ path: 'switch_fast.png' });
await p.waitForTimeout(600); await check('dopo:'); await p.screenshot({ path: 'switch_after.png' });
console.log(errs.join(' ') || 'no errors'); await b.close();
