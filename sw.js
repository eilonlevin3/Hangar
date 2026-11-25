/* Network-first for the app shell so updates show up immediately; cached copy when offline.
 * Wikipedia API answers and photos are not cached here (the app caches API answers in localStorage). */
const CACHE = 'hangar-v16';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/data.js', 'js/variants.js', 'js/drone-variants.js', 'js/civil-variants.js', 'js/rcs.js', 'js/variant-perf.js', 'js/units.js', 'js/wiki.js', 'js/envelope.js', 'js/app.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => {  // revalidate: skip the browser's HTTP cache so updates show on the first open
      if (r.ok) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
