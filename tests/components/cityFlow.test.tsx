import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CityMap from '../../src/features/city/CityMap'
import EventPage from '../../src/features/city/EventPage'
import ScenePage from '../../src/features/city/ScenePage'
import { useGameStore } from '../../src/store/gameStore'

function renderEvent() {
  return render(
    <MemoryRouter initialEntries={['/event/bench']}>
      <Routes><Route path="/event/:eventId" element={<EventPage />} /></Routes>
    </MemoryRouter>,
  )
}

describe('city main loop', () => {
  beforeEach(() => {
    useGameStore.getState().resetProgress()
    useGameStore.getState().completeOnboarding({ name: '旅人', avatarId: 'chenguang', lifeStages: [], topics: [] })
  })

  it('exposes all eight map destinations as named links', () => {
    render(<MemoryRouter><CityMap /></MemoryRouter>)
    expect(screen.getAllByRole('link', { name: /^前往/ })).toHaveLength(8)
    expect(screen.getByRole('link', { name: '前往中央广场' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '前往远方' })).toBeInTheDocument()
  })

  it('creates one consented experience and keeps it after remount', async () => {
    const user = userEvent.setup()
    const first = renderEvent()
    await user.click(screen.getByText('在他旁边坐下'))
    await user.click(screen.getByText('把这次经历用于阶段回顾'))
    await user.click(screen.getByRole('button', { name: '保存这次经历' }))
    expect(screen.getByRole('heading', { name: '这次相遇，已经留下。' })).toBeInTheDocument()
    expect(useGameStore.getState().save.experiences).toHaveLength(1)
    expect(useGameStore.getState().save.experiences[0]?.consent).toBe(true)
    first.unmount()

    renderEvent()
    expect(screen.getByRole('heading', { name: '这次相遇，已经留下。' })).toBeInTheDocument()
    expect(useGameStore.getState().save.experiences).toHaveLength(1)
  })

  it('shows an explicit empty state for an unknown scene', () => {
    render(<MemoryRouter initialEntries={['/scene/missing']}><Routes><Route path="/scene/:sceneId" element={<ScenePage />} /></Routes></MemoryRouter>)
    expect(screen.getByRole('heading', { name: '这个地点还没有画进地图' })).toBeInTheDocument()
  })
})
