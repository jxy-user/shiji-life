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
  const storage = getStorage()
  if (!storage) return null
  try {
    return storage.getItem(SAVE_KEY)
  } catch {
    // 隐私模式或安全策略可能让 getItem 直接抛 SecurityError，
    // 这里必须兜住，否则应用会在启动阶段白屏
    return null
  }
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

/** 返回值表示是否真的清除成功，调用方不得把失败当成删除完成 */
export function clearSave(): boolean {
  const storage = getStorage()
  if (!storage) return false
  try {
    storage.removeItem(SAVE_KEY)
    return true
  } catch {
    return false
  }
}

export function hasSave(): boolean {
  return readRawSave() !== null
}
