import { saveSchema, type SaveData } from '@/game/saveSchema'
import { SAVE_VERSION } from '@/game/saveVersion'
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
  // 只接受正整数版本号：0、负数、小数一律视为无效存档
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) return null
  return version
}

/**
 * 存档迁移入口：按 version 逐级向上升。
 *
 * 原则：迁移只做「补齐新字段」这类可逆操作，不改写已有内容；
 * 迁移失败宁可当作无存档，也不返回残缺数据；禁止静默丢弃玩家进度。
 */
export function migrateSave(input: unknown): unknown {
  if (typeof input !== 'object' || input === null) return input

  const save = { ...(input as Record<string, unknown>) }
  const version = readVersion(save)

  // 只迁移明确识别到的已知版本；未知版本不猜，交给 loadSave 拒绝
  if (version === 1) {
    if (!Array.isArray(save.experiences)) save.experiences = []
    if (!Array.isArray(save.seenEventIds)) save.seenEventIds = []
    if (typeof save.settings !== 'object' || save.settings === null) {
      // 隐私优先：旧存档升级后默认不授权分析，玩家需要自己打开
      save.settings = { analysisConsentDefault: false }
    }
    save.version = SAVE_VERSION
  }

  return save
}

/** 读取并校验存档；任何异常都返回 null，绝不覆盖原始数据 */
export function loadSave(): SaveData | null {
  const raw = readRawSave()
  if (!raw) return null

  try {
    const stored: unknown = JSON.parse(raw)
    const version = readVersion(stored)
    // 高于当前版本、或版本号非法时一律拒绝，不猜测、不覆盖
    if (version === null || version > SAVE_VERSION) return null

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
