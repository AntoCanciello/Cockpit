// iPad: Twitch nella metà alta: nome del canale → lettore ufficiale (con «parent»), preferiti salvati, ✕ per toglierli
import { chromium } from 'playwright';
const S0 = process.env.OUT || './'; // screenshot tw_*.png
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const [w, h] of [[1180, 820], [820, 1180]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, screen: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, userAgent: IPAD });
  await ctx.route('**/*', r => { const u = r.request().url(); return (u.startsWith('file://') || u.startsWith('data:')) ? r.continue() : r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3300); await p.mouse.click(w / 2, 200); await p.waitForTimeout(300);
  const tag = w > h ? 'L' : 'P';
  await p.evaluate(() => document.querySelector('#pRadio').classList.add('apps')); await p.waitForTimeout(450);
  const dock = await p.evaluate(() => [...document.querySelectorAll('.dapp')].map(d => d.dataset.app).join(','));
  await p.click('.dapp[data-app="twitch"]'); await p.waitForTimeout(1000);
  const empty = await p.evaluate(() => document.querySelector('#ytList .yt-msg') ? 'messaggio' : 'niente');
  await p.screenshot({ path: S0 + `tw_${tag}_0.png` });
  await p.fill('#twQ', 'https://www.twitch.tv/IlMasseo'); await p.press('#twQ', 'Enter'); await p.waitForTimeout(600);
  await p.fill('#twQ', 'zeb89'); await p.press('#twQ', 'Enter'); await p.waitForTimeout(600);
  await p.fill('#twQ', 'no!'); await p.press('#twQ', 'Enter'); await p.waitForTimeout(300);
  await p.screenshot({ path: S0 + `tw_${tag}_1.png` });
  const src = await p.evaluate(() => document.querySelector('#ytPlayer iframe')?.src || '-');
  const fav1 = await p.evaluate(() => JSON.parse(localStorage.getItem('cockpit.v1')).twitch.join(','));
  await p.click('.rai-ch[data-tw="ilmasseo"]'); await p.waitForTimeout(400);
  const fav2 = await p.evaluate(() => JSON.parse(localStorage.getItem('cockpit.v1')).twitch.join(','));
  await p.click('[data-twdel="zeb89"]'); await p.waitForTimeout(300);
  const fav3 = await p.evaluate(() => [...document.querySelectorAll('.rai-ch[data-tw]')].map(e => e.dataset.tw + (e.classList.contains('on') ? '(in onda)' : '')).join(','));
  await p.click('#ytClose'); await p.waitForTimeout(900);
  console.log(tag, '| app:', dock, '| vuoto:', empty, '| lettore:', src.replace(/^https:\/\/player\.twitch\.tv\/\?/, '').split('&').slice(0, 3).join('&'), '| preferiti', fav1, '→ tocco ilmasseo →', fav2, '→ ✕ zeb89 →', fav3, '|', errs.join(' ') || 'ok');
  await ctx.close();
}
await b.close();
