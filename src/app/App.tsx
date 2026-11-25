import { lazy, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { JourneyLayout, OnboardingLayout } from '../components/shell/Shell'
import { ToastRegion } from '../components/feedback/Feedback'
import { DialoguePanel } from '../features/dialogue/DialoguePanel'
import IntroGate from '../motion/components/IntroGate'
import ChapterCurtain from '../motion/components/ChapterCurtain'
import { sfx } from '../motion/sound/SfxEngine'
import { syncGameStoreFromStorage } from '../store/gameStore'
import StartPage from '../features/onboarding/StartPage'
import ProloguePage from '../features/onboarding/ProloguePage'
import CreatePage from '../features/onboarding/CreatePage'
import ProtectedRoute from './ProtectedRoute'

const CityPage = lazy(() => import('../features/city/CityPage'))
const ScenePage = lazy(() => import('../features/city/ScenePage'))
const EventPage = lazy(() => import('../features/city/EventPage'))
const ArchivePage = lazy(() => import('../features/archive/ArchivePage'))
const ReflectionPage = lazy(() => import('../features/reflection/ReflectionPage'))
const JournalPage = lazy(() => import('../features/journal/JournalPage'))
const ActionsPage = lazy(() => import('../features/actions/ActionsPage'))
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'))
const NotFoundPage = lazy(() => import('../features/NotFoundPage'))

function RouteScroll() {
  const location = useLocation()
  useEffect(() => {
    document.getElementById('main-content')?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
    // 每次换页重置「每场一次」的强音额度（impact / chime）
    sfx.resetScene()
  }, [location.pathname])
  return null
}

export default function App() {
  useEffect(() => {
    window.addEventListener('storage', syncGameStoreFromStorage)
    const unlockAudio = () => sfx.resume()
    window.addEventListener('pointerdown', unlockAudio, { once: true, capture: true })
    window.addEventListener('keydown', unlockAudio, { once: true, capture: true })
    return () => {
      window.removeEventListener('storage', syncGameStoreFromStorage)
      window.removeEventListener('pointerdown', unlockAudio, { capture: true })
      window.removeEventListener('keydown', unlockAudio, { capture: true })
    }
  }, [])

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <RouteScroll />
      <Routes>
        <Route element={<OnboardingLayout />}>
          <Route index element={<StartPage />} />
          <Route path="prologue" element={<ProloguePage />} />
          <Route path="create" element={<CreatePage />} />
        </Route>
        <Route element={<JourneyLayout />}>
          <Route path="city" element={<ProtectedRoute><CityPage /></ProtectedRoute>} />
          <Route path="scene/:sceneId" element={<ProtectedRoute><ScenePage /></ProtectedRoute>} />
          <Route path="event/:eventId" element={<ProtectedRoute><EventPage /></ProtectedRoute>} />
          <Route path="archive" element={<ProtectedRoute><ArchivePage /></ProtectedRoute>} />
          <Route path="reflection" element={<ProtectedRoute><ReflectionPage /></ProtectedRoute>} />
          <Route path="journal" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
          <Route path="actions" element={<ProtectedRoute><ActionsPage /></ProtectedRoute>} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <ToastRegion />
      <DialoguePanel />
      <ChapterCurtain />
      <IntroGate />
    </BrowserRouter>
  )
}
