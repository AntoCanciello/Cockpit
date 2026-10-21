// Marca del veicolo: iPad parte con FIAT 500X (logo e introduzione FIAT), iPhone con BMW C 400 GT; incollando le impostazioni
// da un dispositivo all'altro il veicolo resta quello del dispositivo
import { chromium } from 'playwright';
const S0 = './'; // screenshot b_ipad_*.png qui accanto
const IPAD = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new'], ignoreDefaultArgs: ['--headless=old'] });
const open = async (pad, pre) => {
  const ctx = await b.newContext(pad ? { viewport: { width: 1180, height: 820 }, screen: { width: 820, height: 1180 }, isMobile: true, hasTouch: true, userAgent: IPAD, permissions: ['clipboard-read', 'clipboard-write'] } : { viewport: { width: 912, height: 420 }, permissions: ['clipboard-read', 'clipboard-write'] });
  if (pre) await ctx.addInitScript(v => localStorage.setItem('cockpit.v1', v), pre);
  await ctx.route('**/*', r => { const u = r.request().url(); return (u.startsWith('file://') || u.startsWith('data:')) ? r.continue() : r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.errs = errs;
  await p.goto(new URL('../index.html', import.meta.url).href); return p;
};
const st = p => p.evaluate(() => { const c = JSON.parse(localStorage.getItem('cockpit.v1') || '{}'); return `barra ${document.querySelector('#brandSlot img').getAttribute('src')} | intro ${document.querySelector('.splash-logo').getAttribute('src')} ${document.getElementById('splash').classList.contains('fiat') ? 'FIAT' : 'BMW'} | titolo «${document.title}» | salvato marca ${c.brand} modello ${c.vehicle}`; });
// iPad nuovo: intro FIAT
let p = await open(true); await p.waitForTimeout(1900); await p.screenshot({ path: S0 + 'b_ipad_intro.png' });
await p.waitForTimeout(1800); await p.mouse.click(590, 200); await p.waitForTimeout(400); await p.screenshot({ path: S0 + 'b_ipad_home.png' });
await p.click('#openSettings'); await p.waitForTimeout(700); await p.screenshot({ path: S0 + 'b_ipad_set.png' }); await p.click('.set-head .right button, #saveSettings').catch(() => {}); await p.waitForTimeout(500);
console.log('iPad nuovo:', await st(p), p.errs.join(' ') || 'ok'); await p.context().close();
// iPhone: BMW, copia impostazioni
p = await open(false); await p.waitForTimeout(3700); await p.mouse.click(456, 60);
console.log('iPhone:', await st(p));
await p.click('#openSettings'); await p.waitForTimeout(500); await p.click('.set-nav [data-sec="backup"]'); await p.waitForTimeout(300); await p.click('#copyCfg'); await p.waitForTimeout(300);
const txt = await p.inputValue('#cfgBox'); console.log('copia iPhone contiene dev:', /"dev":"iphone"/.test(txt), p.errs.join(' ') || 'ok'); await p.context().close();
// iPad con impostazioni vecchie copiate dall'iPhone (senza marca): diventa 500X FIAT; poi incolla dall'iPhone: resta FIAT
p = await open(true, JSON.stringify({ vehicle: 'C 400 GT', logoW: 1, radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true }));
await p.waitForTimeout(3700); await p.mouse.click(590, 200); console.log('iPad con impostazioni vecchie:', await st(p));
await p.click('#openSettings'); await p.waitForTimeout(500); await p.click('.set-nav [data-sec="backup"]'); await p.waitForTimeout(300);
await p.fill('#cfgBox', txt.replace('"glass"', '"zzz":1,"glass"')); await p.click('#pasteCfg'); await p.waitForTimeout(1500);
console.log('iPad dopo incolla da iPhone:', await st(p), p.errs.join(' ') || 'ok'); await p.context().close();
await b.close();
