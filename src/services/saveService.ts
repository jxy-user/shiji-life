import { saveSchema, type SaveData } from '@/game/saveSchema'
import { readRawSave, writeRawSave } from '@/services/storage'

/**
 * 存档读写（业务层）
 *
 * 职责：校验、版本检查、损坏保护。
 * 本地存储的细节仍然只在 storage.ts 里出现，页面不直接访问。
 */

/** 读取并校验存档；任何异常都返回 null，绝不覆盖原始数据 */
export function loadSave(): SaveData | null {
  const raw = readRawSave()
  if (!raw) return null

  try {
    const parsed = saveSchema.safeParse(JSON.parse(raw))
    if (!parsed.success) return null
    return parsed.data
  } catch {
    return null
  }
}

/** 写入存档，自动刷新 updatedAt；写入失败时返回 false，由调用方提示玩家 */
export function persistSave(save: SaveData): boolean {
  return writeRawSave(
    JSON.stringify({
      ...save,
      updatedAt: new Date().toISOString(),
    }),
  )
}

export function hasValidSave(): boolean {
  return loadSave() !== null
}
