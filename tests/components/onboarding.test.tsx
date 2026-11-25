import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { useGameStore } from '../../src/store/gameStore'
import StartPage from '../../src/features/onboarding/StartPage'
import ProloguePage from '../../src/features/onboarding/ProloguePage'
import CreatePage from '../../src/features/onboarding/CreatePage'
import ProtectedRoute from '../../src/app/ProtectedRoute'
import CityPage from '../../src/features/city/CityPage'

function renderRoutes(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/prologue" element={<ProloguePage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/city" element={<ProtectedRoute><CityPage /></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('onboarding flow', () => {
  beforeEach(() => {
    useGameStore.getState().resetProgress()
  })

  it('starts a fresh journey and disables continue without a save', async () => {
    const user = userEvent.setup()
    renderRoutes('/')
    expect(screen.getByRole('button', { name: '继续旅程' })).toBeDisabled()
    expect(screen.getByText('还没有本地存档')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '开始新的旅程' }))
    expect(screen.getByRole('heading', { name: '雨还没有停' })).toBeInTheDocument()
  })

  it('advances the prologue with Space', () => {
    renderRoutes('/prologue')
    fireEvent.keyDown(window, { code: 'Space' })
    expect(screen.getByRole('heading', { name: '桌上留着一封信' })).toBeInTheDocument()
  })

  it('uses the default traveler name when onboarding is skipped', async () => {
    const user = userEvent.setup()
    renderRoutes('/create')
    await user.click(screen.getByRole('button', { name: '先跳过' }))
    expect(screen.getByRole('heading', { name: '未完成之城', level: 1 })).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('shiji.life.v2')!).profile.name).toBe('旅人')
  })

  it('redirects a protected deep link to onboarding', () => {
    renderRoutes('/city')
    expect(screen.getByRole('heading', { name: /给今天的自己/ })).toBeInTheDocument()
  })

  it('stores the selected avatar and nickname', async () => {
    const user = userEvent.setup()
    renderRoutes('/create')
    await user.type(screen.getByRole('textbox', { name: /怎么称呼你/ }), '小满')
    await user.click(screen.getByRole('radio', { name: '夜色' }))
    await user.click(screen.getByRole('button', { name: '推门，进入城市' }))
    const save = JSON.parse(localStorage.getItem('shiji.life.v2')!)
    expect(save.profile.name).toBe('小满')
    expect(save.profile.avatarId).toBe('yese')
  })
})
