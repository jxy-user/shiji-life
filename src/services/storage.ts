/**
 * 本地存档存储层
 *
 * MVP 阶段使用 localStorage（本地存储）；后续接入服务端时，
 * 只需替换本文件实现，页面不应直接访问 localStorage。
 * 读取失败一律视为“无存档”，不静默覆盖玩家数据。
 */

export const SAVE_KEY = 'shiji-life:save:v1'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    // 隐私模式或存储被禁用
    return null
  }
}

export function readRawSave(): string | null {
  return getStorage()?.getItem(SAVE_KEY) ?? null
}

export function writeRawSave(value: string): boolean {
  const storage = getStorage()
  if (!storage) return false
  try {
    storage.setItem(SAVE_KEY, value)
    return true
  } catch {
    return false
  }
}

export function clearSave(): void {
  getStorage()?.removeItem(SAVE_KEY)
}

export function hasSave(): boolean {
  return readRawSave() !== null
}
