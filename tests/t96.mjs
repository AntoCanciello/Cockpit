// Pulsante Casa con «apri l'app Alexa»: prima parte il trigger, poi la pagina chiede alexa:// (spenta: nessun salto)
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
for (const actAlexa of [true, false]) {
  const ctx = await b.newContext({ viewport: { width: 912, height: 420 } });
  await ctx.addInitScript(a => {
    localStorage.setItem('cockpit.v1', JSON.stringify({ actUrl: 'https://www.virtualsmarthome.xyz/url_routine_trigger/activate.php?trigger=TEST&token=X&response=json', actAlexa: a, radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true }));
  }, actAlexa);
  const ev = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://') || u.startsWith('data:')) return r.continue(); if (u.includes('virtualsmarthome')) { ev.push('trigger'); return r.fulfill({ json: { URLRoutineTrigger: { triggerActivationStatus: 'success' } } }); } return r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('request', q => { if (q.url().startsWith('alexa:')) ev.push('alexa://'); });
  p.on('framenavigated', f => { if (f.url().startsWith('alexa:')) ev.push('nav alexa'); });
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3000); await p.mouse.click(456, 60);
  await p.evaluate(() => document.getElementById('pRadio').classList.add('act')); await p.waitForTimeout(400);
  // radio accesa (finta: basta lo stato «in riproduzione»), poi pulsante Casa
  await p.evaluate(() => { const a = document.getElementById('audio'); a.__p = true; Object.defineProperty(a, 'paused', { configurable: true, get: () => !!a.__p }); a.play = () => { a.__p = false; return Promise.resolve(); }; a.pause = () => { a.__p = true; }; });
  await p.evaluate(() => document.getElementById('play').click()); await p.waitForTimeout(300);
  const before = await p.evaluate(() => !document.getElementById('audio').paused);
  await p.click('#actBtn'); await p.waitForTimeout(1200);
  const after = await p.evaluate(() => !document.getElementById('audio').paused);
  ev.push(`radio ${before ? 'accesa' : 'spenta'}→${after ? 'accesa' : 'spenta'}`);
  // ritorno nel Cockpit dall'app Alexa: la radio riparte da sola
  await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await p.waitForTimeout(500);
  ev.push(`al ritorno ${await p.evaluate(() => !document.getElementById('audio').paused) ? 'accesa' : 'spenta'}`);
  const diag = await p.evaluate(() => (localStorage.getItem('cockpit.diag') || '') + JSON.stringify(window.__diag?.lines?.slice?.(-5) || ''));
  console.log('actAlexa', actAlexa, '| eventi:', ev.join(' → ') || 'nessuno', '| diario apre Alexa:', /apro l'app Alexa/.test(diag), '|', errs.join(' ') || 'no errors');
  await ctx.close();
}
// impostazioni: l'interruttore si salva
{
  const ctx = await b.newContext({ viewport: { width: 912, height: 420 } });
  await ctx.route('**/*', r => { const u = r.request().url(); return (u.startsWith('file://') || u.startsWith('data:')) ? r.continue() : r.abort(); });
  const p = await ctx.newPage(); await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3000);
  console.log('interruttore presente:', await p.locator('#sActAlexa').count() === 1);
  await ctx.close();
}
await b.close();
