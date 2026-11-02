// YouTube: video di un canale quando i servizi pubblici non rispondono alla pagina del canale (si ripiega sulla ricerca)
import { chromium } from 'playwright';
const CORS = { 'access-control-allow-origin': '*' };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const lab of ['solo ricerca', 'invidious ordinata']) {
const ctx = await b.newContext({ viewport: { width: 912, height: 420 } });
await ctx.addInitScript(() => { if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('cockpit.v1', JSON.stringify({ ytCh: [{ id: 'UComega', name: 'Omega Click', img: '' }], radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true })); } });
await ctx.route('**/*', r => { const u = r.request().url();
  if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
  if (u.includes('/channel') ) return r.fulfill({ status: 500, body: 'err', headers: CORS });
  if (lab === 'invidious ordinata' && u.includes('inv.nadeko.net/api/v1/search') && u.includes('upload_date')) return r.fulfill({ json: [{ videoId: 'newestvid01', title: 'Ultimo video Omega', author: 'Omega Click', authorId: 'UComega', lengthSeconds: 600 }], headers: CORS });
  if (u.includes('pipedapi.kavin.rocks/search') && u.includes('filter=videos')) return r.fulfill({ json: { items: [{ url: '/watch?v=omegaaaaaa1', title: 'Video Omega', uploaderName: 'Omega Click', uploaderUrl: '/channel/UComega' }, { url: '/watch?v=altrooooooo', title: 'Altro', uploaderName: 'Altro', uploaderUrl: '/channel/UCaltro' }] }, headers: CORS });
  return r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3000); await p.mouse.click(456, 60);
await p.evaluate(() => { document.querySelector('#pRadio').classList.add('apps'); document.querySelector('.dapp[data-app="youtube"]').click(); }); await p.waitForTimeout(900);
await p.click('[data-ytch="UComega"]'); await p.waitForTimeout(6000);
console.log(lab, '|', await p.evaluate(() => [...document.querySelectorAll('#ytList .yt-item b')].map(e => e.textContent).join(', ') || document.querySelector('#ytList .yt-msg')?.textContent), '|', await p.evaluate(() => window.__diag.text().split('\n').filter(l => /canale/.test(l)).length + ' righe nel diario'), errs.join(' ') || 'ok');
await ctx.close(); }
await b.close();
