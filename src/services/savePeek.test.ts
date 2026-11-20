import { beforeEach, describe, expect, it } from 'vitest'

import { createInitialSave } from '@/game/saveSchema'
import { hasPlayableSave } from '@/services/savePeek'
import { SAVE_KEY } from '@/services/storage'

const profile = {
  nickname: '小满',
  avatarId: 'sun' as const,
  lifeStage: null,
  explorationTopic: null,
}

function writeSave(overrides: Record<string, unknown> = {}) {
  window.localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({ ...createInitialSave(profile), ...overrides }),
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('首屏存档判断', () => {
  it('完整存档可以继续', () => {
    writeSave()
    expect(hasPlayableSave()).toBe(true)
  })

  it('v1 存档可以继续：缺失字段由迁移补齐', () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 1,
        profile: { nickname: '旧玩家', avatarId: 'ink', lifeStage: null, explorationTopic: null },
        chapter: 'chapter_01',
        currentScene: 'park',
        gameDay: 3,
        timeSlot: 'noon',
        energy: 45,
        flags: {},
        visitedScenes: ['plaza', 'park'],
        prologueDone: true,
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z',
      }),
    )

    expect(hasPlayableSave()).toBe(true)
  })

  it('没有存档时不可继续', () => {
    expect(hasPlayableSave()).toBe(false)
  })

  it('损坏 JSON 不可继续', () => {
    window.localStorage.setItem(SAVE_KEY, '{ broken')
    expect(hasPlayableSave()).toBe(false)
  })

  it.each([
    'chapter',
    'currentScene',
    'gameDay',
    'timeSlot',
    'energy',
    'experiences',
    'seenEventIds',
    'settings',
    'profile',
  ])('缺少必需字段 %s 时不可继续', (key) => {
    const save: Record<string, unknown> = { ...createInitialSave(profile) }
    delete save[key]
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save))

    expect(hasPlayableSave()).toBe(false)
  })

  it('超出范围的精力值不可继续', () => {
    writeSave({ energy: 120 })
    expect(hasPlayableSave()).toBe(false)
  })
})
