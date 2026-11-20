import { afterEach, describe, expect, it, vi } from 'vitest'

import { loadSave } from '@/services/saveService'

describe('存储不可用时的行为', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('读取抛异常时返回无存档，而不是让页面崩溃', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })

    const storage = await import('@/services/storage')

    expect(() => storage.readRawSave()).not.toThrow()
    expect(storage.readRawSave()).toBeNull()
    expect(loadSave()).toBeNull()
  })

  it('写入抛异常时返回 false', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError')
    })

    const storage = await import('@/services/storage')

    expect(storage.writeRawSave('{}')).toBe(false)
  })

  it('清除抛异常时不抛出，也不假装成功', async () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError')
    })

    const storage = await import('@/services/storage')

    expect(() => storage.clearSave()).not.toThrow()
  })
})
