// Verticale (iPhone Air 420×912, barre di sicurezza simulate): barra in fondo con angoli concentrici allo schermo,
// pulsanti quadrati, meteo e radio in due quadrati, cornetta verde nell'angolo in basso a sinistra della mappa, alla stessa distanza dai bordi della freccia
// (i contatti aperti prendono tutto il quadrato), cornetta della barra = cornetta verde
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
  const ic = r('.w-ico'), pc = r('#pContacts'), call = r('#cToggle'), map = r('#pMap'), radio = r('#pRadio');
  const same = document.querySelector('[data-go="contacts"] path').getAttribute('d') === document.querySelector('#cToggle .ico-tel path').getAttribute('d');
  return [`barra: fondo a ${Math.round(innerHeight - rail.bottom)}px dal bordo, alta ${Math.round(rail.height)}, angoli in basso ${cs.borderBottomLeftRadius}/${cs.borderBottomRightRadius}`,
    `pulsanti: ${btns.map(b => Math.round(b.width) + '×' + Math.round(b.height)).join(' ')} | uno dentro l'altro: ${btns.some((b, i) => i && hit(b, btns[i - 1]))}`,
    `meteo: icona ${Math.round(ic.width)}px, centro x ${Math.round((ic.left + ic.right) / 2 - pc.left)}/${Math.round(pc.width)}, y ${Math.round((ic.top + ic.bottom) / 2 - pc.top)}/${Math.round(pc.height)} | tocca testi: ${['.w-city', '.w-date', '.w-temp', '.w-desc', '.w-mm'].some(s => hit(ic, txt(s)))} | tocca cornetta: ${hit(ic, call)}`,
    `quadrati: meteo ${Math.round(pc.width)}×${Math.round(pc.height)}, radio ${Math.round(radio.width)}×${Math.round(radio.height)}`,
    `cornetta verde: dentro ${document.querySelector('#cToggle').parentNode.id}, a ${Math.round(call.left - map.left)}px da sinistra e ${Math.round(map.bottom - call.bottom)}px dal fondo della mappa`,
    (a => `freccia: a ${Math.round(map.right - a.right)}px da destra e ${Math.round(map.bottom - a.bottom)}px dal fondo della mappa`)(r('#fabToggle')),
    `cornetta della barra uguale a quella verde: ${same}`].join('\n'); }), '\n' + (errs.join(' ') || 'no errors'));
await p.click('#cToggle'); await p.waitForTimeout(500); await p.screenshot({ path: 'portrait_open.png' });
console.log(await p.evaluate(() => { const pc = document.querySelector('#pContacts').getBoundingClientRect(), rows = [...document.querySelectorAll('#pContacts .contact')].map(e => e.getBoundingClientRect());
  return `contatti aperti: righe larghe ${rows.map(r => Math.round(r.width)).join('/')} su ${Math.round(pc.width)} | ✕ dentro ${document.querySelector('#cToggle').parentNode.id}`; }));
await p.click('#cToggle'); await p.waitForTimeout(400);
console.log('dopo la ✕:', await p.evaluate(() => document.querySelector('#pContacts').classList.contains('open') ? 'contatti ancora aperti' : 'contatti chiusi'));
await b.close();
