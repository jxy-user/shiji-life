/**
 * Service Worker for 拾己 · LIFE
 * 策略：
 * - 静态资源：Cache First（构建时预缓存）
 * - HTML/导航：Network First（保证最新）
 * - 其他：Stale While Revalidate
 * - 存档数据：IndexedDB 同步（由主线程管理，SW 不直接操作）
 */

const CACHE_NAME = 'shiji-life-v1';
const STATIC_CACHE = 'shiji-static-v1';
const DYNAMIC_CACHE = 'shiji-dynamic-v1';

// 预缓存清单（构建时由 vite-plugin-pwa 自动注入，这里留作兜底）
const PRECACHE_MANIFEST = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// 需要缓存的静态资源模式
const STATIC_PATTERNS = [
  /\.(?:js|css|woff2?|ttf|eot)$/,
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
];

// 不缓存的路径
const EXCLUDE_PATTERNS = [
  /^\/api\//,
  /\/dev\//,
  /chrome-extension:\/\//,
];

/** 判断是否为静态资源 */
function isStaticAsset(url) {
  return STATIC_PATTERNS.some(pattern => pattern.test(url.pathname));
}

/** 判断是否为导航请求 */
function isNavigationRequest(request) {
  return request.mode === 'navigate' ||
    (request.headers.get('Accept') || '').includes('text/html');
}

/** 判断是否应排除 */
function shouldExclude(url) {
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(url.pathname + url.search));
}

/** 从缓存获取 */
async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('离线：资源不可用', { status: 503 });
  }
}

/** 网络优先 */
async function networkFirst(request, cacheName = DYNAMIC_CACHE) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response('离线：无法加载页面', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

/** 过期即重验 */
async function staleWhileRevalidate(request, cacheName = DYNAMIC_CACHE) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

/** 安装：预缓存核心资源 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_MANIFEST))
      .then(() => self.skipWaiting())
  );
});

/** 激活：清理旧缓存 */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => ![STATIC_CACHE, DYNAMIC_CACHE, CACHE_NAME].includes(key))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/** 拦截请求 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== location.origin) return;

  // 排除模式
  if (shouldExclude(url)) return;

  // 导航请求：Network First（保证 HTML 最新）
  if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // 静态资源：Cache First
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 其他：Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request));
});

/** 消息通信：主线程可触发更新检查 */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CHECK_UPDATE') {
    self.registration.update().then(() => {
      event.ports[0]?.postMessage({ type: 'UPDATE_CHECKED' });
    });
  }
});

/** 后台同步（可选）：网络恢复时同步存档 */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-save') {
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SYNC_SAVE' }));
      })
    );
  }
});