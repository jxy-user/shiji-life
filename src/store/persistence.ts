import { saveSchema } from '../domain/schema'
import { createEmptySave } from '../domain/state'
import type { SaveV2 } from '../domain/types'

export const SAVE_KEY = 'shiji.life.v2'
export const LEGACY_SAVE_KEY = 'shiji.life.v1'

export type StorageStatus = 'ready' | 'broken' | 'unavailable'

export interface LoadResult {
  save: SaveV2
  status: StorageStatus
  message: string | null
}

export interface WriteResult {
  status: StorageStatus
  message: string | null
}

export function loadSave(): LoadResult {
  try {
    const raw = globalThis.localStorage?.getItem(SAVE_KEY)
    if (!raw) return { save: createEmptySave(), status: 'ready', message: null }
    return { save: saveSchema.parse(JSON.parse(raw)), status: 'ready', message: null }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'SecurityError') {
      return {
        save: createEmptySave(),
        status: 'unavailable',
        message: '浏览器阻止了本地存储。你仍可使用页面，但刷新后记录可能不会保留。',
      }
    }
    return {
      save: createEmptySave(),
      status: 'broken',
      message: '本地存档无法读取。为了保护你的记录，没有覆盖原文件；你可以重新开始。',
    }
  }
}

export function writeSave(save: SaveV2): WriteResult {
  try {
    const validated = saveSchema.parse(save)
    globalThis.localStorage?.setItem(SAVE_KEY, JSON.stringify(validated))
    if (!globalThis.localStorage) {
      return { status: 'unavailable', message: '当前环境不支持本地存储，刷新后记录可能不会保留。' }
    }
    return { status: 'ready', message: null }
  } catch (error) {
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'SecurityError')) {
      return { status: 'unavailable', message: '本地存储不可用或空间不足。当前更改仍保留在本次会话中。' }
    }
    return { status: 'broken', message: '当前更改无法通过存档校验，未写入本地存储。' }
  }
}

export function clearSave(): WriteResult {
  try {
    globalThis.localStorage?.removeItem(SAVE_KEY)
    return { status: 'ready', message: null }
  } catch {
    return { status: 'unavailable', message: '无法清除本地存档，请在浏览器设置中手动删除。' }
  }
}
