// iPad: Mediaset Infinity (canali Mediaset in diretta) e loghi dei canali Rai nelle tessere; app 2 sopra e 2 sotto
import { chromium } from 'playwright';
const S0 = process.env.OUT || './'; // screenshot ms_*.png
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const [w, h] of [[1180, 820], [820, 1180]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, screen: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, userAgent: IPAD });
  const calls = [];
  await ctx.route('**/*', r => { const u = r.request().url();
    if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
    if (/mediaset/.test(u)) { calls.push(u.split('/')[2].split('.')[0] + ' ' + (u.match(/ch-(\w+)|channel\((\w+)\)/) || []).slice(1).join('')); return r.abort(); }
    return r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3300); await p.mouse.click(w / 2, 200); await p.waitForTimeout(300);
  const tag = w > h ? 'L' : 'P';
  await p.evaluate(() => document.querySelector('#pRadio').classList.add('apps')); await p.waitForTimeout(450);
  const dock = await p.evaluate(() => { const y = [...document.querySelectorAll('.dapp')].map(e => e.getBoundingClientRect()); return `${y.length} app ${Math.round(y[0].width)} pt, file ${new Set(y.map(e => Math.round(e.top))).size}, colonne ${new Set(y.map(e => Math.round(e.left))).size}`; });
  await p.screenshot({ path: S0 + `ms_${tag}_dock.png` });
  await p.click('.dapp[data-app="raiplay"]'); await p.waitForTimeout(1200);
  const logos = async () => p.evaluate(() => { const im = [...document.querySelectorAll('.rai-ch img')]; return `${im.length} loghi, caricati ${im.filter(i => i.complete && i.naturalWidth).length}`; });
  const rai = await logos();
  await p.screenshot({ path: S0 + `ms_${tag}_rai.png` });
  await p.click('#ytClose'); await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector('#pRadio').classList.add('apps')); await p.waitForTimeout(450);
  await p.click('.dapp[data-app="infinity"]'); await p.waitForTimeout(1200);
  const ms = await logos(), title = await p.textContent('#mTitle');
  await p.screenshot({ path: S0 + `ms_${tag}_list.png` });
  await p.click('.rai-ch[data-ms="c5"]'); await p.waitForTimeout(2500);
  await p.screenshot({ path: S0 + `ms_${tag}_err.png` });
  console.log(tag, '|', dock, '| RaiPlay:', rai, '| «' + title + '»:', ms, '| Canale 5 →', calls.join(', '), '| messaggio:', await p.evaluate(() => document.querySelector('.rai-err')?.textContent), '|', errs.join(' ') || 'ok');
  await ctx.close();
}
await b.close();
