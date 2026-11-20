import { SAVE_VERSION } from '@/game/saveVersion'
import { readRawSave } from '@/services/storage'

/**
 * 首屏用的轻量存档判断
 *
 * 只做「能不能点继续」这一件事：JSON 可解析、版本号合法、有昵称。
 * 不做完整校验——那需要 zod，会把校验库带进首包；真正的读取仍走 loadSave。
 * 这里宁可严格：拿不准就当作没有存档，让玩家走新游戏，而不是点进坏档又被弹回首页。
 */
export function hasPlayableSave(): boolean {
  const raw = readRawSave()
  if (!raw) return false

  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return false

    const record = data as { version?: unknown; profile?: unknown }
    if (
      typeof record.version !== 'number' ||
      !Number.isInteger(record.version) ||
      record.version < 1 ||
      record.version > SAVE_VERSION
    ) {
      return false
    }

    const profile = record.profile as { nickname?: unknown } | undefined
    return typeof profile?.nickname === 'string' && profile.nickname.trim().length > 0
  } catch {
    return false
  }
}
