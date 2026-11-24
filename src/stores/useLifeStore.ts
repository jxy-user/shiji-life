import { create } from 'zustand'

import { LIFE_NODES, type LifeTag } from '@/data/lifeStory'

export const LIFE_SAVE_KEY = 'shiji-life:life:v1'

export type LifeChoiceRecord = {
  nodeId: string
  age: number
  title: string
  choiceId: string
  label: string
  result: string
  tags: LifeTag[]
}

export type LifeSave = {
  version: 1
  startedAt: string
  /** 当前节点下标；等于节点总数时表示已结束 */
  currentIndex: number
  choices: LifeChoiceRecord[]
  finishedAt: string | null
  /** 刚做出、还没被「继续」确认的选择；刷新后仍能显示结果 */
  pendingChoice: LifeChoiceRecord | null
}

/** 校验单条选择记录：存档被手工改坏时不能让回放页崩掉 */
function isValidChoice(value: unknown): value is LifeChoiceRecord {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.nodeId === 'string' &&
    typeof item.age === 'number' &&
    typeof item.title === 'string' &&
    typeof item.choiceId === 'string' &&
    typeof item.label === 'string' &&
    typeof item.result === 'string' &&
    Array.isArray(item.tags) &&
    item.tags.every((tag) => typeof tag === 'string')
  )
}

function readLifeSave(): LifeSave | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LIFE_SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<LifeSave>
    if (data.version !== 1 || !Array.isArray(data.choices)) return null

    const choices = data.choices.filter(isValidChoice)
    // 坏记录被过滤后，保证 currentIndex 不超过实际选择数，避免跳过或重复提问
    const rawIndex =
      typeof data.currentIndex === 'number' && Number.isInteger(data.currentIndex)
        ? data.currentIndex
        : choices.length
    const currentIndex = Math.min(Math.max(0, rawIndex), choices.length, LIFE_NODES.length)
    const finishedAt =
      typeof data.finishedAt === 'string' && choices.length >= LIFE_NODES.length
        ? data.finishedAt
        : null

    return {
      version: 1,
      startedAt: typeof data.startedAt === 'string' ? data.startedAt : new Date().toISOString(),
      currentIndex,
      choices,
      finishedAt,
      pendingChoice: isValidChoice(data.pendingChoice) ? data.pendingChoice : null,
    }
  } catch {
    return null
  }
}

function writeLifeSave(save: LifeSave): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LIFE_SAVE_KEY, JSON.stringify(save))
  } catch {
    // 存储不可用时只在本次会话内生效
  }
}

type LifeState = {
  save: LifeSave | null
  reload: () => void
  start: () => void
  choose: (choiceId: string) => void
  /** 确认查看过结果，进入下一节点 */
  clearPending: () => void
  reset: () => void
}

export const useLifeStore = create<LifeState>((set, get) => ({
  save: readLifeSave(),

  reload: () => set({ save: readLifeSave() }),

  start: () => {
    const save: LifeSave = {
      version: 1,
      startedAt: new Date().toISOString(),
      currentIndex: 0,
      choices: [],
      finishedAt: null,
      pendingChoice: null,
    }
    writeLifeSave(save)
    set({ save })
  },

  choose: (choiceId) => {
    const current = get().save
    if (!current) return
    const node = LIFE_NODES[current.currentIndex]
    if (!node) return
    const choice = node.choices.find((item) => item.id === choiceId)
    if (!choice) return

    const record: LifeChoiceRecord = {
      nodeId: node.id,
      age: node.age,
      title: node.title,
      choiceId: choice.id,
      label: choice.label,
      result: choice.result,
      tags: [...choice.tags],
    }

    const nextIndex = current.currentIndex + 1
    const finished = nextIndex >= LIFE_NODES.length
    const next: LifeSave = {
      ...current,
      currentIndex: nextIndex,
      choices: [...current.choices, record],
      pendingChoice: record,
      finishedAt: finished ? new Date().toISOString() : null,
    }
    writeLifeSave(next)
    set({ save: next })
  },

  clearPending: () => {
    const current = get().save
    if (!current || !current.pendingChoice) return
    const next: LifeSave = { ...current, pendingChoice: null }
    writeLifeSave(next)
    set({ save: next })
  },

  reset: () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(LIFE_SAVE_KEY)
      } catch {
        // 存储不可用时忽略
      }
    }
    set({ save: null })
  },
}))
