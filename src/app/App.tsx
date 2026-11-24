import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { PersistenceNotice } from '@/components/layout/PersistenceNotice'
import { PWANotifications } from '@/components/pwa/PWANotifications'
import StartPage from '@/pages/StartPage'

/**
 * 路由级代码分割
 *
 * 首屏只保留开始页与基础运行时；其余页面按访问时加载，
 * 避免评委/玩家在首页就下载整个游戏（含四个场景插画与事件页）。
 */
const ProloguePage = lazy(() => import('@/pages/ProloguePage'))
const CreatePage = lazy(() => import('@/pages/CreatePage'))
const CityPage = lazy(() => import('@/pages/CityPage'))
const ScenePage = lazy(() => import('@/pages/ScenePage'))
const EventPage = lazy(() => import('@/pages/EventPage'))
const ArchivePage = lazy(() => import('@/pages/ArchivePage'))
const ReflectionPage = lazy(() => import('@/pages/ReflectionPage'))
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))
const ActionsPage = lazy(() => import('@/pages/ActionsPage'))
const JournalPage = lazy(() => import('@/pages/JournalPage'))
const PeoplePage = lazy(() => import('@/pages/PeoplePage'))
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

/**
 * 路由表
 *
 * 已实现：开始页、开场、角色创建、城市、区域场景、事件、人生档案、设置、现实行动、日记。
 * 地址形态为 #/path，原因见 main.tsx。
 */
export default function App() {
  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<StartPage />} />

          <Route path="/prologue" element={<ProloguePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/city" element={<CityPage />} />
          <Route path="/scene/:sceneId" element={<ScenePage />} />
          <Route path="/event/:eventId" element={<EventPage />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/reflection" element={<ReflectionPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/actions" element={<ActionsPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/life" element={<LifePage />} />
          <Route path="/life/replay" element={<LifeReplayPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      <CurtainArrival />

      {/* 写盘失败时在所有页面统一提示，避免玩家在不知情的情况下丢进度 */}
      <PersistenceNotice />

      {/* PWA 通知：更新就绪、离线、安装引导 */}
      <PWANotifications />
    </>
  )
}
