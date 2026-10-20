import { chromium } from 'playwright'; import fs from 'fs';
const AUDIO = fs.readFileSync(new URL('../awake.webm', import.meta.url));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--headless=old'] });
const C = (n, p) => ({ name: n, phone: p, shortcut: '', mode: 'wa' });
for (const [lab, angle, lefty, mode] of [['n-l', 90, false, 'home'], ['m-l', 90, true, 'home'], ['n-r', 270, false, 'home'], ['m-l-map', 90, true, 'map'], ['m-r', 270, true, 'home']]) {
  const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, screen: { width: 912, height: 420 }, deviceScaleFactor: 2 });
  const cfg = JSON.stringify({ glass: 'glass-light', wall: 'aurora', lefty, radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true, stationIdx: 0,
    stations: [{ name: 'Radio Deejay', url: 'https://a.example/x.mp3', site: '', logo: '' }], contacts: [C('Babbo', '3331'), C('Mamma', '3332'), C('Chiara', '3333')] });
  await ctx.addInitScript(([a, c]) => { Object.defineProperty(screen, 'orientation', { value: { angle: a, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = a; localStorage.setItem('cockpit.v1', c); }, [angle, cfg]);
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://') || u.startsWith('data:')) return r.continue(); if (/a\.example/.test(u)) return r.fulfill({ body: AUDIO, contentType: 'audio/webm' }); return r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(456, 60); await p.waitForTimeout(300);
  const side = angle === 90 ? 'left' : 'right';
  await p.addStyleTag({ content: `#stage.land.island-l:not(.isl-l) #app { padding-left: 68px !important; } #stage.land.island-r:not(.isl-r) #app { padding-right: 68px !important; } #map { background:#1b2438 !important }` });
  await p.evaluate(s => { document.getElementById('islProbe').style[s === 'left' ? 'width' : 'paddingRight'] = '68px'; dispatchEvent(new Event('resize')); }, side);
  if (mode !== 'home') await p.evaluate(m => document.querySelector(`[data-go="${m}"]`).click(), mode);
  await p.waitForTimeout(600);
  // cornice e isola disegnate per la prova
  const frame = async (len) => p.evaluate(([s, len]) => {
    document.getElementById('__f')?.remove(); document.getElementById('__i')?.remove();
    const f = document.createElement('div'); f.id = '__f'; f.style.cssText = 'position:fixed;inset:0;border-radius:55px;box-shadow:0 0 0 60px #000;pointer-events:none;z-index:99';
    const i = document.createElement('div'); i.id = '__i'; i.style.cssText = `position:fixed;${s}:20px;top:${(innerHeight - len) / 2}px;width:37px;height:${len}px;border-radius:18.5px;background:#000;z-index:100`;
    document.body.append(f, i);
  }, [side, len]);
  await frame(126); await p.screenshot({ path: `isl3_${lab}_spenta.png` });
  console.log(lab, await p.evaluate(() => `classi ${[...document.getElementById('stage').classList].filter(c => /isl|lefty/.test(c)).join(' ')} | bersagli ${[...document.querySelectorAll('.isl-t')].map(e => e.id || e.className.split(' ')[0]).join(',')}`));
  if (mode === 'home') {
    await p.evaluate(() => document.getElementById('wave').click());
    await p.waitForTimeout(2000); await frame(178);
    await p.screenshot({ path: `isl3_${lab}_radio.png` });
    console.log('  radio:', await p.evaluate(() => document.getElementById('audio').paused ? 'ferma' : 'suona'));
  }
  console.log('  ' + (errs.join(' ') || 'no errors'));
  await ctx.close();
}
await b.close();
