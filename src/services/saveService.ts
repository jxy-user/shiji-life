import { saveSchema, type SaveData } from '@/game/saveSchema'
import { SAVE_VERSION } from '@/game/saveVersion'
import { readRawSave, writeRawSave } from '@/services/storage'

/**
 * 存档读写（业务层）
 *
 * 职责：校验、版本检查、损坏保护。
 * 本地存储的细节仍然只在 storage.ts 里出现，页面不直接访问。
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

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

  // 只迁移明确识别到的已知版本；未知版本不猜，交给 loadSave 拒绝。
  // 逐级向上：v1 → v2 → v3 → v4，保证每一步都有确定的含义。
  let current = version

  if (current === 1) {
    if (!Array.isArray(save.experiences)) save.experiences = []
    if (!Array.isArray(save.seenEventIds)) save.seenEventIds = []
    if (!isRecord(save.settings)) {
      // 隐私优先：旧存档升级后默认不授权分析，玩家需要自己打开
      save.settings = { analysisConsentDefault: false }
    }
    current = 2
    save.version = 2
  }

  if (current === 2) {
    // 旧经历没有选择标签，补空数组；不改写其余内容
    save.experiences = Array.isArray(save.experiences)
      ? save.experiences.map((experience) =>
          isRecord(experience) && !Array.isArray(experience.choiceTags)
            ? { ...experience, choiceTags: [] }
            : experience,
        )
      : []
    if (!Array.isArray(save.reflections)) save.reflections = []
    if (!Array.isArray(save.candidateInsights)) save.candidateInsights = []
    if (!Array.isArray(save.insights)) save.insights = []
    save.settings = {
      analysisConsentDefault: false,
      ...(isRecord(save.settings) ? save.settings : {}),
      reflectionThreshold: 3,
      minExperienceTypes: 2,
      invitationsEnabled: true,
    }
    current = 3
    save.version = 3
  }

  if (current === 3) {
    // M5 新增字段：补空数组，不改动既有数据
    if (!Array.isArray(save.actions)) save.actions = []
    if (!Array.isArray(save.journalEntries)) save.journalEntries = []
    if (!Array.isArray(save.chapterSummaries)) save.chapterSummaries = []
    save.version = 4
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
