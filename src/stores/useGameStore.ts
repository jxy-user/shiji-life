import { create } from 'zustand'

import {
  createInitialSave,
  type PlayerProfile,
  type SaveData,
  type SceneId,
  type TimeSlot,
} from '@/game/saveSchema'
import { loadSave, persistSave } from '@/services/saveService'
import { clearSave } from '@/services/storage'

const TIME_ORDER: TimeSlot[] = ['morning', 'noon', 'afternoon', 'evening']

/** 新一天恢复的精力值，属于游戏规则，不放在 UI 里 */
const NEW_DAY_ENERGY = 60

type GameState = {
  /** 当前存档；null 表示还没有开始游戏 */
  save: SaveData | null
  hasSave: boolean
  /** 最近一次写盘是否失败（隐私模式、存储配额等），失败时页面要提示玩家 */
  persistenceError: boolean

  /** 从本地存储重新读取（进入开始页时调用） */
  loadFromStorage: () => void
  /** 兼容开始页的旧入口，等价于 loadFromStorage */
  refreshSaveState: () => void

  /** 创建新角色并开始第一章 */
  beginJourney: (profile: PlayerProfile) => void
  updateProfile: (patch: Partial<PlayerProfile>) => boolean
  goToScene: (scene: SceneId) => void
  setFlag: (key: string, value?: boolean) => void
  changeEnergy: (delta: number) => void
  /** 推进一个时段；跨过夜晚则进入下一天 */
  advanceTime: () => void
  /** 彻底清除存档（设置页的「删除数据」使用） */
  resetProgress: () => void
}

/**
 * 全局游戏状态
 *
 * 所有状态变化都必须经过这里的 action，由游戏引擎决定结果；
 * AI 只能读取用于回顾的经历，永远不能调用这里的写操作。
 */
export const useGameStore = create<GameState>()((set, get) => {
  /**
   * 统一提交：内存状态始终更新（玩家可以继续玩），
   * 写盘结果单独返回并记录到 persistenceError，由界面提示。
   */
  function commit(next: SaveData): boolean {
    const persisted = persistSave(next)
    set({ save: next, hasSave: persisted, persistenceError: !persisted })
    return persisted
  }

  function mutate(updater: (save: SaveData) => SaveData) {
    const current = get().save
    if (!current) return
    commit(updater(current))
  }

  return {
    save: loadSave(),
    hasSave: loadSave() !== null,
    persistenceError: false,

    loadFromStorage: () => {
      const save = loadSave()
      // 不清除 persistenceError：它记录的是「最近一次写盘失败」，
      // 只有真正写成功（commit）才能恢复，否则读一次页面就把警告抹掉了
      set({ save, hasSave: save !== null })
    },

    refreshSaveState: () => {
      get().loadFromStorage()
    },

    beginJourney: (profile) => {
      commit(createInitialSave(profile))
    },

    updateProfile: (patch) => {
      const current = get().save
      if (!current) return false
      // 返回值反映真实写盘结果，而不是「内存里更新过了」
      return commit({ ...current, profile: { ...current.profile, ...patch } })
    },

    goToScene: (scene) => {
      mutate((save) => ({
        ...save,
        currentScene: scene,
        visitedScenes: save.visitedScenes.includes(scene)
          ? save.visitedScenes
          : [...save.visitedScenes, scene],
      }))
    },

    setFlag: (key, value = true) => {
      mutate((save) => ({ ...save, flags: { ...save.flags, [key]: value } }))
    },

    changeEnergy: (delta) => {
      mutate((save) => ({
        ...save,
        energy: Math.max(0, Math.min(100, save.energy + delta)),
      }))
    },

    advanceTime: () => {
      mutate((save) => {
        const index = TIME_ORDER.indexOf(save.timeSlot)
        const isNight = index === TIME_ORDER.length - 1
        if (!isNight) {
          return { ...save, timeSlot: TIME_ORDER[index + 1] }
        }
        return {
          ...save,
          gameDay: save.gameDay + 1,
          timeSlot: 'morning',
          energy: Math.min(100, save.energy + NEW_DAY_ENERGY),
        }
      })
    },

    resetProgress: () => {
      clearSave()
      set({ save: null, hasSave: false, persistenceError: false })
    },
  }
})
