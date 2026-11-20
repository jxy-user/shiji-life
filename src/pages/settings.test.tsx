import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/app/App'
import { loadSave } from '@/services/saveService'
import { useGameStore } from '@/stores/useGameStore'

beforeEach(() => {
  window.localStorage.clear()
  useGameStore.setState({ save: null, hasSave: false })
  // 走真实入口写入存档，保证 loadSave() 能读到
  useGameStore.getState().beginJourney({
    nickname: '小满',
    avatarId: 'sun',
    lifeStage: null,
    explorationTopic: null,
  })
})

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <App />
    </MemoryRouter>,
  )
}

describe('设置', () => {
  it('默认不授权分析，切换后写入存档', async () => {
    const user = userEvent.setup()
    renderSettings()

    const toggle = await screen.findByRole('switch', {
      name: '新经历默认允许用于回顾',
    })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(loadSave()?.settings.analysisConsentDefault).toBe(false)

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(loadSave()?.settings.analysisConsentDefault).toBe(true)
  })

  it('删除数据需要二次确认', async () => {
    const user = userEvent.setup()
    renderSettings()

    await user.click(await screen.findByRole('button', { name: '删除全部数据' }))
    expect(loadSave()).not.toBeNull()

    await user.click(
      screen.getByRole('button', { name: /再次点击，确认删除全部数据/ }),
    )

    expect(loadSave()).toBeNull()
  })
})
