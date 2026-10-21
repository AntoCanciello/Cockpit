// Verticale (iPhone Air 420×912, barre di sicurezza simulate): barra in fondo con angoli concentrici allo schermo,
// pulsanti quadrati, icona del meteo grande e verso il centro senza toccare i testi, cornetta della barra = cornetta verde
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: 420, height: 912 }, screen: { width: 420, height: 912 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => { Object.defineProperty(screen, 'orientation', { value: { angle: 0, type: 'portrait-primary', addEventListener() {} }, configurable: true }); window.orientation = 0;
  localStorage.setItem('cockpit.v1', JSON.stringify({ glass: 'glass-light', wall: 'aurora', contacts: [{ name: 'Mamma', phone: '3331112222', mode: 'wa' }, { name: 'Moglie', phone: '3334445555', mode: 'wa' }, { name: 'Ufficio', phone: '0811234567', mode: 'tel' }], radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true }));
  localStorage.setItem('cockpit.lastpos', JSON.stringify({ lat: 40.85, lng: 14.22, t: Date.now() })); });
await ctx.route('**/*', r => { const u = r.request().url();
  // in Chromium env() vale 0: mettiamo i margini veri dell'iPhone in verticale
  if (u.startsWith('file://') && u.endsWith('index.html')) return r.fulfill({ contentType: 'text/html', body: fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8').replaceAll('env(safe-area-inset-top, 0px)', '68px').replaceAll('env(safe-area-inset-bottom, 0px)', '34px') });
  if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
  if (u.includes('open-meteo')) return r.fulfill({ json: { current: { temperature_2m: 19, weather_code: 2, is_day: 0 }, daily: { temperature_2m_max: [21], temperature_2m_min: [18] } }, headers: { 'access-control-allow-origin': '*' } });
  if (u.includes('nominatim')) return r.fulfill({ json: { address: { city: 'Napoli' } }, headers: { 'access-control-allow-origin': '*' } });
  return r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(210, 400); await p.waitForTimeout(400);
await p.screenshot({ path: 'portrait.png' });
console.log(await p.evaluate(() => {
  const r = s => document.querySelector(s).getBoundingClientRect(), rail = r('.rail'), cs = getComputedStyle(document.querySelector('.rail'));
  const btns = [...document.querySelectorAll('.rail .nav-btn')].map(e => e.getBoundingClientRect());
  const hit = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
  const txt = s => { const rg = document.createRange(); rg.selectNodeContents(document.querySelector(s)); return rg.getBoundingClientRect(); };
  const ic = r('.w-ico'), pc = r('#pContacts'), call = r('#cToggle');
  const same = document.querySelector('[data-go="contacts"] path').getAttribute('d') === document.querySelector('#cToggle .ico-tel path').getAttribute('d');
  return [`barra: fondo a ${Math.round(innerHeight - rail.bottom)}px dal bordo, alta ${Math.round(rail.height)}, angoli in basso ${cs.borderBottomLeftRadius}/${cs.borderBottomRightRadius}`,
    `pulsanti: ${btns.map(b => Math.round(b.width) + '×' + Math.round(b.height)).join(' ')} | uno dentro l'altro: ${btns.some((b, i) => i && hit(b, btns[i - 1]))}`,
    `meteo: icona ${Math.round(ic.width)}px, centro x ${Math.round((ic.left + ic.right) / 2 - pc.left)}/${Math.round(pc.width)}, y ${Math.round((ic.top + ic.bottom) / 2 - pc.top)}/${Math.round(pc.height)} | tocca testi: ${['.w-city', '.w-date', '.w-temp', '.w-desc', '.w-mm'].some(s => hit(ic, txt(s)))} | tocca cornetta: ${hit(ic, call)}`,
    `cornetta della barra uguale a quella verde: ${same}`].join('\n'); }), '\n' + (errs.join(' ') || 'no errors'));
await b.close();
