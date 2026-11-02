// Copia chiavi su un dispositivo, Incolla chiavi sull'altro: passano solo YouTube, Twitch e TomTom; il resto non cambia
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const dev = async cfg => {
  const ctx = await b.newContext({ viewport: { width: 912, height: 420 }, permissions: ['clipboard-read', 'clipboard-write'] });
  await ctx.addInitScript(c => { if (!sessionStorage.x) { sessionStorage.x = 1; localStorage.setItem('cockpit.v1', c); } }, JSON.stringify({ radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true, ...cfg }));
  await ctx.route('**/*', r => r.request().url().startsWith('file://') || r.request().url().startsWith('data:') ? r.continue() : r.abort());
  const p = await ctx.newPage(); await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(2500); await p.mouse.click(456, 60);
  await p.evaluate(() => { document.querySelector('#openSettings').click(); document.querySelector('button[data-sec="app"]').click(); }); await p.waitForTimeout(400);
  return p;
};
const A = await dev({ ytKey: 'AIzaSyTEST_key-123', twClient: 'abcdefghij0123456789abcdefghij', tomtomKey: 'A'.repeat(32), lefty: true });
await A.click('#keysCopy'); await A.waitForTimeout(300);
const clip = await A.evaluate(() => navigator.clipboard.readText());
console.log('A:', await A.textContent('#keysMsg'), '| appunti:', clip.slice(0, 15) + '…');
const B = await dev({ lefty: false, sideW: 200 });
await B.evaluate(t => navigator.clipboard.writeText(t), clip);
await B.click('#keysPaste'); await B.waitForTimeout(300);
console.log('B:', await B.textContent('#keysMsg'));
await B.evaluate(() => document.querySelector('.tbtn.save').click()); await B.waitForTimeout(500);
const c = await B.evaluate(() => JSON.parse(localStorage.getItem('cockpit.v1')));
console.log(`B salvato: yt ${c.ytKey} | tw ${c.twClient} | tomtom ${c.tomtomKey && c.tomtomKey.length} car. | mancino ${c.lefty} | larghezza ${c.sideW}`);
await b.close();
