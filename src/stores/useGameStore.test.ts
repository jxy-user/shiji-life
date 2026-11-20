import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loadSave } from '@/services/saveService'
import { SAVE_KEY } from '@/services/storage'
import { useUiStore } from '@/stores/useUiStore'
import { useGameStore } from './useGameStore'

const profile = {
  nickname: '小满',
  avatarId: 'sun' as const,
  lifeStage: null,
  explorationTopic: null,
}

beforeEach(() => {
  window.localStorage.clear()
  useGameStore.setState({ save: null, hasSave: false })
})

describe('游戏状态', () => {
  it('开始旅程后立即写入存档', () => {
    useGameStore.getState().beginJourney(profile)

    const save = loadSave()
    expect(save?.profile.nickname).toBe('小满')
    expect(save?.currentScene).toBe('plaza')
    expect(save?.gameDay).toBe(1)
    expect(useGameStore.getState().hasSave).toBe(true)
  })

  it('精力不会低于 0 或高于 100', () => {
    useGameStore.getState().beginJourney(profile)

    useGameStore.getState().changeEnergy(-500)
    expect(useGameStore.getState().save?.energy).toBe(0)

    useGameStore.getState().changeEnergy(500)
    expect(useGameStore.getState().save?.energy).toBe(100)
  })

  it('晚上之后推进到第二天的早晨', () => {
    useGameStore.getState().beginJourney(profile)

    for (let i = 0; i < 4; i += 1) {
      useGameStore.getState().advanceTime()
    }

    const save = useGameStore.getState().save
    expect(save?.gameDay).toBe(2)
    expect(save?.timeSlot).toBe('morning')
  })

  it('进入区域会记录到走过的地方', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().goToScene('park')
    useGameStore.getState().goToScene('park')

    expect(useGameStore.getState().save?.visitedScenes).toEqual(['plaza', 'park'])
  })

  it('存档损坏时按无存档处理，不抛错', () => {
    window.localStorage.setItem('shiji-life:save:v1', '{broken json')

    expect(loadSave()).toBeNull()
  })

  it('写盘失败时如实返回 false，并标记持久化错误', () => {
    useGameStore.getState().beginJourney(profile)

    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const ok = useGameStore.getState().updateProfile({ nickname: '改名' })
    const state = useGameStore.getState()

    expect(ok).toBe(false)
    expect(useUiStore.getState().persistenceError).toBe(true)
    // 内存里仍然生效，玩家可以继续玩
    expect(state.save?.profile.nickname).toBe('改名')

    spy.mockRestore()
  })

  it('剧情标记会写入存档，刷新后仍然保留', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().setFlag('chapterCardDismissed')

    expect(loadSave()?.flags.chapterCardDismissed).toBe(true)
  })

  it('记录经历并修改授权', () => {
    useGameStore.getState().beginJourney(profile)

    const id = useGameStore.getState().recordExperience({
      eventId: 'campus_001',
      eventTitle: '那个没有发出的消息',
      sceneId: 'campus',
      experienceType: 'social',
      choiceId: 'ask',
      choiceText: '主动问问具体安排',
      outcome: ['你发了消息。'],
      analysisConsent: true,
    })

    expect(id).toBeTruthy()
    expect(loadSave()?.experiences).toHaveLength(1)

    useGameStore.getState().setExperienceConsent(id!, false)

    expect(useGameStore.getState().save?.experiences[0].analysisConsent).toBe(false)
    expect(loadSave()?.experiences[0].analysisConsent).toBe(false)
  })

  it('删除经历是软删除，同时收回授权', () => {
    useGameStore.getState().beginJourney(profile)
    const id = useGameStore.getState().recordExperience({
      eventId: 'home_001',
      eventTitle: '永远在准备开始',
      sceneId: 'home',
      experienceType: 'action',
      choiceId: 'minimal',
      choiceText: '先做一个最小的版本',
      outcome: ['它不好看，但它存在了。'],
      analysisConsent: true,
    })

    useGameStore.getState().deleteExperience(id!)

    const experience = useGameStore.getState().save?.experiences[0]
    expect(experience?.deletedAt).not.toBeNull()
    expect(experience?.analysisConsent).toBe(false)
  })

  it('v1 存档迁移到 v2 时保留原有进度', () => {
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
        flags: { lumiMet: true },
        visitedScenes: ['plaza', 'park'],
        prologueDone: true,
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z',
      }),
    )

    const save = loadSave()

    expect(save?.version).toBe(2)
    expect(save?.experiences).toEqual([])
    expect(save?.seenEventIds).toEqual([])
    expect(save?.gameDay).toBe(3)
    expect(save?.energy).toBe(45)
    expect(save?.flags.lumiMet).toBe(true)
  })

  it('删除进度会清空本地存档', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().resetProgress()

    expect(useGameStore.getState().save).toBeNull()
    expect(loadSave()).toBeNull()
  })
})
