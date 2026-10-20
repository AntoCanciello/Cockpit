import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--use-angle=swiftshader','--enable-unsafe-swiftshader'], ignoreDefaultArgs: ['--headless=old'] });
for (const [label, vp] of [['oriz', { width: 956, height: 440 }], ['vert', { width: 440, height: 956 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { Object.defineProperty(screen, 'orientation', { value: { angle: 90, type: 'landscape-primary', addEventListener() {} }, configurable: true });
    if (sessionStorage.x) return; sessionStorage.x = 1;
    localStorage.setItem('cockpit.v1', JSON.stringify({ glass: 'glass-light', wall: 'aurora', radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true, stationIdx: 0, stations: [{ name: 'Radio Deejay', url: 'https://a.example/x.mp3', site: '', logo: '' }, { name: 'RDS', url: 'https://a.example/y.mp3', site: 'rds.it', logo: '' }] })); });
  await ctx.route('**/*', r => r.request().url().startsWith('file://') || r.request().url().startsWith('data:') ? r.continue() : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(vp.width / 2, 60); await p.waitForTimeout(500);
  const r = await p.evaluate(() => { const b = document.querySelector('#pRadio').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, h: b.height }; });
  const swipe = async (dy, dx = 0) => { await p.mouse.move(r.x, r.y); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(r.x + dx * i / 8, r.y + dy * i / 8); await p.waitForTimeout(16); } await p.mouse.up(); await p.waitForTimeout(600); };
  const st0 = await p.textContent('#stName');
  await swipe(-80);
  console.log(label, 'dopo swipe su: act =', await p.evaluate(() => document.querySelector('#pRadio').classList.contains('act')), '| href:', await p.getAttribute('#actBtn', 'href'), '| radio suona?', await p.evaluate(() => !document.querySelector('#audio').paused));
  await p.locator('#pRadio').screenshot({ path: `act_${label}.png` });
  await swipe(0, -120);
  console.log('  swipe orizzontale sulla pagina Casa: stazione', st0, '→', await p.textContent('#stName'));
  await swipe(80);
  console.log('  dopo swipe giù: act =', await p.evaluate(() => document.querySelector('#pRadio').classList.contains('act')));
  await swipe(0, -120);
  console.log('  swipe orizzontale sulla radio: stazione', st0, '→', await p.textContent('#stName'));
  if (label === 'oriz') {
    await swipe(-80);
    let nav = null; p.on('request', q => { if (/shortcuts/.test(q.url())) nav = q.url(); });
    await p.evaluate(() => { const a = document.querySelector('#actBtn'); a.addEventListener('click', e => { window.__href = a.href; e.preventDefault(); }, { once: true }); a.click(); });
    console.log('  tocco: apre', await p.evaluate(() => window.__href)); await p.waitForTimeout(3000);
    console.log('  2,5 s dopo il tocco torna alla radio:', !(await p.evaluate(() => document.querySelector('#pRadio').classList.contains('act'))));
    await p.evaluate(() => { document.querySelector('#openSettings').click(); document.querySelector('button[data-sec="casa"]').click(); }); await p.waitForTimeout(500);
    await p.fill('#sActName', 'Casa Ring'); await p.fill('#sActLabel', 'Sono a casa');
    await p.locator('.set-main').screenshot({ path: 'act_settings.png' });
    console.log('  campi:', await p.inputValue('#sActName'), '| sheet visibile', await p.isVisible('#settingsSheet'), '| save:', await p.evaluate(() => [...document.querySelectorAll('.tbtn.save')].map(b => b.id + ':' + b.offsetParent?.tagName).join()));
    await p.evaluate(() => document.querySelector('.tbtn.save').click()); await p.waitForTimeout(600);
    console.log('  dopo salvataggio:', await p.getAttribute('#actBtn', 'href'), await p.textContent('#actLabel'));
  }
  console.log('  ' + (errs.join(' ') || 'no errors'));
  await ctx.close();
}
await b.close();
