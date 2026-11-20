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

  it('事件完成是一次写盘：失败时不会留下半完成存档', () => {
    useGameStore.getState().beginJourney(profile)
    const before = window.localStorage.getItem(SAVE_KEY)

    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const result = useGameStore.getState().completeEvent({
      eventId: 'campus_001',
      eventTitle: '那个没有发出的消息',
      sceneId: 'campus',
      experienceType: 'social',
      choiceId: 'ask',
      choiceText: '主动问问具体安排',
      outcome: ['你发了消息。'],
      effects: { energy: -5, advanceTime: true },
      markExplored: true,
    })

    spy.mockRestore()

    expect(result.ok).toBe(false)
    expect(result.experienceId).toBeTruthy()

    // 磁盘上仍是完成前的状态：没有已读标记、没有经历、精力未变
    expect(window.localStorage.getItem(SAVE_KEY)).toBe(before)
    const persisted = JSON.parse(before ?? '{}')
    expect(persisted.seenEventIds).toEqual([])
    expect(persisted.experiences).toEqual([])
    expect(persisted.energy).toBe(100)
  })

  it('重复完成同一事件不会重复扣精力或重复写经历', () => {
    useGameStore.getState().beginJourney(profile)

    const input = {
      eventId: 'campus_001',
      eventTitle: '那个没有发出的消息',
      sceneId: 'campus' as const,
      experienceType: 'social' as const,
      choiceId: 'ask',
      choiceText: '主动问问具体安排',
      outcome: ['你发了消息。'],
      effects: { energy: -5 },
    }

    const first = useGameStore.getState().completeEvent(input)
    const second = useGameStore.getState().completeEvent(input)

    const save = useGameStore.getState().save
    expect(first.experienceId).toBeTruthy()
    // 幂等调用返回同一条经历，界面不会因此把结果覆盖成空
    expect(second.experienceId).toBe(first.experienceId)
    expect(save?.experiences).toHaveLength(1)
    expect(save?.energy).toBe(95)
  })

  it('重新生成候选不会重复，也不会重复写入认知', () => {
    useGameStore.getState().beginJourney(profile)

    const makeExperience = (sceneId: 'campus' | 'home', title: string) => ({
      eventId: `event-${title}`,
      eventTitle: title,
      sceneId,
      experienceType: 'social' as const,
      choiceId: 'leave',
      choiceText: '找个借口走开',
      choiceTags: ['avoid'],
      outcome: ['你走开了。'],
      analysisConsent: true,
    })

    useGameStore.getState().recordExperience(makeExperience('campus', 'A'))
    useGameStore.getState().recordExperience(makeExperience('home', 'B'))

    const reflectionId = useGameStore.getState().createReflectionInvite()!
    useGameStore.getState().respondReflection(reflectionId, 'accept')

    expect(useGameStore.getState().generateCandidates(reflectionId)).toBe(1)

    const candidate = useGameStore
      .getState()
      .save!.candidateInsights.find((item) => item.reflectionId === reflectionId)!

    expect(useGameStore.getState().confirmCandidate(candidate.id)).toBeTruthy()

    // 回到回顾页调整授权后重新生成：同一条观察不会再出现
    expect(useGameStore.getState().generateCandidates(reflectionId)).toBe(0)

    const save = useGameStore.getState().save!
    expect(
      save.candidateInsights.filter((item) => item.reflectionId === reflectionId),
    ).toHaveLength(1)
    expect(save.insights).toHaveLength(1)
  })

  it('v1 存档连续迁移到 v3 时保留原有进度', () => {
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

    expect(save?.version).toBe(3)
    expect(save?.experiences).toEqual([])
    expect(save?.seenEventIds).toEqual([])
    expect(save?.reflections).toEqual([])
    expect(save?.insights).toEqual([])
    expect(save?.settings.reflectionThreshold).toBe(3)
    expect(save?.settings.analysisConsentDefault).toBe(false)
    expect(save?.gameDay).toBe(3)
    expect(save?.energy).toBe(45)
    expect(save?.flags.lumiMet).toBe(true)
  })

  it('v2 存档升级到 v3 时给旧经历补上选择标签', () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 2,
        profile: { nickname: '旧玩家', avatarId: 'ink', lifeStage: null, explorationTopic: null },
        chapter: 'chapter_01',
        currentScene: 'campus',
        gameDay: 2,
        timeSlot: 'morning',
        energy: 80,
        flags: {},
        visitedScenes: ['plaza', 'campus'],
        experiences: [
          {
            id: 'old-experience',
            eventId: 'campus_001',
            eventTitle: '那个没有发出的消息',
            sceneId: 'campus',
            experienceType: 'social',
            choiceId: 'ask',
            choiceText: '主动问问具体安排',
            outcome: ['你发了消息。'],
            analysisConsent: true,
            playerReason: null,
            playerFeeling: null,
            gameDay: 1,
            timeSlot: 'morning',
            createdAt: '2026-11-01T10:00:00.000Z',
            deletedAt: null,
          },
        ],
        seenEventIds: ['campus_001'],
        settings: { analysisConsentDefault: true },
        prologueDone: true,
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z',
      }),
    )

    const save = loadSave()

    expect(save?.version).toBe(3)
    expect(save?.experiences[0].choiceTags).toEqual([])
    expect(save?.experiences[0].analysisConsent).toBe(true)
    expect(save?.settings.analysisConsentDefault).toBe(true)
    expect(save?.settings.invitationsEnabled).toBe(true)
  })

  it.each([0, -1, 1.5, 4])('版本号 %s 不被迁移，也不被当作有效存档', (version) => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version,
        profile: { nickname: '旧玩家', avatarId: 'ink', lifeStage: null, explorationTopic: null },
        chapter: 'chapter_01',
        currentScene: 'park',
        gameDay: 3,
        timeSlot: 'noon',
        energy: 45,
        flags: {},
        visitedScenes: ['plaza'],
        prologueDone: true,
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z',
      }),
    )

    expect(loadSave()).toBeNull()
  })

  it('删除进度会清空本地存档', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().resetProgress()

    expect(useGameStore.getState().save).toBeNull()
    expect(loadSave()).toBeNull()
  })
})
