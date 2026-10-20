import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--headless=new', '--use-angle=swiftshader','--enable-unsafe-swiftshader'], ignoreDefaultArgs: ['--headless=old'] });
const C = (n, p, m = 'wa') => ({ name: n, phone: p, shortcut: '', mode: m });
for (const [label, vp] of [['orizzontale', { width: 956, height: 440 }], ['verticale', { width: 440, height: 956 }]]) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(c => { if (sessionStorage.x) return; sessionStorage.x = 1; localStorage.setItem('cockpit.v1', JSON.stringify({ radioItV1: true, radioItV2: true, radioOrderV3: true, radioKKNV4: true, radioTgcomV5: true, contacts: c })); },
    [C('Fransi', '3331234567'), C('Mamma', '3337654321', 'tel'), C('Papà', '3330000001'), C('Luca', '3330000002'), C('Giulia', '3330000003')]);
  await ctx.route('**/*', r => r.request().url().startsWith('file://') || r.request().url().startsWith('data:') ? r.continue() : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(new URL('../index.html', import.meta.url).href); await p.waitForTimeout(3500); await p.mouse.click(vp.width / 2, 100); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('#cToggle').click()); await p.waitForTimeout(900);
  await p.locator('#pContacts').screenshot({ path: `cl_${label}_1.png` });
  const info = await p.evaluate(() => { const l = document.querySelector('#cList'); return { h: l.clientHeight, sh: l.scrollHeight, rows: [...l.children].map(e => Math.round(e.getBoundingClientRect().height)) }; });
  console.log(label, JSON.stringify(info));
  await p.evaluate(() => { const l = document.querySelector('#cList'); l.scrollTop = 30; }); await p.waitForTimeout(900);
  console.log('  dopo uno scroll di 30px si ferma a', await p.evaluate(() => document.querySelector('#cList').scrollTop), '(riga intera =', await p.evaluate(() => { const c = document.querySelector('#cList').children; return Math.round(c[1].offsetTop - c[0].offsetTop); }), ')');
  await p.evaluate(() => { const l = document.querySelector('#cList'); l.scrollTop = l.scrollHeight; }); await p.waitForTimeout(600);
  await p.locator('#pContacts').screenshot({ path: `cl_${label}_2.png` });
  console.log('  aperto dopo scroll:', await p.evaluate(() => document.querySelector('#pContacts').classList.contains('open')));
  if (label === 'orizzontale') {
    // impostazioni: aggiungi un sesto contatto, rimuovi il secondo, salva
    console.log('  tasto aggiungi nel riquadro:', await p.evaluate(() => !!document.querySelector('#cList .add, #addContact')));
    await p.evaluate(() => { document.querySelector('#openSettings').click(); document.querySelector('button[data-sec="contatti"]').click(); }); await p.waitForTimeout(700);
    await p.evaluate(() => document.querySelector('#sAddContact').click()); await p.waitForTimeout(300);
    console.log('  form:', await p.evaluate(() => document.querySelectorAll('#sContacts .group').length), 'gruppi');
    await p.fill('#cN5', 'Nuovo'); await p.fill('#cP5', '3339999999');
    await p.evaluate(() => document.querySelector('[data-cdel="1"]').click()); await p.waitForTimeout(200);
    console.log('  dopo rimuovi:', await p.evaluate(() => [...document.querySelectorAll('#sContacts input[id^=cN]')].map(i => i.value).join(',')));
    await p.evaluate(() => document.querySelector('#sAddContact').click()); await p.waitForTimeout(300);
    await p.locator('.set-main').screenshot({ path: 'cl_settings.png' });
    await p.evaluate(() => document.querySelector('#saveSettings, [data-save], .tbtn.save').click()); await p.waitForTimeout(900);
    console.log('  salvati:', await p.evaluate(() => JSON.parse(localStorage.getItem('cockpit.v1')).contacts.map(c => c.name).join(',')));
    console.log('  nel riquadro:', await p.evaluate(() => [...document.querySelectorAll('#cList .contact .name')].map(e => e.firstChild.textContent).join(',')));
  }
  console.log('  ' + (errs.join(' ') || 'no errors'));
  await ctx.close();
}
await b.close();
