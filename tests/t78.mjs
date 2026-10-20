import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const [lab, lefty] of [['mancino', true], ['normale', false]]) {
  const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, screen: { width: 912, height: 420 }, deviceScaleFactor: 2 });
  const cfg = JSON.stringify({ glass: 'glass-light', wall: 'aurora', lefty, radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true });
  await ctx.addInitScript(([c]) => { Object.defineProperty(screen, 'orientation', { value: { angle: 90, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = 90; if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('cockpit.v1', c); } }, [cfg]);
  await ctx.route('**/*', r => r.request().url().startsWith('file://') || r.request().url().startsWith('data:') ? r.continue() : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const go = async () => { await p.waitForTimeout(3000); await p.mouse.click(456, 60); await p.evaluate(() => { const s = document.getElementById('islProbe').style; s.width = '68px'; dispatchEvent(new Event('resize')); }); await p.waitForTimeout(500); };
  await p.goto(new URL('../index.html', import.meta.url).href); await go();
  const w = () => p.evaluate(() => Math.round(document.getElementById('pContacts').offsetWidth) + ' / mappa ' + Math.round(document.getElementById('pMap').offsetWidth));
  console.log(lab, 'iniziale:', await w());
  await p.click('#editPen'); await p.waitForTimeout(400);
  const hb = await p.locator('#editHandle').boundingBox();
  console.log('  maniglia', hb && `${Math.round(hb.x + hb.width / 2)} x ${Math.round(hb.height)}h`, '| reset visibile', await p.isVisible('#editReset'));
  await p.screenshot({ path: `edit_${lab}_1.png` });
  // trascina di 70 px verso la mappa
  const cx = hb.x + hb.width / 2, cy = hb.y + hb.height / 2, dir = lefty ? 1 : -1;
  await p.mouse.move(cx, cy); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(cx + dir * 7 * i, cy); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(300);
  console.log('  dopo trascinamento:', await w(), '| salvato', await p.evaluate(() => JSON.parse(localStorage.getItem('cockpit.v1')).sideW));
  await p.screenshot({ path: `edit_${lab}_2.png` });
  await p.click('#editPen'); await p.waitForTimeout(400);
  console.log('  fine modifica: maniglia visibile', await p.isVisible('#editHandle'));
  await p.reload(); await go(); console.log('  dopo riavvio:', await w());
  await p.click('#editPen'); await p.waitForTimeout(300); await p.click('#editReset'); await p.waitForTimeout(600);
  console.log('  dopo ripristino:', await w(), '| salvato', await p.evaluate(() => JSON.parse(localStorage.getItem('cockpit.v1')).sideW));
  console.log('  ' + (errs.join(' ') || 'no errors'));
  await ctx.close();
}
await b.close();
