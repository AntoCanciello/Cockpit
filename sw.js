// Cockpit: la pagina parte subito dalla memoria del telefono (niente attesa della rete all'avvio,
// quindi niente schermo bianco prima dell'introduzione). La versione nuova arriva in sottofondo:
// il controllo aggiornamenti dell'app la trova e ricarica con ?v=…, che passa sempre dalla rete.
const CACHE = 'cockpit-v1';
const CORE = ['./', 'bmw-logo.png', 'manifest.webmanifest'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const fresh = async req => {
  const r = await fetch(req, { cache: 'no-store' });
  if (r.ok) (await caches.open(CACHE)).put('./', r.clone());
  return r;
};

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // dopo un aggiornamento (?v=) la pagina viene dalla rete; altrimenti subito dalla memoria e intanto si aggiorna
    if (url.searchParams.has('v')) { e.respondWith(fresh(req).catch(() => caches.match('./'))); return; }
    e.respondWith(caches.match('./').then(hit => {
      const net = fresh(req);
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net;
    }));
    return;
  }
  if (url.pathname.endsWith('/bmw-logo.png')) e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
