import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

import { PWANotifications } from '@/components/pwa/PWANotifications'

// 测试环境不真正注册 Service Worker
vi.mock('workbox-window', () => ({
  Workbox: class {
    addEventListener = vi.fn()
    register = vi.fn().mockResolvedValue(undefined)
  },
}))

/** 触发浏览器的 beforeinstallprompt（安装提示事件） */
function dispatchInstallPrompt() {
  const mockPrompt = {
    preventDefault: vi.fn(),
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome: 'accepted' as const }),
  }
  const event = new CustomEvent('beforeinstallprompt')
  Object.assign(event, mockPrompt)
  act(() => {
    window.dispatchEvent(event)
  })
  return mockPrompt
}

/**
 * 回归测试：Storage（本地存储）被禁用时必须安全降级
 *
 * 曾出现的 bug：安装事件触发后，读取「不再提示」偏好直接调用 localStorage，
 * 在隐私模式下抛 SecurityError，导致首页白屏、无法开始旅程。
 */
describe('PWANotifications 在存储被禁用时', () => {
  let getItemSpy: ReturnType<typeof vi.spyOn>
  let setItemSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('read blocked', 'SecurityError')
    })
    setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('write blocked', 'SecurityError')
    })
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
  })

  afterEach(() => {
    getItemSpy.mockRestore()
    setItemSpy.mockRestore()
    vi.useRealTimers()
  })

  it('读取偏好抛错也不白屏，安装卡仍能显示', () => {
    render(<PWANotifications />)

    dispatchInstallPrompt()
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    expect(screen.getByText('安装「拾己 · LIFE」')).toBeInTheDocument()
  })

  it('点击“不了”时写入偏好抛错也不崩溃，安装卡正常关闭', () => {
    render(<PWANotifications />)

    dispatchInstallPrompt()
    act(() => {
      vi.advanceTimersByTime(3100)
    })

    fireEvent.click(screen.getByRole('button', { name: '不了' }))

    expect(screen.queryByText('安装「拾己 · LIFE」')).not.toBeInTheDocument()
  })
})
