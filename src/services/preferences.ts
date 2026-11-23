/**
 * 轻量用户偏好（本地存储）
 *
 * 与游戏存档分开：这里只放界面偏好（例如「不再提示安装」）。
 * 存储被禁用时（隐私模式、Iframe 策略、SecurityError）必须安全降级：
 * 读返回 null、写静默忽略，绝不能抛异常导致页面白屏。
 */

export const PWA_INSTALL_DISMISSED_KEY = 'pwa-install-dismissed'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    // 某些浏览器在隐私模式下访问 localStorage 的 getter 本身就会抛错
    return window.localStorage
  } catch {
    return null
  }
}

/** 读取偏好；存储不可用或读取被拦截时返回 null（按「无偏好」处理） */
export function readPreference(key: string): string | null {
  const storage = getStorage()
  if (!storage) return null
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

/** 写入偏好；存储不可用时静默忽略（偏好只在本次会话生效） */
export function writePreference(key: string, value: string): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(key, value)
  } catch {
    // 忽略：写入失败不应影响游戏主流程
  }
}
