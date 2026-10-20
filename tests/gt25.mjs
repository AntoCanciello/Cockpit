import { chromium } from 'playwright';
import fs from 'fs';
const SP = new URL('./', import.meta.url).pathname;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'], ignoreDefaultArgs: ['--headless=old'] });
const p = await (await b.newContext({ viewport: { width: 393, height: 852 }, hasTouch: true, isMobile: true })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.route(/^https:/, r => r.request().url().includes('maplibre-gl.js') ? r.fulfill({ body: fs.readFileSync(SP + 'node_modules/maplibre-gl/dist/maplibre-gl.js'), contentType: 'application/javascript' }) : r.abort());
await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3300);
await p.setViewportSize({ width: 852, height: 393 }); await p.waitForTimeout(400);
await p.evaluate(() => document.querySelector('#openSettings').click()); await p.click('.set-nav [data-sec="info"]'); await p.click('#settingsSheet [data-close]');
await p.evaluate(() => { document.documentElement.scrollTop = 40; document.documentElement.scrollLeft = 60; }); // simula la pagina spostata
await p.setViewportSize({ width: 393, height: 852 }); await p.evaluate(() => dispatchEvent(new Event('orientationchange'))); await p.waitForTimeout(900);
console.log('scroll pagina dopo rotazione:', await p.evaluate(() => [document.documentElement.scrollLeft, document.documentElement.scrollTop]));
await p.tap('[data-go="radio"]'); await p.waitForTimeout(150);
console.log('tocco Radio →', await p.evaluate(() => document.getElementById('app').dataset.mode));
await p.tap('[data-go="home"]'); await p.waitForTimeout(150);
console.log('tocco Home →', await p.evaluate(() => document.getElementById('app').dataset.mode));
console.log(errs.join(' | ') || 'no errors'); await b.close();
