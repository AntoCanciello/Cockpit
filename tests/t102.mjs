// iPad: RaiPlay (canali) e TGCOM24 (diretta) nella metà alta; fotogrammi dell'animazione di apertura; chiusura
import { chromium } from 'playwright';
const S0 = process.env.OUT || './'; // screenshot m_*.png
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const [w, h] of [[1180, 820], [820, 1180]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, screen: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, userAgent: IPAD });
  const calls = [];
  await ctx.route('**/*', r => { const u = r.request().url();
    if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
    if (u.includes('mediaset.net')) { calls.push('tgcom24 ' + u.split('/')[2].split('-')[0]); return r.abort(); }
    if (u.includes('mediapolis.rai.it')) { calls.push('rai ' + u.split('cont=')[1]); return r.abort(); }
    return r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3300); await p.mouse.click(w / 2, 200); await p.waitForTimeout(300);
  const tag = w > h ? 'L' : 'P';
  await p.screenshot({ path: S0 + `m_${tag}_0.png` });
  // apertura: fotogrammi dell'animazione
  const frames = p.evaluate(() => new Promise(res => { const out = [], t0 = performance.now(); const f = () => { const r = s => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return getComputedStyle(e).display === 'none' ? '-' : `${Math.round(b.top)}/${Math.round(b.height)} o${(+getComputedStyle(e).opacity).toFixed(1)}`; };
    out.push(`${Math.round(performance.now() - t0)}ms mappa ${r('#pMap')} yt ${r('#pYt')} radio ${r('#pRadio')}`); if (performance.now() - t0 < 700) requestAnimationFrame(f); else res(out); }; requestAnimationFrame(f); }));
  await p.evaluate(() => document.querySelector('#pRadio').classList.add('apps')); await p.waitForTimeout(450); await p.click('.dapp[data-app="raiplay"]');
  console.log(tag, 'apertura RaiPlay:\n ' + (await frames).filter((_, i) => i % 5 === 0).join('\n '));
  await p.waitForTimeout(300); await p.screenshot({ path: S0 + `m_${tag}_rai.png` });
  await p.click('.rai-ch[data-rai="rai1"]'); await p.waitForTimeout(2500); await p.screenshot({ path: S0 + `m_${tag}_rai_err.png` });
  await p.click('#ytClose'); await p.waitForTimeout(900); await p.evaluate(() => document.querySelector('#pRadio').classList.add('apps')); await p.waitForTimeout(450); await p.click('.dapp[data-app="tgcom24"]'); await p.waitForTimeout(2500); await p.screenshot({ path: S0 + `m_${tag}_tgcom.png` });
  await p.click('#ytClose'); await p.waitForTimeout(900); await p.screenshot({ path: S0 + `m_${tag}_closed.png` });
  console.log(' ', calls.join(', '), '| diario:', await p.evaluate(() => (localStorage.getItem('cockpit.diag') || '').match(/(raiplay|tgcom24)[^"]*/g)?.join(' / ')), '| chiuso:', await p.evaluate(() => !document.getElementById('app').classList.contains('ytopen')), '|', errs.join(' ') || 'ok');
  await ctx.close();
}
await b.close();
