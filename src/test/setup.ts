import '@testing-library/jest-dom/vitest'

import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// matchMedia polyfill for jsdom（用于 PWA installed 检测）
if (typeof window.matchMedia === 'undefined') {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

// jsdom 不实现 canvas；特效组件在拿不到上下文时会自行降级，这里静默探测避免测试输出噪音
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn(
    () => null,
  ) as unknown as typeof HTMLCanvasElement.prototype.getContext
}
