import { chromium } from 'playwright';
import fs from 'fs';
const SP = new URL('./', import.meta.url).pathname;
const MDIR = SP + 'node_modules/maplibre-gl/dist/';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], ignoreDefaultArgs: ['--headless=old'] });
const ctx = await b.newContext({ viewport: { width: 932, height: 430 }, isMobile: true, hasTouch: true });
await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file://')) return r.continue();
  if (u.includes('maplibre-gl.js')) return r.fulfill({ body: fs.readFileSync(MDIR + 'maplibre-gl.js'), contentType: 'application/javascript' });
  return r.abort(); });
const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3800);
const vis = s => p.evaluate(s => { const e = document.querySelector(s); return e.hidden ? 'nascosto' : 'visibile op=' + (+getComputedStyle(e).opacity).toFixed(2); }, s);
await p.click('.nav-btn.settings'); console.log('impostazioni subito:', await vis('#settingsSheet')); await p.waitForTimeout(400); console.log('impostazioni 400ms:', await vis('#settingsSheet'));
for (const sec of ['contatti', 'mappa', 'traffico', 'info']) { await p.click(`.set-nav [data-sec="${sec}"]`); await p.waitForTimeout(250); console.log(sec, await p.$$eval('.set-sec', s => s.filter(x => !x.hidden).map(x => x.dataset.sec).join(','))); }
await p.click('#settingsSheet [data-close]'); await p.waitForTimeout(80); console.log('chiusura 80ms:', await vis('#settingsSheet')); await p.waitForTimeout(400); console.log('chiusura 480ms:', await vis('#settingsSheet'));
await p.click('[data-go="map"]'); await p.waitForTimeout(400); await p.click('[data-go="radio"]'); await p.waitForTimeout(400); await p.click('[data-go="home"]'); await p.waitForTimeout(400);
await p.click('#fabToggle'); await p.waitForTimeout(300); await p.click('#voiceBtn'); await p.waitForTimeout(300); await p.click('#voiceBtn'); await p.waitForTimeout(300);
console.log('icone voce:', await p.evaluate(() => [document.querySelector('#icoVoiceOn').hasAttribute('hidden'), document.querySelector('#icoVoiceOff').hasAttribute('hidden')]));
console.log(errs.join('\n') || 'no errors'); await b.close();
