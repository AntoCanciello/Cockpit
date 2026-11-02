// Riordino: tieni premuto e trascina un canale YouTube preferito e un canale Twitch seguito; l'ordine resta dopo il riavvio
import { chromium } from 'playwright';
const CORS = { 'access-control-allow-origin': '*' };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: 912, height: 420 } });
await ctx.addInitScript(() => { if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('cockpit.v1', JSON.stringify({ radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true,
  ytCh: [{ id: 'UC1', name: 'Uno' }, { id: 'UC2', name: 'Due' }, { id: 'UC3', name: 'Tre' }],
  twClient: 'abcdefghij0123456789abcdefghij', twAuth: { access: 'AT', refresh: 'RT', exp: Date.now() + 3600e3, uid: '42', login: 'antonio', name: 'Antonio' } })); } });
await ctx.route('**/*', r => { const u = r.request().url();
  if (u.startsWith('file://') || u.startsWith('data:')) return r.continue();
  if (u.includes('/channels/followed')) return r.fulfill({ json: { data: ['aaa', 'bbb', 'ccc', 'ddd'].map(l => ({ broadcaster_login: l, broadcaster_name: l })) }, headers: CORS });
  if (u.includes('/streams/followed')) return r.fulfill({ json: { data: [{ user_login: 'ccc', game_name: 'Gioco', viewer_count: 9 }] }, headers: CORS });
  if (u.includes('/helix/users')) return r.fulfill({ json: { data: [] }, headers: CORS });
  return r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const open = async app => { await p.evaluate(a => { document.querySelector('#pRadio').classList.add('apps'); document.querySelector(`.dapp[data-app="${a}"]`).click(); }, app); await p.waitForTimeout(900); };
const drag = async (sel, toSel) => { const a = await p.locator(sel).boundingBox(), t = await p.locator(toSel).boundingBox();
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down(); await p.waitForTimeout(500);
  for (let i = 1; i <= 12; i++) { await p.mouse.move(a.x + a.width / 2 + (t.x - a.x) * i / 12, a.y + a.height / 2 + (t.y + t.height * .75 - a.y - a.height / 2) * i / 12); await p.waitForTimeout(20); }
  await p.mouse.up(); await p.waitForTimeout(400); };
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3000); await p.mouse.click(456, 60);
await open('youtube');
await drag('.yt-chrow:has([data-ytch="UC1"])', '.yt-chrow:has([data-ytch="UC3"])');
const yt = await p.evaluate(() => [...document.querySelectorAll('[data-sort="yt"] [data-ytch]')].map(e => e.dataset.ytch).join(','));
const opened = await p.evaluate(() => !!document.querySelector('#ytList [data-ytback]'));
await p.click('#ytClose'); await p.waitForTimeout(600);
await open('twitch'); await p.waitForTimeout(800);
const tw0 = await p.evaluate(() => [...document.querySelectorAll('[data-sort="tw"] [data-tw]')].map(e => e.dataset.tw).join(','));
await drag('.tw-fav:has([data-tw="ddd"])', '.tw-fav:has([data-tw="aaa"])');
const tw1 = await p.evaluate(() => [...document.querySelectorAll('[data-sort="tw"] [data-tw]')].map(e => e.dataset.tw).join(','));
await p.reload(); await p.waitForTimeout(3000); await p.mouse.click(456, 60); await open('twitch'); await p.waitForTimeout(800);
const tw2 = await p.evaluate(() => [...document.querySelectorAll('[data-sort="tw"] [data-tw]')].map(e => e.dataset.tw).join(','));
const c = await p.evaluate(() => JSON.parse(localStorage.getItem('cockpit.v1')));
console.log(`YouTube: Uno trascinato su Tre → ${yt} (salvato ${c.ytCh.map(x => x.id)}) | canale aperto per sbaglio: ${opened}`);
console.log(`Twitch: ${tw0} → ddd trascinato su aaa: ${tw1} → dopo il riavvio: ${tw2}`);
console.log(errs.join(' ') || 'no errors'); await b.close();
