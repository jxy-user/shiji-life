import { SCENE_IDS, TIME_SLOTS } from '@/game/saveEnums'
import { SAVE_VERSION } from '@/game/saveVersion'
import { readRawSave } from '@/services/storage'

/**
 * 首屏用的轻量存档判断
 *
 * 只决定「继续旅程」能不能点。检查到字段类型与取值为止：
 * JSON 可解析、版本号合法、角色/章节/场景/时间/精力/经历/设置等必需字段齐全。
 *
 * 不做完整 schema 校验——那需要 zod，会把校验库带进首包。
 * 剩余边界：字段齐全但内部结构损坏（例如某条经历缺字段）仍可能通过这里，
 * 那种情况由 loadSave 拒绝，并由城市页给出「存档读不出来」的提示。
 */

const SCENE_SET = new Set<string>(SCENE_IDS)
const TIME_SLOT_SET = new Set<string>(TIME_SLOTS)

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function hasPlayableSave(): boolean {
  const raw = readRawSave()
  if (!raw) return false

  try {
    const data: unknown = JSON.parse(raw)
    if (!isRecord(data)) return false

    const version = data.version
    if (
      typeof version !== 'number' ||
      !Number.isInteger(version) ||
      version < 1 ||
      version > SAVE_VERSION
    ) {
      return false
    }

    const profile = data.profile
    if (
      !isRecord(profile) ||
      typeof profile.nickname !== 'string' ||
      profile.nickname.trim().length === 0
    ) {
      return false
    }

    if (data.chapter !== 'chapter_01') return false
    if (typeof data.currentScene !== 'string' || !SCENE_SET.has(data.currentScene)) {
      return false
    }
    if (
      typeof data.gameDay !== 'number' ||
      !Number.isInteger(data.gameDay) ||
      data.gameDay < 1
    ) {
      return false
    }
    if (typeof data.timeSlot !== 'string' || !TIME_SLOT_SET.has(data.timeSlot)) {
      return false
    }
    if (
      typeof data.energy !== 'number' ||
      !Number.isFinite(data.energy) ||
      data.energy < 0 ||
      data.energy > 100
    ) {
      return false
    }
    // v1 存档没有这些字段，迁移会补上；不要因为旧版本字段缺失就把玩家挡在门外
    if (version >= 2) {
      if (!Array.isArray(data.experiences) || !Array.isArray(data.seenEventIds)) {
        return false
      }
      const settings = data.settings
      if (!isRecord(settings) || typeof settings.analysisConsentDefault !== 'boolean') {
        return false
      }
    }

    if (version >= 3) {
      if (!Array.isArray(data.reflections) || !Array.isArray(data.insights)) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}
