import { chromium } from 'playwright'; import fs from 'fs';
const AUDIO = fs.readFileSync(new URL('../awake.webm', import.meta.url));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, screen: { width: 912, height: 420 } });
const cfg = JSON.stringify({ radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true, stationIdx: 0, stations: [{ name: 'Radio Deejay', url: 'https://a.example/x.mp3', site: '', logo: '' }, { name: 'RDS', url: 'https://a.example/y.mp3', site: '', logo: '' }] });
await ctx.addInitScript(([c]) => { Object.defineProperty(screen, 'orientation', { value: { angle: 90, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = 90; localStorage.setItem('cockpit.v1', c); }, [cfg]);
// lo stream risponde dopo 2,5 s (come una radio vera che carica)
await ctx.route('**/*', async r => { const u = r.request().url(); if (u.startsWith('file://') || u.startsWith('data:')) return r.continue(); if (/a\.example/.test(u)) { await new Promise(ok => setTimeout(ok, 2500)); return r.fulfill({ body: AUDIO, contentType: 'audio/webm' }).catch(() => {}); } return r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(456, 60);
await p.evaluate(() => { document.getElementById('islProbe').style.width = '68px'; dispatchEvent(new Event('resize')); }); await p.waitForTimeout(500);
const topY = () => p.evaluate(() => { const d = document.querySelector('.rail').style.clipPath; const m = [...d.matchAll(/A 12 12 0 0 1 0 ([0-9.]+)/g)].pop(); return m ? Math.round(+m[1]) : null; });
const watch = async (lbl, ms) => { const t0 = Date.now(), out = []; let last; while (Date.now() - t0 < ms) { const y = await topY(); if (y !== last) { out.push(`${Date.now() - t0}ms:${y}`); last = y; } await p.waitForTimeout(40); } console.log(lbl, out.join(' ')); };
await p.evaluate(() => document.getElementById('wave').click()); await watch('play (stream lento 2,5 s):', 3600);
await p.waitForTimeout(2500); console.log('  stato:', await p.textContent('#radioStatus'));
await p.evaluate(() => document.getElementById('nextSt').click()); await watch('cambio stazione:', 1500);
await p.waitForTimeout(3000);
await p.evaluate(() => document.getElementById('wave').click()); await watch('pausa:', 6500);
console.log(errs.join(' ') || 'no errors'); await b.close();
