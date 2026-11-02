// iPad: Twitch con nomi lunghi e canali in diretta: casella del nome alta giusta, nessun testo fuori dalle tessere
import { chromium } from 'playwright';
const CORS = { 'access-control-allow-origin': '*' };
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const names = ['pow3r', 'vkingplays', 'omegaclickofficial', 'ilbello_delcalcio', 'vivaelfutbolreal', 'alfredopedulla', 'erinolash', 'senyahardini'];
for (const [w, h] of [[1180, 820], [820, 1180]]) {
const ctx = await b.newContext({ viewport: { width: w, height: h }, screen: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, userAgent: IPAD, deviceScaleFactor: 2 });
await ctx.addInitScript(() => { if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('cockpit.v1', JSON.stringify({ glass: 'glass-light', wall: 'aurora', radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true,
  twClient: 'abcdefghij0123456789abcdefghij', twAuth: { access: 'AT', refresh: 'RT', exp: Date.now() + 3600e3, uid: '42', login: 'antonio', name: 'Antonio' } })); } });
await ctx.route('**/*', r => { const u = r.request().url();
  if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
  if (u.includes('/channels/followed')) return r.fulfill({ json: { data: names.map((l, i) => ({ broadcaster_login: l, broadcaster_name: l, broadcaster_id: '' + i })) }, headers: CORS });
  if (u.includes('/streams/followed')) return r.fulfill({ json: { data: [{ user_login: 'pow3r', game_name: 'Escape from Tarkov', viewer_count: 9, thumbnail_url: '' }, { user_login: 'vkingplays', game_name: 'Just Chatting', viewer_count: 5, thumbnail_url: '' }] }, headers: CORS });
  if (u.includes('/helix/users')) return r.fulfill({ json: { data: [] }, headers: CORS });
  return r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3300); await p.mouse.click(w / 2, 200);
await p.evaluate(() => { document.querySelector('#pRadio').classList.add('apps'); document.querySelector('.dapp[data-app="twitch"]').click(); }); await p.waitForTimeout(2000);
await p.screenshot({ path: (process.env.OUT || './') + `twpad_${w}.png` });
console.log(w, await p.evaluate(() => { const f = document.querySelector('.tw-add').getBoundingClientRect(); const bad = [...document.querySelectorAll('.rai-ch')].filter(t => { const r = t.getBoundingClientRect(); return [...t.querySelectorAll('.rt, .rt small')].some(e => { const q = e.getBoundingClientRect(); return q.right > r.right + 1 || q.bottom > r.bottom + 1; }); }).length;
  return `casella nome alta ${Math.round(f.height)} | tessere con testo fuori: ${bad} di ${document.querySelectorAll('.rai-ch').length}`; }), errs.join(' ') || 'ok');
await ctx.close(); }
await b.close();
