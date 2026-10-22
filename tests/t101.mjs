// iPad: YouTube nella metà alta (riquadri laterali nascosti, mappa sotto), ricerca finta via Piped, video, ingrandisci e chiudi
import { chromium } from 'playwright';
const S0 = process.env.OUT || './'; // screenshot yt_*.png
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const [w, h] of [[1180, 820], [820, 1180]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, screen: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, userAgent: IPAD });
  await ctx.addInitScript(() => localStorage.setItem('cockpit.v1', JSON.stringify({ radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true })));
  const calls = [];
  await ctx.route('**/*', r => { const u = r.request().url();
    if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
    if (u.includes('pipedapi.kavin.rocks')) { calls.push('piped'); return r.fulfill({ json: { items: Array.from({ length: 8 }, (_, i) => ({ url: `/watch?v=abcdefghij${i}`, title: `Video di prova numero ${i + 1} con un titolo abbastanza lungo da andare a capo`, uploaderName: 'Canale ' + (i + 1), thumbnail: '', duration: 215 + i * 60 })) }, headers: { 'access-control-allow-origin': '*' } }); }
    if (u.includes('youtube.com/embed')) { calls.push('embed ' + u.split('?')[0].split('/').pop()); return r.fulfill({ contentType: 'text/html', body: '<body style="margin:0;background:#c00;color:#fff;font:20px sans-serif;display:grid;place-items:center;height:100vh">VIDEO</body>' }); }
    return r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3300); await p.mouse.click(w / 2, 200); await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('#pRadio').classList.add('apps')); await p.waitForTimeout(450); await p.click('.dapp[data-app="youtube"]'); await p.waitForTimeout(500);
  await p.fill('#ytQ', 'gol serie a'); await p.press('#ytQ', 'Enter'); await p.waitForTimeout(800);
  await p.click('.yt-item >> nth=1'); await p.waitForTimeout(800);
  await p.screenshot({ path: S0 + `yt_${w}.png` });
  console.log(w, await p.evaluate(() => { const r = s => document.querySelector(s).getBoundingClientRect(); const m = r('#pMap'), y = r('#pYt'), pl = r('#ytPlayer'), it = r('.yt-item'), tx = r('.yt-item b'), L = r('.yt-list');
    const vis = s => getComputedStyle(document.querySelector(s)).display !== 'none';
    return `YouTube ${Math.round(y.width)}×${Math.round(y.height)} in alto (${Math.round(y.top)}), mappa ${Math.round(m.width)}×${Math.round(m.height)} sotto (${Math.round(m.top)}) | meteo ${vis('#pContacts') ? 'visibile' : 'nascosto'}, radio ${vis('#pRadio') ? 'visibile' : 'nascosta'} | video ${Math.round(pl.width)}×${Math.round(pl.height)} | risultati ${document.querySelectorAll('.yt-item').length}, testo dentro la colonna ${tx.right <= L.right + 1}`; }), '|', calls.join(', '), '|', errs.join(' ') || 'ok');
  await p.click('#ytBig'); await p.waitForTimeout(500); await p.screenshot({ path: S0 + `yt_${w}_big.png` });
  console.log('  ingrandito: YouTube alto', await p.evaluate(() => Math.round(document.getElementById('pYt').getBoundingClientRect().height)));
  await p.click('#ytClose'); await p.waitForTimeout(500); console.log('  chiuso:', await p.evaluate(() => !document.getElementById('app').classList.contains('ytopen') && getComputedStyle(document.getElementById('pRadio')).display !== 'none'));
  await ctx.close();
}
await b.close();
