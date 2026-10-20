import { chromium } from 'playwright';
import fs from 'fs';
const SP = new URL('./', import.meta.url).pathname;
const MDIR = SP + 'node_modules/maplibre-gl/dist/';
const [W, H] = (process.argv[2] || '393x852').split('x').map(Number);
const SAT = process.argv[3] === 'sat';
// percorsi finti: punti ogni ~40 m
const line = (...corners) => {
  const out = [];
  for (let i = 0; i < corners.length - 1; i++) {
    const [a, b] = [corners[i], corners[i + 1]];
    const n = Math.max(1, Math.round(Math.hypot((b[0] - a[0]) * 111000, (b[1] - a[1]) * 84000) / 40));
    for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
  }
  out.push(corners[corners.length - 1]);
  return out;
};
const A = [40.8400, 14.2500], B = [40.8580, 14.2500], C = [40.8580, 14.2650];
const routes = [
  { pts: line(A, B, C), time: 840, delay: 320, turnAt: null },
  { pts: line(A, [40.8400, 14.2650], C), time: 1020, delay: 0 },
  { pts: line(A, [40.8490, 14.2420], [40.8650, 14.2560], C), time: 1180, delay: 900 }
];
const tt = { routes: routes.map(r => {
  const turn = r.pts.findIndex((p, i) => i > 0 && i < r.pts.length - 1 && (p[0] !== r.pts[i - 1][0]) !== (p[0] !== r.pts[i + 1][0]));
  const t = turn > 0 ? turn : Math.floor(r.pts.length / 2);
  return {
    summary: { travelTimeInSeconds: r.time, trafficDelayInSeconds: r.delay },
    legs: [{ points: r.pts.map(([latitude, longitude]) => ({ latitude, longitude })) }],
    guidance: { instructions: [
      { maneuver: 'DEPART', message: 'Parti su Via Toledo', street: 'Via Toledo', pointIndex: 0 },
      { maneuver: 'TURN_RIGHT', message: 'Svolta a destra in Via Solferino', street: 'Via Solferino', pointIndex: t },
      { maneuver: 'TURN_LEFT', message: 'Svolta a sinistra in Via Roma', street: 'Via Roma', pointIndex: Math.min(t + 10, r.pts.length - 2) },
      { maneuver: 'ARRIVE', message: 'Sei arrivato', pointIndex: r.pts.length - 1 }
    ] },
    sections: r.delay ? [{ sectionType: 'TRAFFIC', startPointIndex: 10, endPointIndex: 25, magnitudeOfDelay: 3 }] : []
  };
}) };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, geolocation: { latitude: A[0], longitude: A[1] }, permissions: ['geolocation'] });
const errs = [], calls = [];
await ctx.addInitScript(sat => {
  window.__said = [];
  window.speechSynthesis.speak = u => window.__said.push(u.text);
  if (!localStorage.getItem('cockpit.v1')) localStorage.setItem('cockpit.v1', JSON.stringify({ tomtomKey: 'TESTKEY', trafficEp: 'v4', satellite: sat }));
}, SAT);
await ctx.route('**/*', async route => {
  const u = route.request().url();
  if (u.startsWith('file://')) return route.continue();
  calls.push(u.split('?')[0].replace(/\/\d+\/\d+\/\d+/, '/z/x/y'));
  if (u.includes('maplibre-gl.js')) return route.fulfill({ body: fs.readFileSync(MDIR + 'maplibre-gl.js'), contentType: 'application/javascript' });
  if (u.includes('maplibre-gl.css')) return route.fulfill({ body: fs.readFileSync(MDIR + 'maplibre-gl.css'), contentType: 'text/css' });
  const cors = { 'access-control-allow-origin': '*' };
  if (u.includes('/traffic/map/')) return route.fulfill({ body: fs.readFileSync(SP + 'traffic.png'), contentType: 'image/png', headers: cors });
  if (u.includes('/map/1/tile/') || u.includes('tile.openstreetmap')) return route.fulfill({ body: fs.readFileSync(SP + 'tile.png'), contentType: u.includes('.jpg') ? 'image/png' : 'image/png', headers: cors });
  if (u.includes('calculateRoute')) return route.fulfill({ json: u.includes('maxAlternatives') ? tt : { routes: [tt.routes[0]] }, headers: cors });
  if (u.includes('nominatim')) return route.fulfill({ json: [{ name: 'Piazza Garibaldi', display_name: 'Piazza Garibaldi, Napoli, Campania, Italia', lat: String(C[0]), lon: String(C[1]) }], headers: cors });
  return route.abort();
});
const p = await ctx.newPage();
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
await p.goto(new URL('../index.html', import.meta.url).href);
await p.waitForTimeout(3500);
await p.evaluate(() => document.querySelector('[data-go="map"]').click()); await p.waitForTimeout(600);
await p.screenshot({ path: SP + `gl0-${W}.png` });console.log('layers:', await p.evaluate(() => [...document.querySelectorAll('#settingsSheet #sSat')].length)); console.log('early errs:', errs.filter(e => !e.includes('file://')));
await p.click('#openSearch'); await p.fill('#q', 'Garibaldi'); await p.press('#q', 'Enter'); await p.waitForTimeout(500);
await p.click('.result'); await p.waitForTimeout(1600);
console.log('pill:', await p.textContent('#destInfo'), '| bubbles:', await p.$$eval('.rt-bubble', els => els.map(e => e.textContent + (e.classList.contains('sel') ? '*' : ''))));
await p.screenshot({ path: SP + `gl1-preview-${W}.png` });
await p.evaluate(() => document.querySelector('.rt-bubble:not(.sel)').click()); await p.waitForTimeout(500);
console.log('after pick:', await p.textContent('#destInfo'), await p.$$eval('.rt-bubble', els => els.map(e => e.textContent + (e.classList.contains('sel') ? '*' : ''))));
await p.evaluate(() => [...document.querySelectorAll('.rt-bubble')].find(e => e.textContent.startsWith('14')).click()); await p.waitForTimeout(400);
await p.click('#destGo'); await p.waitForTimeout(400);
const state = async lbl => console.log(lbl, '|', await p.isHidden('#navBanner') ? 'banner hidden' : [await p.textContent('#navDist'), await p.textContent('#navToward'), await p.textContent('#navStreet'), (await p.isHidden('#navNext')) ? '' : 'Poi'].join(' / '),
  '| card:', await p.textContent('#navMin'), await p.getAttribute('#navMin', 'class'), await p.textContent('#navLeft'),
  '| cam:', await p.evaluate(() => { const m = document.querySelector('#map'); return 'ok'; }));
let cur = [A[0], A[1]];
// avanza a passi di ~20 m ogni 0,4 s (come un mezzo a 50 km/h circa, accelerato)
const go = async (lat, lng, lbl) => {
  const n = Math.max(1, Math.round(Math.hypot((lat - cur[0]) * 111000, (lng - cur[1]) * 84000) / 20));
  for (let k = 1; k <= n; k++) { await ctx.setGeolocation({ latitude: cur[0] + (lat - cur[0]) * k / n, longitude: cur[1] + (lng - cur[1]) * k / n }); await p.waitForTimeout(400); }
  cur = [lat, lng]; await p.waitForTimeout(1000); await state(lbl);
};
await go(40.8410, 14.2500, 'start');
await go(40.8440, 14.2500, 'moving');
await go(40.8470, 14.2500, 'moving2');
await p.screenshot({ path: SP + `gl2-nav-${W}.png` });
await go(40.8560, 14.2500, 'near turn');
await p.screenshot({ path: SP + `gl3-turn-${W}.png` });
await p.evaluate(() => document.querySelector('#compassBtn').click()); await p.waitForTimeout(1200);
await p.screenshot({ path: SP + `gl4-north-${W}.png` });
await go(40.8580, 14.2540, 'after turn'); await go(40.8580, 14.2555, 'east'); await p.screenshot({ path: SP + `gl5-east-${W}.png` }); await p.evaluate(() => document.querySelector('#compassBtn').click()); await p.waitForTimeout(1200); await p.screenshot({ path: SP + `gl6-headup-${W}.png` }); await p.evaluate(() => document.querySelector('[data-go="home"]')?.click()); await p.waitForTimeout(800); await p.screenshot({ path: SP + `gl7-home-${W}.png` });
await go(40.8580, 14.2649, 'arrived');
console.log('said:', await p.evaluate(() => window.__said));
console.log('calls:', [...new Set(calls)].join('\n  '));
console.log(errs.join('\n') || 'no errors');
await b.close();
