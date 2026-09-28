/* 回線スピードテスト Service Worker
 * - アプリ本体(同一オリジン)とGoogle Fontsだけをキャッシュする
 * - 速度測定に使う外部CDN(cdnjs / jsDelivr / ipinfo 等)は一切インターセプトしない
 *   (キャッシュされると測定値が不正確になるため)
 */
const VERSION = 'v2';
const CACHE = 'speedtest-shell-' + VERSION;
const FONT_CACHE = 'speedtest-fonts-' + VERSION;
const SHELL = [
  './speedtest.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png'
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all(SHELL.map((u) => cache.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE && k !== FONT_CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function staleWhileRevalidate(request, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then((hit) => {
      const net = fetch(request).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // フォント: キャッシュ優先＋裏で更新
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
    return;
  }

  // 他オリジン(測定用CDNなど)は素通し
  if (url.origin !== self.location.origin) return;

  // ページ遷移: ネットワーク優先、オフライン時はキャッシュ
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./speedtest.html', copy));
        return res;
      }).catch(() => caches.match('./speedtest.html'))
    );
    return;
  }

  // 同一オリジンの静的ファイル
  event.respondWith(staleWhileRevalidate(req, CACHE));
});
