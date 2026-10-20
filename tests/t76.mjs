import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const C = (n, p) => ({ name: n, phone: p, shortcut: '', mode: 'wa' });
for (const [lab, angle, lefty] of [['ml', 90, true], ['nl', 90, false], ['nr', 270, false]]) {
  const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, screen: { width: 912, height: 420 }, deviceScaleFactor: 2 });
  const cfg = JSON.stringify({ glass: 'glass-light', wall: 'aurora', lefty, radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true, contacts: [C('Babbo', '3331'), C('Mamma', '3332'), C('Chiara', '3333')] });
  await ctx.addInitScript(([a, c]) => { Object.defineProperty(screen, 'orientation', { value: { angle: a, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = a; localStorage.setItem('cockpit.v1', c); }, [angle, cfg]);
  await ctx.route('**/*', r => r.request().url().startsWith('file://') || r.request().url().startsWith('data:') ? r.continue() : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(456, 60);
  await p.evaluate(a => { document.getElementById('islProbe').style[a === 90 ? 'width' : 'paddingRight'] = '68px'; dispatchEvent(new Event('resize')); }, angle); await p.waitForTimeout(600);
  const where = () => p.evaluate(() => { const c = document.getElementById('cToggle'), r = c.getBoundingClientRect(); return `${c.parentNode.id} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}px`; });
  console.log(lab, 'telefono:', await where());
  await p.screenshot({ path: `phone_${lab}_chiuso.png` });
  await p.evaluate(() => document.getElementById('cToggle').click()); await p.waitForTimeout(900);
  console.log('  aperto:', await p.evaluate(() => document.getElementById('pContacts').classList.contains('open')), await where(), '| nomi:', await p.evaluate(() => [...document.querySelectorAll('#cList .name')].map(n => n.clientWidth + '/' + n.scrollWidth).join(' ')));
  await p.screenshot({ path: `phone_${lab}_aperto.png` });
  await p.evaluate(() => document.getElementById('cToggle').click()); await p.waitForTimeout(500);
  console.log('  richiuso:', !(await p.evaluate(() => document.getElementById('pContacts').classList.contains('open'))), errs.join(' ') || 'no errors');
  await ctx.close();
}
await b.close();
