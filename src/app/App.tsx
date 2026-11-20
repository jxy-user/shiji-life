import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { PersistenceNotice } from '@/components/layout/PersistenceNotice'
import PlaceholderPage from '@/pages/PlaceholderPage'
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
const SettingsPage = lazy(() => import('@/pages/SettingsPage'))

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
 * 路由表
 *
 * 已实现：开始页、开场、角色创建、城市、区域场景、事件、人生档案、设置。
 * 仍在建造：日记、现实行动（M5）。
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
          <Route path="/settings" element={<SettingsPage />} />

          <Route
            path="/journal"
            element={
              <PlaceholderPage
                kicker="日记"
                title="只写给自己看"
                description="默认不进入任何分析。你写下的内容属于你，随时可以修改或删除。"
              />
            }
          />
          <Route
            path="/actions"
            element={
              <PlaceholderPage
                kicker="行动"
                title="带回到现实"
                description="从一条确认过的认知出发，做一件小事。没完成也没关系，可以暂停，也可以放弃。"
              />
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* 写盘失败时在所有页面统一提示，避免玩家在不知情的情况下丢进度 */}
      <PersistenceNotice />
    </>
  )
}
