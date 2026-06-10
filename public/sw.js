const CACHE = 'atlas-coup-v1';
const ASSETS = ['/', '/index.html', '/offline.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r || caches.match('/offline.html'))
      )
    );
    return;
  }

  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
      }
      return res;
    }))
  );
});
