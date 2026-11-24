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
}

function readLifeSave(): LifeSave | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(LIFE_SAVE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<LifeSave>
    if (
      data.version !== 1 ||
      typeof data.startedAt !== 'string' ||
      typeof data.currentIndex !== 'number' ||
      !Array.isArray(data.choices)
    ) {
      return null
    }
    return data as LifeSave
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
      finishedAt: finished ? new Date().toISOString() : null,
    }
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
