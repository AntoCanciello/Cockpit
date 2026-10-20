import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const C = (n, p) => ({ name: n, phone: p, shortcut: '', mode: 'wa' });
for (const [lab, angle, lefty, mode] of [['l-norm', 90, false, 'home'], ['l-lefty', 90, true, 'home'], ['r-lefty', 270, true, 'home'], ['l-lefty-map', 90, true, 'map'], ['r-lefty-map', 270, true, 'map']]) {
  const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, deviceScaleFactor: 2 });
  const cfg = JSON.stringify({ glass: 'glass-light', wall: 'aurora', lefty, radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true, contacts: [C('Babbo', '3331'), C('Mamma', '3332'), C('Chiara', '3333')] });
  await ctx.addInitScript(([a, c]) => { Object.defineProperty(screen, 'orientation', { value: { angle: a, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = a;
    localStorage.setItem('cockpit.v1', c); }, [angle, cfg]);
  await ctx.route('**/*', r => r.request().url().startsWith('file://') || r.request().url().startsWith('data:') ? r.continue() : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(456, 60); await p.waitForTimeout(400);
  if (mode !== 'home') { await p.evaluate(m => document.querySelector(`[data-go="${m}"]`).click(), mode); await p.waitForTimeout(600); }
  await p.screenshot({ path: `lefty_${lab}.png` });
  console.log(lab, await p.evaluate(() => { const r = e => { const x = document.querySelector(e).getBoundingClientRect(); return Math.round(x.left) + '-' + Math.round(x.right); }; const cs = e => getComputedStyle(document.querySelector(e));
    return `stage ${document.getElementById('stage').className} | rail ${r('.rail')} | map ${r('#pMap')} | contatti ${r('#pContacts')} | raggi rail ${cs('.rail').borderTopLeftRadius}/${cs('.rail').borderTopRightRadius} contatti ${cs('#pContacts').borderTopLeftRadius}/${cs('#pContacts').borderTopRightRadius}`; }), errs.join(' ') || '');
  await ctx.close();
}
await b.close();
