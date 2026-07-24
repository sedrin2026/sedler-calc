const CACHE_NAME = 'cyber-calc-v22';
const ASSETS = [
  './',
  './index.html'
];

// インストール時にキャッシュを保存
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ：ネットワーク優先（オフライン時はキャッシュを使用）
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // ネットにつながる場合はそのまま返しつつ、キャッシュも更新
        let responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // オフラインの時はキャッシュから返す
        return caches.match(e.request);
      })
  );
});
