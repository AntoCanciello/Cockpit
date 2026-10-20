import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, screen: { width: 912, height: 420 }, deviceScaleFactor: 2 });
// meteo finto per vedere la pagina piena
const cfg = JSON.stringify({ glass: 'glass-light', wall: 'aurora', lefty: true, radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true });
await ctx.addInitScript(([c]) => { Object.defineProperty(screen, 'orientation', { value: { angle: 90, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = 90; localStorage.setItem('cockpit.v1', c);
  localStorage.setItem('cockpit.lastpos', JSON.stringify({ lat: 40.75, lng: 14.45, t: Date.now() })); }, [cfg]);
await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
  if (u.includes('open-meteo')) return r.fulfill({ json: { current: { temperature_2m: 24, weather_code: 2, is_day: 1 }, daily: { temperature_2m_max: [24], temperature_2m_min: [15] } }, headers: { 'access-control-allow-origin': '*' } });
  if (u.includes('nominatim')) return r.fulfill({ json: { address: { town: 'Torre Annunziata' } }, headers: { 'access-control-allow-origin': '*' } });
  return r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(456, 60);
await p.evaluate(() => { document.getElementById('islProbe').style.width = '68px'; dispatchEvent(new Event('resize')); }); await p.waitForTimeout(600);
for (const [lab, w] of [['stretto', 170], ['normale', null], ['largo', 420]]) {
  await p.evaluate(w => { const st = document.getElementById('stage'); if (w) st.style.setProperty('--side-col', w + 'px'); else st.style.removeProperty('--side-col'); dispatchEvent(new Event('resize')); }, w);
  await p.waitForTimeout(500);
  await p.screenshot({ path: `resp_${lab}_meteo.png`, clip: { x: 0, y: 0, width: 912, height: 420 } });
  await p.evaluate(() => { const t = document.getElementById('cTrack'); t.style.transform = 'translateX(-50%)'; }); await p.waitForTimeout(200);
  await p.screenshot({ path: `resp_${lab}_cal.png`, clip: { x: 0, y: 0, width: 520, height: 210 } });
  await p.evaluate(() => { document.getElementById('cTrack').style.transform = ''; });
  console.log(lab, await p.evaluate(() => { const q = s => document.querySelector(s); const ov = el => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
    return `riquadro ${q('#pContacts').offsetWidth} | temp ${getComputedStyle(q('.w-temp') || document.body).fontSize} | logo ${q('#pRadio .st-logo').offsetWidth} | meteo trabocca ${ov(q('#wPage'))} | calendario trabocca ${ov(q('#calPage'))}`; }));
}
console.log(errs.join(' ') || 'no errors'); await b.close();
