import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import App from './App'

// PWA 通知依赖浏览器能力，路由测试里替换为静态空状态
vi.mock('@/hooks/usePWA', () => ({
  usePWANotifications: () => ({
    showUpdateToast: false,
    dismissUpdateToast: vi.fn(),
    applyUpdate: vi.fn(),
    showOfflineToast: false,
    installed: false,
  }),
}))

describe('App 路由', () => {
  it('已移除的旧路径（/city）回退到门厅', async () => {
    render(
      <MemoryRouter initialEntries={['/city']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })

  it('已移除的旧路径（/archive）回退到门厅', async () => {
    render(
      <MemoryRouter initialEntries={['/archive']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })
})
