const CACHE = 'atlas-coup-v4';

const OFFLINE_PAGE = `<!doctype html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Offline — Atlas Coup</title><style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#0e1219 0%,#080b12 100%);font-family:system-ui,sans-serif;color:#fff;padding:24px}
.card{text-align:center;max-width:400px;width:100%}
.icon-wrap{width:96px;height:96px;margin:0 auto 32px;border-radius:50%;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center}
h1{font-size:22px;font-weight:700;margin-bottom:12px}
p{font-size:14px;color:rgba(255,255,255,0.55);line-height:1.6;margin-bottom:32px}
.actions{display:flex;flex-direction:column;gap:12px}
.btn-primary{padding:14px 24px;border:none;border-radius:12px;background:linear-gradient(135deg,#4facfe,#2563eb);color:#fff;font-size:15px;font-weight:600;cursor:pointer}
.btn-primary:hover{opacity:.9}
.btn-ghost{padding:14px 24px;border:1px solid rgba(255,255,255,0.1);border-radius:12px;background:transparent;color:rgba(255,255,255,0.6);font-size:14px;font-weight:500;cursor:pointer}
.btn-ghost:hover{border-color:rgba(255,255,255,0.2);color:#fff}
.logo{font-size:20px;font-weight:700;margin-bottom:24px;letter-spacing:-.3px}
.logo span{color:#4facfe}
</style></head>
<body><div class="card">
<div class="logo">Atlas <span>Coup</span></div>
<div class="icon-wrap"><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M2 8.82a15 15 0 0 1 20 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><line x1="2" y1="2" x2="22" y2="22"/></svg></div>
<h1>No Internet Connection</h1>
<p>You're offline. Check your connection and try again.</p>
<div class="actions">
<button class="btn-primary" onclick="window.location.reload()">Try Again</button>
<button class="btn-ghost" onclick="window.close()">Close App</button>
</div>
</div></body></html>`;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => new Response(OFFLINE_PAGE, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, clone));
      return res;
    }))
  );
});