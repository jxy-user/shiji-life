import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { PWANotifications } from '@/components/pwa/PWANotifications'
import StartPage from '@/pages/StartPage'

/**
 * 路由级代码分割
 *
 * 首屏只保留门厅；人生线与回放按访问时加载。
 */
const LifePage = lazy(() => import('@/pages/LifePage'))
const LifeReplayPage = lazy(() => import('@/pages/LifeReplayPage'))

function RouteFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-dvh place-items-center bg-cream-50 text-[12px] tracking-[0.35em] text-ink-500"
    >
      正在进入…
    </div>
  )
}

/**
 * 从门厅白幕进入游戏时，让白幕先盖住新页面再淡出，
 * 避免白底直接切成深色页面。动画结束后的图层不拦截点击。
 */
function CurtainArrival() {
  const location = useLocation()
  const fromCurtain = Boolean(
    (location.state as { fromCurtain?: boolean } | null)?.fromCurtain,
  )
  if (!fromCurtain) return null
  return (
    <div
      key={location.key}
      aria-hidden
      data-arrival-curtain
      className="curtain-arrival pointer-events-none fixed inset-0 z-[100] bg-white"
    />
  )
}

export default function App() {
  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<StartPage />} />
          <Route path="/life" element={<LifePage />} />
          <Route path="/life/replay" element={<LifeReplayPage />} />
          {/* 旧路径（/city、/archive 等）已移除：回到门厅并提示一句 */}
          <Route path="*" element={<Navigate to="/" replace state={{ unknownPath: true }} />} />
        </Routes>
      </Suspense>

      <CurtainArrival />

      {/* PWA 通知：更新就绪、离线 */}
      <PWANotifications />
    </>
  )
}
