// Twitch: tocco su un canale → tendina con la diretta (se c'è) e gli ultimi 3 video; tocco su un video → lettore con quel video
import { chromium } from 'playwright';
const CORS = { 'access-control-allow-origin': '*' };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { Object.defineProperty(screen, 'orientation', { value: { angle: 90, type: 'landscape-primary', addEventListener() {} }, configurable: true }); window.orientation = 90;
  if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('cockpit.v1', JSON.stringify({ lefty: true, glass: 'glass-light', wall: 'aurora', radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true,
  twClient: 'abcdefghij0123456789abcdefghij', twAuth: { access: 'AT', refresh: 'RT', exp: Date.now() + 3600e3, uid: '42', login: 'antonio', name: 'Antonio' } })); } });
const frames = [];
await ctx.route('**/*', r => { const u = r.request().url();
  if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
  if (u.includes('/channels/followed')) return r.fulfill({ json: { data: [{ broadcaster_login: 'omega', broadcaster_name: 'Omega', broadcaster_id: '100' }, { broadcaster_login: 'pow3r', broadcaster_name: 'Pow3r', broadcaster_id: '200' }] }, headers: CORS });
  if (u.includes('/streams/followed')) return r.fulfill({ json: { data: [{ user_login: 'pow3r', game_name: 'Tarkov', title: 'Raid', viewer_count: 9, thumbnail_url: 'https://x/{width}x{height}.jpg' }] }, headers: CORS });
  if (u.includes('/helix/videos?user_id=100')) return r.fulfill({ json: { data: [1, 2, 3].map(i => ({ id: '90' + i, title: 'Video numero ' + i + ' con un titolo lungo per vedere come va a capo', created_at: new Date(Date.now() - i * 86400000).toISOString(), duration: '1h' + i + 'm5s', thumbnail_url: '' })) }, headers: CORS });
  if (u.includes('/helix/videos?user_id=200')) return r.fulfill({ json: { data: [] }, headers: CORS });
  if (u.includes('/helix/users')) return r.fulfill({ json: { data: [] }, headers: CORS });
  if (u.includes('player.twitch.tv')) { frames.push(u.split('?')[1].split('&')[0]); return r.fulfill({ contentType: 'text/html', body: '<body style="margin:0;background:#222"></body>' }); }
  return r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3000); await p.mouse.click(456, 60);
await p.evaluate(() => { document.querySelector('#pRadio').classList.add('apps'); document.querySelector('.dapp[data-app="twitch"]').click(); }); await p.waitForTimeout(1500);
await p.click('.rai-ch[data-tw="omega"]'); await p.waitForTimeout(700);
const drop1 = await p.evaluate(() => [...document.querySelectorAll('.tw-drop .tw-vod b, .tw-drop small')].map(e => e.textContent.slice(0, 22)).join(' | '));
await p.screenshot({ path: (process.env.OUT || './') + 'tw_drop.png' });
await p.click('[data-twvod="902"]'); await p.waitForTimeout(600);
await p.click('.rai-ch[data-tw="pow3r"]'); await p.waitForTimeout(700);
const drop2 = await p.evaluate(() => [...document.querySelectorAll('.tw-drop')].map(d => d.dataset.for + ': ' + d.innerText.replace(/\n/g, ' ').slice(0, 80)).join(' || '));
await p.click('[data-twlive="pow3r"]'); await p.waitForTimeout(600);
await p.click('.rai-ch[data-tw="omega"]'); await p.waitForTimeout(500); await p.click('.rai-ch[data-tw="omega"]'); await p.waitForTimeout(300);
const closed = await p.evaluate(() => document.querySelectorAll('.tw-drop').length === 0);
console.log(`omega: ${drop1}\npow3r: ${drop2}\nlettore: ${frames.join(' → ')} | richiusa: ${closed} | ${errs.join(' ') || 'no errors'}`);
await b.close();
