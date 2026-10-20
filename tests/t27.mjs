// Prova di resistenza: 6 minuti di guida simulata a 1 posizione al secondo, con galleria, salti GPS, rete assente, uscita dal percorso, perdita WebGL
import { chromium } from 'playwright';
import fs from 'fs';
const SP = new URL('./', import.meta.url).pathname;
const MDIR = SP + 'node_modules/maplibre-gl/dist/';
const [W, H] = (process.argv[2] || '852x393').split('x').map(Number);
const SECS = +(process.argv[3] || 360);
// percorso a zig-zag di ~15 km: tratti da 500 m alternati nord/est, un punto ogni 20 m
const O = [40.80, 14.20], dLat = 500 / 111000, dLng = 500 / 84300;
const corners = [O]; for (let i = 0; i < 30; i++) { const c = corners[corners.length - 1]; corners.push(i % 2 ? [c[0], c[1] + dLng] : [c[0] + dLat, c[1]]); }
const pts = [], cornerIdx = [];
for (let i = 0; i < corners.length - 1; i++) { cornerIdx.push(pts.length); for (let k = 0; k < 25; k++) pts.push([corners[i][0] + (corners[i + 1][0] - corners[i][0]) * k / 25, corners[i][1] + (corners[i + 1][1] - corners[i][1]) * k / 25]); }
pts.push(corners[corners.length - 1]);
const ttRoute = from => {
  // dal punto del percorso più vicino in avanti (per i ricalcoli)
  let j = 0, bd = Infinity; pts.forEach((p, k) => { const d = Math.hypot(p[0] - from[0], (p[1] - from[1]) * .76); if (d < bd) { bd = d; j = k; } });
  const sub = [from, ...pts.slice(j + 1)];
  const ins = [{ maneuver: 'DEPART', message: 'Parti', street: 'Via Start', pointIndex: 0 }];
  cornerIdx.forEach((ci, n) => { if (n > 0 && ci > j) ins.push({ maneuver: n % 2 ? 'TURN_RIGHT' : 'TURN_LEFT', message: `Svolta ${n % 2 ? 'a destra' : 'a sinistra'} in Via ${n}`, street: `Via ${n}`, pointIndex: ci - j }); });
  ins.push({ maneuver: 'ARRIVE', message: 'Sei arrivato', pointIndex: sub.length - 1 });
  return { routes: [{ summary: { travelTimeInSeconds: Math.round(sub.length * 20 / 14), trafficDelayInSeconds: 60 }, legs: [{ points: sub.map(([latitude, longitude]) => ({ latitude, longitude })) }], guidance: { instructions: ins }, sections: [] }] };
};
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, geolocation: { latitude: O[0], longitude: O[1] }, permissions: ['geolocation'] });
const errs = [], log = [];
let offline = false, routeCalls = 0, tileCalls = 0;
await ctx.addInitScript(() => {
  window.__said = []; window.speechSynthesis.speak = u => window.__said.push([Math.round(performance.now() / 1000), u.text]);
  localStorage.setItem('cockpit.v1', JSON.stringify({ tomtomKey: 'TESTKEY', trafficEp: 'v4' }));
  window.__frames = 0; const f = () => { window.__frames++; requestAnimationFrame(f); }; requestAnimationFrame(f);
  window.__long = 0; window.__longMax = 0;
  try { new PerformanceObserver(l => l.getEntries().forEach(e => { window.__long++; window.__longMax = Math.max(window.__longMax, e.duration); })).observe({ type: 'longtask', buffered: true }); } catch {}
});
await ctx.route('**/*', async route => {
  const u = route.request().url();
  if (u.startsWith('file://')) return route.continue();
  if (u.includes('maplibre-gl.js')) return route.fulfill({ body: fs.readFileSync(MDIR + 'maplibre-gl.js'), contentType: 'application/javascript' });
  if (u.includes('maplibre-gl.css')) return route.fulfill({ body: fs.readFileSync(MDIR + 'maplibre-gl.css'), contentType: 'text/css' });
  if (offline) return route.abort('internetdisconnected');
  const cors = { 'access-control-allow-origin': '*' };
  if (u.includes('/traffic/map/')) { tileCalls++; return route.fulfill({ body: fs.readFileSync(SP + 'traffic.png'), contentType: 'image/png', headers: cors }); }
  if (u.includes('/map/1/tile/') || u.includes('tile.openstreetmap')) { tileCalls++; return route.fulfill({ body: fs.readFileSync(SP + 'tile.png'), contentType: 'image/png', headers: cors }); }
  if (u.includes('calculateRoute')) { routeCalls++; const m = u.match(/calculateRoute\/([\d.]+),([\d.]+):/); return route.fulfill({ json: ttRoute([+m[1], +m[2]]), headers: cors }); }
  if (u.includes('nominatim')) return route.fulfill({ json: [{ name: 'Arrivo', display_name: 'Arrivo, Napoli', lat: String(pts.at(-1)[0]), lon: String(pts.at(-1)[1]) }], headers: cors });
  return route.abort();
});
const p = await ctx.newPage();
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type() === 'error' && !/file:\/\/|ERR_|Failed to load/.test(m.text())) errs.push('console: ' + m.text()); });
await p.goto(new URL('../index.html', import.meta.url).href);
await p.waitForTimeout(3500);
await p.evaluate(() => document.querySelector('[data-go="map"]').click()); await p.waitForTimeout(500);
await p.click('#openSearch'); await p.fill('#q', 'Arrivo'); await p.press('#q', 'Enter'); await p.waitForTimeout(500);
await p.click('.result'); await p.waitForTimeout(1500);
await p.click('#destGo'); await p.waitForTimeout(800);

const snap = () => p.evaluate(() => {
  const me = document.querySelector('.me-nav')?.getBoundingClientRect(), mp = document.querySelector('#map').getBoundingClientRect();
  const needle = document.querySelector('#compassNeedle').style.transform;
  return { frames: window.__frames, long: window.__long, longMax: Math.round(window.__longMax), heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : 0,
    dist: document.querySelector('#navDist').textContent, street: document.querySelector('#navStreet').textContent, min: document.querySelector('#navMin').textContent,
    banner: !document.querySelector('#navBanner').hidden, gpsToast: !document.querySelector('#gpsToast').hidden,
    meX: me ? Math.round(me.x + me.width / 2 - mp.x) : null, meY: me ? Math.round(me.y + me.height / 2 - mp.y) : null,
    bearing: needle ? -parseFloat(needle.match(/-?[\d.]+/)?.[0] || 0) : null, nodes: document.getElementsByTagName('*').length, markers: document.querySelectorAll('.maplibregl-marker').length };
});
// guida: 14 m/s lungo il percorso
const along = s => { const idx = Math.min(pts.length - 1, s / 20); const k = Math.floor(idx), f = idx - k; const a = pts[k], c = pts[Math.min(k + 1, pts.length - 1)]; return [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f]; };
let s = 0, prev = await snap(), stopBearings = [];
const t0 = Date.now();
for (let t = 1; t <= SECS; t++) {
  const phase = t % 360;
  let v = 14; if (phase >= 300 && phase < 330) v = 0; // fermo al semaforo
  s += v;
  let [lat, lng] = along(s);
  let send = true;
  if (phase >= 60 && phase < 90) send = false;                         // galleria: niente GPS per 30 s
  if (phase === 120) lat += 400 / 111000;                              // un salto GPS di 400 m
  if (phase >= 150 && phase < 170) { lat += (Math.random() - .5) * 30 / 111000; lng += (Math.random() - .5) * 30 / 84300; } // segnale sporco
  if (phase === 200) offline = true;                                   // rete assente per 60 s
  if (phase === 260) offline = false;
  if (phase >= 210 && phase < 235) lng += (phase - 205) * 25 / 84300;  // esco dal percorso (senza rete)
  if (phase >= 300 && phase < 330) { lat += (Math.random() - .5) * 8 / 111000; lng += (Math.random() - .5) * 8 / 84300; } // fermo: il GPS balla
  if (phase === 280) await p.evaluate(() => { const c = document.querySelector('#map canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl'); const ext = gl.getExtension('WEBGL_lose_context'); ext.loseContext(); setTimeout(() => ext.restoreContext(), 1500); });
  if (send) await ctx.setGeolocation({ latitude: lat, longitude: lng, accuracy: 8 });
  const wait = t0 + t * 1000 - Date.now(); if (wait > 0) await p.waitForTimeout(wait);
  if (phase >= 305 && phase < 330) stopBearings.push((await snap()).bearing);
  if (t % 10 === 0) {
    const n = await snap();
    log.push(`${String(t).padStart(3)}s fps ${((n.frames - prev.frames) / 10).toFixed(0).padStart(3)} | lunghi ${n.long - prev.long} (max ${n.longMax}ms) | heap ${n.heap}MB nodi ${n.nodes} marker ${n.markers} | ${n.banner ? `${n.dist} → ${n.street} · ${n.min}` : 'BANNER NASCOSTO'}${n.gpsToast ? ' | AVVISO GPS' : ''} | freccia ${n.meX},${n.meY} | rotta ${Math.round(n.bearing)}°${offline ? ' | OFFLINE' : ''}`);
    prev = n;
  }
  if (t % 120 === 0) await p.screenshot({ path: SP + `st-${t}.png` });
}
console.log(log.join('\n'));
const bs = stopBearings.filter(x => x != null);
console.log('fermo al semaforo: rotazione mappa min/max', Math.min(...bs), Math.max(...bs));
console.log('chiamate percorso:', routeCalls, '| riquadri:', tileCalls);
console.log('voce:', JSON.stringify(await p.evaluate(() => window.__said)));
console.log('mappa base ancora TomTom?', await p.evaluate(() => !JSON.parse(localStorage.getItem('cockpit.v1')).tomtomKeyMapFail));
console.log(errs.join('\n') || 'nessun errore');
await b.close();
