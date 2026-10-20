import { chromium } from 'playwright';
import fs from 'fs';
const SP = new URL('./', import.meta.url).pathname;
const MDIR = SP + 'node_modules/maplibre-gl/dist/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ignoreDefaultArgs: ['--headless=old'] });
for (const [W, H] of [[932, 430], [844, 390], [393, 852]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, geolocation: { latitude: 40.75, longitude: 14.45 }, permissions: ['geolocation'] });
  await ctx.addInitScript(() => localStorage.setItem('cockpit.v1', JSON.stringify({ contacts: [
    { name: 'Fransi', phone: '+39 333 1111111', shortcut: '', mode: 'wa' }, { name: 'Piero', phone: '+39 333 2222222', shortcut: '', mode: 'wa' }, { name: 'Babbo', phone: '+39 333 3333333', shortcut: '', mode: 'wa' }] })));
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://')) return r.continue();
    if (u.includes('maplibre-gl.js')) return r.fulfill({ body: fs.readFileSync(MDIR + 'maplibre-gl.js'), contentType: 'application/javascript' });
    if (u.includes('maplibre-gl.css')) return r.fulfill({ body: fs.readFileSync(MDIR + 'maplibre-gl.css'), contentType: 'text/css' });
    if (u.includes('tile.openstreetmap')) return r.fulfill({ body: fs.readFileSync(SP + 'tile.png'), contentType: 'image/png', headers: { 'access-control-allow-origin': '*' } });
    return r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3800);
  const box = () => p.evaluate(() => { const r = document.querySelector('#pContacts').getBoundingClientRect(), q = document.querySelector('#pRadio').getBoundingClientRect(); return `contatti ${Math.round(r.width)}x${Math.round(r.height)} radio ${Math.round(q.width)}x${Math.round(q.height)}`; });
  console.log(W, 'chiuso:', await box());
  await p.screenshot({ path: SP + `ct-closed-${W}.png` });
  await p.click('#cToggle'); await p.waitForTimeout(300);
  console.log(W, 'aperto:', await box(), '| righe visibili:', await p.$$eval('#pContacts .clist > .contact', els => els.filter(e => getComputedStyle(e).visibility === 'visible').length));
  await p.screenshot({ path: SP + `ct-open-${W}.png` });
  await p.waitForTimeout(10500);
  console.log(W, 'dopo 10,5 s aperto?', await p.evaluate(() => document.querySelector('#pContacts').classList.contains('open')));
  await p.evaluate(() => document.querySelector('[data-go="contacts"]').click()); await p.waitForTimeout(400);
  console.log(W, 'schermata Contatti: righe visibili', await p.$$eval('#pContacts .clist > .contact', els => els.filter(e => getComputedStyle(e).visibility === 'visible').length), '| pulsante visibile?', await p.isVisible('#cToggle'));
  console.log(errs.join('\n') || 'no errors');
  await ctx.close();
}
await b.close();
