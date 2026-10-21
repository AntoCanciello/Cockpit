// iPad Air 11" (schermo 820×1180): la pagina si impagina su ~600 punti di lato corto e iOS la ingrandisce (×1,37);
// niente isola. Prova home, contatti, impostazioni, ricerca, matita in orizzontale e rotazione. Screenshot ipad_*.png
import { chromium } from 'playwright';
import fs from 'node:fs';
const S0 = './'; // screenshot ipad_*.png qui accanto
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const [w, h] of [[1180, 820], [820, 1180]]) {
  const land = w > h, S = Math.min(1.5, Math.max(1.25, Math.min(w, h) / 600));
  const ctx = await b.newContext({ viewport: { width: w, height: h }, screen: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  await ctx.addInitScript(l => { Object.defineProperty(screen, 'orientation', { value: { angle: l ? 90 : 0, type: l ? 'landscape-primary' : 'portrait-primary', addEventListener() {} }, configurable: true }); window.orientation = l ? 90 : 0;
    localStorage.setItem('cockpit.v1', JSON.stringify({ glass: 'glass-light', wall: 'aurora', contacts: [{ name: 'Mamma', phone: '3331112222', mode: 'wa' }, { name: 'Moglie', phone: '3334445555', mode: 'wa' }, { name: 'Ufficio', phone: '0811234567', mode: 'tel' }], radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true }));
    localStorage.setItem('cockpit.lastpos', JSON.stringify({ lat: 40.85, lng: 14.22, t: Date.now() })); }, land);
  await ctx.route('**/*', r => { const u = r.request().url();
    if (u.startsWith('file://') && u.endsWith('index.html')) return r.fulfill({ contentType: 'text/html', body: fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8').replaceAll('env(safe-area-inset-top, 0px)', (24 / S).toFixed(1) + 'px').replaceAll('env(safe-area-inset-bottom, 0px)', (20 / S).toFixed(1) + 'px') });
    if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
    if (u.includes('open-meteo')) return r.fulfill({ json: { current: { temperature_2m: 19, weather_code: 2, is_day: 0 }, daily: { temperature_2m_max: [21], temperature_2m_min: [18] } }, headers: { 'access-control-allow-origin': '*' } });
    if (u.includes('nominatim')) return r.fulfill({ json: { address: { city: 'Napoli' } }, headers: { 'access-control-allow-origin': '*' } });
    return r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(w / 2, 200); await p.waitForTimeout(400);
  await p.screenshot({ path: S0 + `ipad_${land ? 'L' : 'P'}_home.png` });
  const tag = land ? 'L' : 'P';
  if (land) { // matita: entra in modifica e trascina il divisorio di 70 px (in punti della pagina) verso sinistra
    await p.click('#editPen'); await p.waitForTimeout(500);
    const hb = await p.locator('#editHandle').boundingBox(); const before = (await p.locator('#pContacts').boundingBox()).width;
    const cx = hb.x + hb.width / 2, cy = hb.y + hb.height / 2;
    await p.mouse.move(cx, cy); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(cx - 7 * i, cy); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(400);
    const after = (await p.locator('#pContacts').boundingBox()).width;
    console.log('matita: colonna', Math.round(before), '→', Math.round(after), '(trascinati 70)');
    await p.screenshot({ path: S0 + 'ipad_L_matita.png' }); await p.click('#editPen'); await p.waitForTimeout(400);
  }
  await p.click('#cToggle'); await p.waitForTimeout(1000); await p.screenshot({ path: S0 + `ipad_${tag}_contatti.png` }); await p.click('#cToggle'); await p.waitForTimeout(500);
  await p.click('#openSettings'); await p.waitForTimeout(700); await p.screenshot({ path: S0 + `ipad_${tag}_impostazioni.png` });
  console.log(tag, 'info:', await p.evaluate(() => document.getElementById('screenInfo').textContent.split(' · ').filter(x => /iPad|finestra/.test(x)).join(' · ')));
  await p.click('#settingsSheet [data-close]'); await p.waitForTimeout(600);
  await p.click('#openSearch'); await p.waitForTimeout(700); await p.screenshot({ path: S0 + `ipad_${tag}_cerca.png` }); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  console.log(tag, errs.join(' ') || 'no errors', '| diario:', await p.evaluate(() => (localStorage.getItem('cockpit.diag') || '').match(/ipad:[^"]*/g)?.slice(-1)[0]));
  await ctx.close();
}
{
const ctx = await b.newContext({ viewport: { width: 1180, height: 820 }, screen: { width: 820, height: 1180 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
await ctx.route('**/*', r => { const u = r.request().url(); return (u.startsWith('file://') || u.startsWith('data:')) ? r.continue() : r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3000);
const st = () => p.evaluate(() => `${innerWidth}×${innerHeight} ${document.getElementById('stage').className} k=${window.__pad.k().toFixed(2)} meta=${document.getElementById('vp').content}`);
console.log('orizzontale:', await st());
for (const [w, h, lab] of [[820, 1180, 'verticale'], [1180, 820, 'di nuovo orizzontale']]) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(1200); console.log(lab + ':', await st()); }
console.log(errs.join(' ') || 'no errors'); 
}
await b.close();
