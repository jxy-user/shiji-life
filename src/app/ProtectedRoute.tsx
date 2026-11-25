import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useGameStore } from '../store/gameStore'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const createdAt = useGameStore((state) => state.save.profile.createdAt)
  const location = useLocation()
  if (!createdAt) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/create?next=${encodeURIComponent(next)}`} replace />
  }
  return children
}
