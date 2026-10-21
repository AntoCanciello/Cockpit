// iPad Air 11" (1180×820) e 13" (1366×1024), orizzontale e verticale: la pagina si impagina su ~600 punti di lato corto e iOS la ingrandisce; niente isola
import { chromium } from 'playwright';
import fs from 'node:fs';
const [out = 'ipad.png', W = '1180', H = '820', mode = 'home'] = process.argv.slice(2); const w = +W, h = +H, land = w > h;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: w, height: h }, screen: { width: w, height: h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
const S = Math.min(1.5, Math.max(1.25, Math.min(w, h) / 600));
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
if (mode !== 'home') { await p.click(`[data-go="${mode}"]`); await p.waitForTimeout(600); }
await p.screenshot({ path: out });
console.log(await p.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e) return '-'; const b = e.getBoundingClientRect(); return `${Math.round(b.left)},${Math.round(b.top)} ${Math.round(b.width)}×${Math.round(b.height)}`; };
  return document.getElementById('stage').className + ` | pagina ${innerWidth}×${innerHeight} pad ${JSON.stringify(window.__pad)}\n` + ['#pMap', '#pContacts', '#pRadio', '.rail', '.w-temp', '.st-logo', '.nav-btn'].map(s => s + ' ' + r(s)).join(' | '); }), errs.join(' ') || 'no errors');
await b.close();
