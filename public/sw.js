/**
 * 旧版 PWA 的清理 Worker。
 *
 * 新版本不再使用 Service Worker；这个文件沿用原 /sw.js 地址，
 * 让仍被旧 Worker 控制的浏览器能拿到更新：激活后清空全部缓存、
 * 注销自身并刷新所有窗口，随后页面走正常网络加载新版本。
 */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim()
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
      await self.registration.unregister()
      const clients = await self.clients.matchAll({ type: 'window' })
      for (const client of clients) {
        client.navigate(client.url).catch(() => {})
      }
    })(),
  )
})
