import { create } from 'zustand'

import {
  createInitialSave,
  type LifeExperience,
  type PlayerProfile,
  type SaveData,
  type SceneId,
  type TimeSlot,
} from '@/game/saveSchema'
import { loadSave, persistSave } from '@/services/saveService'
import { clearSave } from '@/services/storage'
import { useUiStore } from '@/stores/useUiStore'

const TIME_ORDER: TimeSlot[] = ['morning', 'noon', 'afternoon', 'evening']

/** 新一天恢复的精力值，属于游戏规则，不放在 UI 里 */
const NEW_DAY_ENERGY = 60

/** 新经历需要的字段：id、游戏内时间、创建时间与删除状态由存储层生成 */
export type NewExperienceInput = Pick<
  LifeExperience,
  | 'eventId'
  | 'eventTitle'
  | 'sceneId'
  | 'experienceType'
  | 'choiceId'
  | 'choiceText'
  | 'outcome'
  | 'analysisConsent'
> & {
  playerReason?: string | null
  playerFeeling?: string | null
}

/**
 * 一次事件完成所需的全部输入。
 *
 * 引擎必须把这组变更作为一次提交写盘：如果分步写，
 * 中途失败会留下「事件已读但没有经历」的半完成存档，刷新后无法重试。
 */
export type CompleteEventInput = {
  eventId: string
  eventTitle: string
  sceneId: SceneId
  experienceType: LifeExperience['experienceType']
  choiceId: string
  choiceText: string
  outcome: string[]
  effects?: {
    energy?: number
    advanceTime?: boolean
    flags?: Record<string, boolean>
  }
  /** 非广场事件完成时，标记「已经探索过城市」 */
  markExplored?: boolean
}

/** 玩家主动填写的内容才保存；空白一律存 null，绝不代写 */
function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed.slice(0, 200) : null
}

function createId(): string {
  const cryptoApi = globalThis.crypto
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

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
  /** 标记事件已经历，保证一次性事件不重复触发 */
  markEventSeen: (eventId: string) => void
  /** 记录一条经历；返回新经历的 id，没有存档时返回 null */
  recordExperience: (input: NewExperienceInput) => string | null
  /**
   * 原子完成一个事件：效果、已读标记与经历记录合并为一次写盘。
   * 事件已完成后再次调用不会产生任何变化（幂等）。
   */
  completeEvent: (input: CompleteEventInput) => {
    ok: boolean
    experienceId: string | null
  }
  /** 修改单条经历的回顾授权 */
  setExperienceConsent: (experienceId: string, consent: boolean) => void
  /** 保存玩家补充的理由；传空字符串等于清空 */
  setExperienceReason: (experienceId: string, reason: string) => void
  /** 修改「新经历默认授权」，只影响之后创建的经历 */
  setAnalysisConsentDefault: (value: boolean) => void
  /** 软删除：保留记录但不再展示、不再进入任何分析 */
  deleteExperience: (experienceId: string) => void
  changeEnergy: (delta: number) => void
  /** 推进一个时段；跨过夜晚则进入下一天 */
  advanceTime: () => void
  /** 彻底清除存档（设置页的「删除数据」使用）；返回是否真的清除成功 */
  resetProgress: () => boolean
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
    set({ save: next, hasSave: persisted })
    // 提示状态放在轻量 store 里，避免首包引入校验库
    useUiStore.getState().setPersistenceError(!persisted)
    return persisted
  }

  function mutate(updater: (save: SaveData) => SaveData) {
    const current = get().save
    if (!current) return
    commit(updater(current))
  }

  /** 时段推进规则，纯函数，供 advanceTime 与 completeEvent 共用 */
  function advanceSaveTime(save: SaveData): SaveData {
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
  }

  function clampEnergy(value: number): number {
    return Math.max(0, Math.min(100, value))
  }

  function buildExperience(
    current: SaveData,
    input: NewExperienceInput,
  ): LifeExperience {
    return {
      ...input,
      playerReason: normalizeOptionalText(input.playerReason),
      playerFeeling: normalizeOptionalText(input.playerFeeling),
      gameDay: current.gameDay,
      timeSlot: current.timeSlot,
      id: createId(),
      createdAt: new Date().toISOString(),
      deletedAt: null,
    }
  }

  return {
    save: loadSave(),
    hasSave: loadSave() !== null,

    loadFromStorage: () => {
      const save = loadSave()
      // 不清除写盘失败提示：它记录的是「最近一次写盘失败」，
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

    markEventSeen: (eventId) => {
      mutate((save) =>
        save.seenEventIds.includes(eventId)
          ? save
          : { ...save, seenEventIds: [...save.seenEventIds, eventId] },
      )
    },

    recordExperience: (input) => {
      const current = get().save
      if (!current) return null

      const experience = buildExperience(current, input)
      commit({
        ...current,
        experiences: [...current.experiences, experience],
      })
      return experience.id
    },

    completeEvent: (input) => {
      const current = get().save
      if (!current) return { ok: false, experienceId: null }

      // 幂等：已经完成过的事件不再重复应用效果或生成经历
      if (current.seenEventIds.includes(input.eventId)) {
        return { ok: true, experienceId: null }
      }

      let next: SaveData = {
        ...current,
        seenEventIds: [...current.seenEventIds, input.eventId],
        flags: { ...current.flags },
      }

      if (input.effects?.energy) {
        next.energy = clampEnergy(next.energy + input.effects.energy)
      }
      if (input.effects?.advanceTime) {
        next = advanceSaveTime(next)
      }
      if (input.effects?.flags) {
        next.flags = { ...next.flags, ...input.effects.flags }
      }
      if (input.markExplored) {
        next.flags = { ...next.flags, exploredBeyondPlaza: true }
      }

      const experience = buildExperience(next, {
        eventId: input.eventId,
        eventTitle: input.eventTitle,
        sceneId: input.sceneId,
        experienceType: input.experienceType,
        choiceId: input.choiceId,
        choiceText: input.choiceText,
        outcome: input.outcome,
        // 默认授权来自设置，且默认为关闭：不替玩家同意
        analysisConsent: current.settings.analysisConsentDefault,
      })

      next = { ...next, experiences: [...next.experiences, experience] }

      // 唯一一次写盘：要么全部生效，要么完全不变
      const ok = commit(next)
      return { ok, experienceId: experience.id }
    },

    setExperienceConsent: (experienceId, consent) => {
      mutate((save) => ({
        ...save,
        experiences: save.experiences.map((experience) =>
          experience.id === experienceId
            ? { ...experience, analysisConsent: consent }
            : experience,
        ),
      }))
    },

    setExperienceReason: (experienceId, reason) => {
      mutate((save) => ({
        ...save,
        experiences: save.experiences.map((experience) =>
          experience.id === experienceId
            ? { ...experience, playerReason: normalizeOptionalText(reason) }
            : experience,
        ),
      }))
    },

    setAnalysisConsentDefault: (value) => {
      mutate((save) => ({
        ...save,
        settings: { ...save.settings, analysisConsentDefault: value },
      }))
    },

    deleteExperience: (experienceId) => {
      const now = new Date().toISOString()
      mutate((save) => ({
        ...save,
        experiences: save.experiences.map((experience) =>
          experience.id === experienceId
            ? { ...experience, deletedAt: now, analysisConsent: false }
            : experience,
        ),
      }))
    },

    changeEnergy: (delta) => {
      mutate((save) => ({ ...save, energy: clampEnergy(save.energy + delta) }))
    },

    advanceTime: () => {
      mutate(advanceSaveTime)
    },

    resetProgress: () => {
      // 清除失败时保留界面上的数据，不能让玩家以为已经删掉了
      if (!clearSave()) return false
      set({ save: null, hasSave: false })
      useUiStore.getState().setPersistenceError(false)
      return true
    },
  }
})
