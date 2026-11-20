import { saveSchema, type SaveData } from '@/game/saveSchema'
import { readRawSave, writeRawSave } from '@/services/storage'

/**
 * 存档读写（业务层）
 *
 * 职责：校验、版本检查、损坏保护。
 * 本地存储的细节仍然只在 storage.ts 里出现，页面不直接访问。
 */

function readVersion(input: unknown): number | null {
  if (typeof input !== 'object' || input === null) return null
  const version = (input as { version?: unknown }).version
  return typeof version === 'number' ? version : null
}

/**
 * 存档迁移入口。
 *
 * 当前只有 v1，直接放行。未来升级版本时在这里按 version 逐级转换，
 * 例如：v1 → v2 补齐新字段的默认值。
 * 原则：迁移失败宁可当作无存档，也不返回残缺数据；禁止静默丢弃玩家进度。
 */
export function migrateSave(input: unknown): unknown {
  return input
}

/** 读取并校验存档；任何异常都返回 null，绝不覆盖原始数据 */
export function loadSave(): SaveData | null {
  const raw = readRawSave()
  if (!raw) return null

  try {
    const stored: unknown = JSON.parse(raw)
    if (readVersion(stored) === null) return null

    const migrated = migrateSave(stored)
    const parsed = saveSchema.safeParse(migrated)
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
