import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// 用受控的 hook 返回值验证「同一时间只显示一个提示」的互斥规则
vi.mock('@/hooks/usePWA', () => ({
  usePWANotifications: () => ({
    showUpdateToast: true,
    dismissUpdateToast: vi.fn(),
    applyUpdate: vi.fn(),
    showOfflineToast: true,
    installed: false,
  }),
}))

import { PWANotifications } from '@/components/pwa/PWANotifications'

describe('PWANotifications 提示互斥', () => {
  it('更新与离线同时就绪时，只显示更新提示', () => {
    render(<PWANotifications />)

    expect(screen.getByText('有新版本可用')).toBeInTheDocument()
    expect(screen.queryByText('您当前处于离线状态')).not.toBeInTheDocument()
  })
})
