import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const [lab, lefty, w] of [['m-min', true, 170], ['m-def', true, null], ['m-max', true, 420], ['n-def', false, null], ['n-min', false, 170]]) {
const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, screen: { width: 912, height: 420 }, deviceScaleFactor: 2 });
await ctx.addInitScript(([l, w]) => { Object.defineProperty(screen, 'orientation', { value: { angle: 90, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = 90;
  localStorage.setItem('cockpit.v1', JSON.stringify({ glass: 'glass-light', wall: 'aurora', lefty: l, sideW: w, radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true }));
  localStorage.setItem('cockpit.lastpos', JSON.stringify({ lat: 40.75, lng: 14.45, t: Date.now() }));
  new MutationObserver(() => { const e = document.getElementById('islProbe'); if (e && !e.dataset.x) { e.dataset.x = 1; e.style.width = '68px'; e.style.paddingRight = '68px'; } }).observe(document, { childList: true, subtree: true }); }, [lefty, w]);
await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
  if (u.includes('open-meteo')) return r.fulfill({ json: { current: { temperature_2m: 24, weather_code: 3, is_day: 1 }, daily: { temperature_2m_max: [24], temperature_2m_min: [15] } }, headers: { 'access-control-allow-origin': '*' } });
  if (u.includes('nominatim')) return r.fulfill({ json: { address: { town: 'Torre Annunziata' } }, headers: { 'access-control-allow-origin': '*' } });
  return r.abort(); });
const p = await ctx.newPage(); await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(456, 60); await p.waitForTimeout(300);
const box = await p.locator('#pContacts').boundingBox();
await p.screenshot({ path: `ico_${lab}.png`, clip: box });
console.log(lab, await p.evaluate(() => { const r = e => document.querySelector(e).getBoundingClientRect(); const pc = r('#pContacts'), ic = r('.w-ico'), t = r('.w-temp'), c = r('.w-city'), d = r('.w-desc');
  const tx = sel => { const rg = document.createRange(); rg.selectNodeContents(document.querySelector(sel)); return hit(ic, rg.getBoundingClientRect()); };
  const hit = (a, b) => !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
  return `icona ${Math.round(ic.width)}px, centro ${Math.round((ic.top + ic.bottom) / 2 - pc.top)}/${Math.round(pc.height / 2)} | dentro ${ic.left >= pc.left && ic.right <= pc.right - 4 && ic.top >= pc.top && ic.bottom <= pc.bottom} | tocca testo temp ${(() => { const rg = document.createRange(); rg.selectNodeContents(document.querySelector('.w-temp')); return hit(ic, rg.getBoundingClientRect()); })()} città ${tx('.w-city')} desc ${tx('.w-desc')} minmax ${tx('.w-mm')}`; }));
await ctx.close(); }
await b.close();
