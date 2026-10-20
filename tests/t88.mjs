import { chromium } from 'playwright'; import fs from 'fs';
const AUDIO = fs.readFileSync(new URL('../awake.webm', import.meta.url));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--headless=old'] });
for (const [lab, lefty, angle] of [['m', true, 90], ['n', false, 90], ['mr', true, 270]]) {
const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, screen: { width: 912, height: 420 }, deviceScaleFactor: 2 });
await ctx.addInitScript(([l, a]) => { Object.defineProperty(screen, 'orientation', { value: { angle: a, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = a;
  localStorage.setItem('cockpit.v1', JSON.stringify({ glass: 'glass-light', wall: 'aurora', lefty: l, stationIdx: 0, stations: [{ name: 'Radio Deejay', url: 'https://a.example/x.mp3', site: '', logo: '' }], radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true }));
  new MutationObserver(() => { const e = document.getElementById('islProbe'); if (e && !e.dataset.x) { e.dataset.x = 1; e.style.width = '68px'; e.style.paddingRight = '68px'; } }).observe(document, { childList: true, subtree: true }); }, [lefty, angle]);
await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://') || u.startsWith('data:')) return r.continue(); if (/a\.example/.test(u)) return r.fulfill({ body: AUDIO, contentType: 'audio/webm' }); return r.abort(); });
const p = await ctx.newPage(); await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(456, 60); await p.waitForTimeout(300);
await p.click('#editPen'); await p.waitForTimeout(400);
const meas = () => p.evaluate(() => { const r = document.getElementById('editReset').getBoundingClientRect(), nt = parseFloat(getComputedStyle(document.getElementById('stage')).getPropertyValue('--notch-top')), W = innerWidth;
  const side = document.getElementById('stage').classList.contains('island-r') ? 'r' : 'l'; const edgeX = side === 'l' ? 7 : W - 7;
  return `dal bordo ${Math.round(side === 'l' ? r.left - edgeX : edgeX - r.right)} | dall'incavo ${Math.round(nt - r.bottom)}`; });
console.log(lab, 'isola corta:', await meas());
await p.screenshot({ path: `reset_${lab}_corta.png`, clip: { x: angle === 90 ? 0 : 712, y: 0, width: 200, height: 220 } });
await p.evaluate(() => document.getElementById('wave').click()); await p.waitForTimeout(1500);
console.log('  isola lunga:', await meas());
await p.screenshot({ path: `reset_${lab}_lunga.png`, clip: { x: angle === 90 ? 0 : 712, y: 0, width: 200, height: 220 } });
await ctx.close(); }
await b.close();
