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

/** 休息与新一天恢复的精力值，属于游戏规则，不放在 UI 里 */
const REST_ENERGY = 25
const NEW_DAY_ENERGY = 60

type GameState = {
  /** 当前存档；null 表示还没有开始游戏 */
  save: SaveData | null
  hasSave: boolean

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
  /** 统一提交：写盘成功后同步内存，失败则保持原状态 */
  function commit(next: SaveData) {
    if (!persistSave(next)) {
      // 存储不可用时仍允许继续游玩，只是无法恢复
      set({ save: next, hasSave: false })
      return
    }
    set({ save: next, hasSave: true })
  }

  function mutate(updater: (save: SaveData) => SaveData) {
    const current = get().save
    if (!current) return
    commit(updater(current))
  }

  return {
    save: loadSave(),
    hasSave: loadSave() !== null,

    loadFromStorage: () => {
      const save = loadSave()
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
      commit({ ...current, profile: { ...current.profile, ...patch } })
      return true
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
      set({ save: null, hasSave: false })
    },
  }
})

export { REST_ENERGY }
