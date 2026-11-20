import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/app/App'
import { loadSave } from '@/services/saveService'
import { useGameStore } from '@/stores/useGameStore'

beforeEach(() => {
  window.localStorage.clear()
  useGameStore.setState({ save: null, hasSave: false, persistenceError: false })
})

function renderApp() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  )
}

describe('首章流程', () => {
  it('从首页走完开场与建角，进入城市并写入存档', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: '开始新的旅程' }))

    // 五幕：雨 → 房间 → 信（有一次选择）→ 地图 → 门
    await user.click(screen.getByRole('button', { name: '继续' }))
    await user.click(screen.getByRole('button', { name: '继续' }))
    await user.click(screen.getByRole('button', { name: '把信读完' }))
    await user.click(screen.getByRole('button', { name: '继续' }))
    await user.click(screen.getByRole('button', { name: '继续' }))
    await user.click(screen.getByRole('button', { name: '推开门' }))

    expect(
      screen.getByRole('heading', { name: '你想怎样被称呼' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '推门，进入城市' }))

    expect(
      screen.getByRole('heading', { name: /想去哪里走走/ }),
    ).toBeInTheDocument()

    const save = loadSave()
    expect(save?.profile.nickname).toBe('旅人')
    expect(save?.currentScene).toBe('plaza')
  })

  it('开场可以整体跳过，直接建角', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: '开始新的旅程' }))
    await user.click(screen.getByRole('button', { name: '跳过开场' }))

    expect(
      screen.getByRole('heading', { name: '你想怎样被称呼' }),
    ).toBeInTheDocument()
  })
})
