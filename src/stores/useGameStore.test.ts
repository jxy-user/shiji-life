import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loadSave, persistSave } from '@/services/saveService'
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

  it('v1 存档连续迁移到 v4 时保留原有进度', () => {
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

    expect(save?.version).toBe(5)
    expect(save?.experiences).toEqual([])
    expect(save?.seenEventIds).toEqual([])
    expect(save?.reflections).toEqual([])
    expect(save?.insights).toEqual([])
    expect(save?.actions).toEqual([])
    expect(save?.journalEntries).toEqual([])
    expect(save?.chapterSummaries).toEqual([])
    expect(save?.relationships).toEqual([])
    expect(save?.actionPoints).toBe(3)
    expect(save?.settings.reflectionThreshold).toBe(3)
    expect(save?.settings.analysisConsentDefault).toBe(false)
    expect(save?.gameDay).toBe(3)
    expect(save?.energy).toBe(45)
    expect(save?.flags.lumiMet).toBe(true)
  })

  it('v2 存档升级到 v4 时给旧经历补上选择标签', () => {
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

    expect(save?.version).toBe(5)
    expect(save?.experiences[0].choiceTags).toEqual([])
    expect(save?.experiences[0].analysisConsent).toBe(true)
    expect(save?.settings.analysisConsentDefault).toBe(true)
    expect(save?.settings.invitationsEnabled).toBe(true)
    expect(save?.actions).toEqual([])
    expect(save?.journalEntries).toEqual([])
    expect(save?.chapterSummaries).toEqual([])
    expect(save?.relationships).toEqual([])
    expect(save?.actionPoints).toBe(3)
  })

  it.each([0, -1, 1.5, 6])('版本号 %s 不被迁移，也不被当作有效存档', (version) => {
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

  it('v3 存档升级到 v4 时补齐 M5 新数组', () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({
        version: 3,
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
            choiceTags: ['approach'],
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
        reflections: [],
        candidateInsights: [],
        insights: [],
        settings: { analysisConsentDefault: false, reflectionThreshold: 3, minExperienceTypes: 2, invitationsEnabled: true },
        prologueDone: true,
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z',
      }),
    )

    const save = loadSave()

    expect(save?.version).toBe(5)
    expect(save?.actions).toEqual([])
    expect(save?.journalEntries).toEqual([])
    expect(save?.chapterSummaries).toEqual([])
    expect(save?.relationships).toEqual([])
    expect(save?.actionPoints).toBe(3)
    // 既有数据保留
    expect(save?.experiences).toHaveLength(1)
    expect(save?.experiences[0].choiceTags).toEqual(['approach'])
  })

  it('删除进度会清空本地存档', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().resetProgress()

    expect(useGameStore.getState().save).toBeNull()
    expect(loadSave()).toBeNull()
  })
})

describe('M5 现实行动与日记', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useGameStore.setState({ save: null, hasSave: false })
    useGameStore.getState().beginJourney(profile)
    // 设置默认授权开启，简化测试
    useGameStore.getState().setAnalysisConsentDefault(true)
    // 创建 3 条经历：两条带 'approach' 标签（触发标签规则），一条不同场景不同标签（触发场景规则）
    useGameStore.getState().recordExperience({
      eventId: 'test_001',
      eventTitle: '测试事件 1',
      sceneId: 'plaza',
      experienceType: 'action',
      choiceId: 'choice1',
      choiceText: '主动尝试',
      outcome: ['测试结果'],
      analysisConsent: true,
      choiceTags: ['approach'],
    })
    useGameStore.getState().recordExperience({
      eventId: 'test_002',
      eventTitle: '测试事件 2',
      sceneId: 'home',
      experienceType: 'social',
      choiceId: 'choice2',
      choiceText: '主动社交',
      outcome: ['社交结果'],
      analysisConsent: true,
      choiceTags: ['approach'],
    })
    useGameStore.getState().recordExperience({
      eventId: 'test_003',
      eventTitle: '测试事件 3',
      sceneId: 'park',
      experienceType: 'inner',
      choiceId: 'choice3',
      choiceText: '观察一下',
      outcome: ['情感结果'],
      analysisConsent: true,
      choiceTags: ['observe'],
    })
    const reflectionId = useGameStore.getState().createReflectionInvite()!
    useGameStore.getState().respondReflection(reflectionId, 'accept')
    useGameStore.getState().generateCandidates(reflectionId)
    const candidate = useGameStore.getState().save!.candidateInsights[0]
    useGameStore.getState().confirmCandidate(candidate.id)
  })

  it('创建行动：可关联认知、设置频率与截止', () => {
    const actionId = useGameStore.getState().createAction({
      title: '每天冥想 5 分钟',
      linkedInsightId: useGameStore.getState().save!.insights[0].id,
      frequency: 'daily',
      dueDate: '2026-12-31',
      reminderTime: '20:00',
    })
    expect(actionId).toBeTruthy()

    const action = useGameStore.getState().save!.actions[0]
    expect(action.title).toBe('每天冥想 5 分钟')
    expect(action.linkedInsightId).toBe(useGameStore.getState().save!.insights[0].id)
    expect(action.frequency).toBe('daily')
    expect(action.dueDate).toBe('2026-12-31')
    expect(action.reminderTime).toBe('20:00')
    expect(action.status).toBe('todo')
  })

  it('创建行动：手动创建无关联认知', () => {
    const actionId = useGameStore.getState().createAction({
      title: '散步 20 分钟',
      linkedInsightId: null,
      frequency: 'once',
      dueDate: null,
      reminderTime: null,
    })
    expect(actionId).toBeTruthy()
    const action = useGameStore.getState().save!.actions[0]
    expect(action.linkedInsightId).toBeNull()
  })

  it('拒绝空标题的行动', () => {
    const actionId = useGameStore.getState().createAction({
      title: '   ',
      linkedInsightId: null,
      frequency: 'once',
      dueDate: null,
      reminderTime: null,
    })
    expect(actionId).toBeNull()
    expect(useGameStore.getState().save!.actions).toHaveLength(0)
  })

  it('更新行动状态：待办 → 进行中 → 完成', () => {
    const actionId = useGameStore.getState().createAction({
      title: '测试行动',
      linkedInsightId: null,
      frequency: 'once',
      dueDate: null,
      reminderTime: null,
    })!
    useGameStore.getState().updateActionStatus({ actionId, status: 'in_progress' })
    expect(useGameStore.getState().save!.actions[0].status).toBe('in_progress')

    useGameStore.getState().updateActionStatus({ actionId, status: 'done' })
    expect(useGameStore.getState().save!.actions[0].status).toBe('done')
    expect(useGameStore.getState().save!.actions[0].completedAt).not.toBeNull()
  })

  it('删除行动', () => {
    const actionId = useGameStore.getState().createAction({
      title: '待删除',
      linkedInsightId: null,
      frequency: 'once',
      dueDate: null,
      reminderTime: null,
    })!
    useGameStore.getState().deleteAction(actionId)
    expect(useGameStore.getState().save!.actions).toHaveLength(0)
  })

  it('完成行动并复盘：自动写入 action_review 日记', () => {
    const actionId = useGameStore.getState().createAction({
      title: '完成并复盘',
      linkedInsightId: useGameStore.getState().save!.insights[0].id,
      frequency: 'once',
      dueDate: null,
      reminderTime: null,
    })!

    useGameStore.getState().completeAction({ actionId, content: '今天冥想了 5 分钟，感觉平静多了。' })

    const action = useGameStore.getState().save!.actions[0]
    expect(action.status).toBe('done')
    expect(action.completedAt).not.toBeNull()

    const journal = useGameStore.getState().save!.journalEntries[0]
    expect(journal.type).toBe('action_review')
    expect(journal.content).toBe('今天冥想了 5 分钟，感觉平静多了。')
    expect(journal.linkedActionId).toBe(actionId)
    expect(journal.linkedInsightId).toBe(action.linkedInsightId)
  })

  it('完成行动幂等：已完成的行动不再重复写入复盘', () => {
    const actionId = useGameStore.getState().createAction({
      title: '幂等测试',
      linkedInsightId: null,
      frequency: 'once',
      dueDate: null,
      reminderTime: null,
    })!

    useGameStore.getState().completeAction({ actionId, content: '第一次复盘' })
    useGameStore.getState().completeAction({ actionId, content: '第二次复盘' })

    expect(useGameStore.getState().save!.journalEntries).toHaveLength(1)
    expect(useGameStore.getState().save!.journalEntries[0].content).toBe('第一次复盘')
  })

  it('拒绝空白复盘内容', () => {
    const actionId = useGameStore.getState().createAction({
      title: '空白复盘',
      linkedInsightId: null,
      frequency: 'once',
      dueDate: null,
      reminderTime: null,
    })!

    useGameStore.getState().completeAction({ actionId, content: '   ' })
    expect(useGameStore.getState().save!.journalEntries).toHaveLength(0)
    expect(useGameStore.getState().save!.actions[0].status).toBe('todo')
  })

  it('复盘内容最多 2000 字，超长截断', () => {
    const actionId = useGameStore.getState().createAction({
      title: '长复盘',
      linkedInsightId: null,
      frequency: 'once',
      dueDate: null,
      reminderTime: null,
    })!
    const longContent = 'a'.repeat(3000)
    useGameStore.getState().completeAction({ actionId, content: longContent })
    expect(useGameStore.getState().save!.journalEntries[0].content).toHaveLength(2000)
  })

  it('添加日记：三种类型、关联字段', () => {
    const actionId = useGameStore.getState().createAction({
      title: '关联行动',
      linkedInsightId: null,
      frequency: 'once',
      dueDate: null,
      reminderTime: null,
    })!
    const insightId = useGameStore.getState().save!.insights[0].id
    const expId = useGameStore.getState().save!.experiences[0].id

    const freeId = useGameStore.getState().addJournalEntry({
      type: 'free',
      content: '自由记录',
      linkedActionId: null,
      linkedInsightId: null,
      linkedExperienceIds: [expId],
    })
    const reviewId = useGameStore.getState().addJournalEntry({
      type: 'action_review',
      content: '手动复盘',
      linkedActionId: actionId,
      linkedInsightId: insightId,
      linkedExperienceIds: [],
    })
    const linkId = useGameStore.getState().addJournalEntry({
      type: 'insight_link',
      content: '关联认知展开',
      linkedActionId: null,
      linkedInsightId: insightId,
      linkedExperienceIds: [],
    })

    expect(freeId).toBeTruthy()
    expect(reviewId).toBeTruthy()
    expect(linkId).toBeTruthy()
    expect(useGameStore.getState().save!.journalEntries).toHaveLength(3)
  })

  it('拒绝空白日记内容', () => {
    const id = useGameStore.getState().addJournalEntry({
      type: 'free',
      content: '   ',
      linkedActionId: null,
      linkedInsightId: null,
      linkedExperienceIds: [],
    })
    expect(id).toBeNull()
    expect(useGameStore.getState().save!.journalEntries).toHaveLength(0)
  })

  it('更新日记内容', () => {
    const id = useGameStore.getState().addJournalEntry({
      type: 'free',
      content: '原内容',
      linkedActionId: null,
      linkedInsightId: null,
      linkedExperienceIds: [],
    })!
    useGameStore.getState().updateJournalEntry(id, '新内容')
    expect(useGameStore.getState().save!.journalEntries[0].content).toBe('新内容')
    const newEntry = useGameStore.getState().save!.journalEntries[0]
    expect(newEntry.content).toBe('新内容')
    expect(newEntry.updatedAt).toBeDefined()
  })

  it('拒绝空白更新日记', () => {
    const id = useGameStore.getState().addJournalEntry({
      type: 'free',
      content: '原内容',
      linkedActionId: null,
      linkedInsightId: null,
      linkedExperienceIds: [],
    })!
    useGameStore.getState().updateJournalEntry(id, '   ')
    expect(useGameStore.getState().save!.journalEntries[0].content).toBe('原内容')
  })

  it('删除日记', () => {
    const id = useGameStore.getState().addJournalEntry({
      type: 'free',
      content: '待删除',
      linkedActionId: null,
      linkedInsightId: null,
      linkedExperienceIds: [],
    })!
    useGameStore.getState().deleteJournalEntry(id)
    expect(useGameStore.getState().save!.journalEntries).toHaveLength(0)
  })

  it('生成阶段总结：按 chapter 去重、标记编辑', () => {
    useGameStore.getState().upsertChapterSummary({
      chapter: 'chapter_01',
      content: '初版总结',
    })
    expect(useGameStore.getState().save!.chapterSummaries).toHaveLength(1)
    expect(useGameStore.getState().save!.chapterSummaries[0].isEdited).toBe(false)

    useGameStore.getState().upsertChapterSummary({
      chapter: 'chapter_01',
      content: '修订版总结',
    })
    expect(useGameStore.getState().save!.chapterSummaries).toHaveLength(1)
    expect(useGameStore.getState().save!.chapterSummaries[0].content).toBe('修订版总结')
    expect(useGameStore.getState().save!.chapterSummaries[0].isEdited).toBe(true)
    expect(useGameStore.getState().save!.chapterSummaries[0].editedAt).not.toBeNull()
  })

  it('拒绝空白阶段总结', () => {
    useGameStore.getState().upsertChapterSummary({
      chapter: 'chapter_01',
      content: '   ',
    })
    expect(useGameStore.getState().save!.chapterSummaries).toHaveLength(0)
  })

  it('删除阶段总结', () => {
    useGameStore.getState().upsertChapterSummary({
      chapter: 'chapter_01',
      content: '待删除',
    })
    const id = useGameStore.getState().save!.chapterSummaries[0].id
    useGameStore.getState().deleteChapterSummary(id)
    expect(useGameStore.getState().save!.chapterSummaries).toHaveLength(0)
  })

  it('v3 存档迁移到 v4：新数组补空值、既有数据保留', () => {
    window.localStorage.setItem(
      'shiji-life:save:v1',
      JSON.stringify({
        version: 3,
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
            id: 'old-exp',
            eventId: 'campus_001',
            eventTitle: '测试',
            sceneId: 'campus',
            experienceType: 'social',
            choiceId: 'ask',
            choiceText: '提问',
            choiceTags: ['approach'],
            outcome: ['结果'],
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
        reflections: [],
        candidateInsights: [],
        insights: [],
        settings: { analysisConsentDefault: false, reflectionThreshold: 3, minExperienceTypes: 2, invitationsEnabled: true },
        prologueDone: true,
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z',
      }),
    )

    const save = loadSave()
    expect(save?.version).toBe(5)
    expect(save?.actions).toEqual([])
    expect(save?.journalEntries).toEqual([])
    expect(save?.chapterSummaries).toEqual([])
    expect(save?.relationships).toEqual([])
    expect(save?.actionPoints).toBe(3)
    expect(save?.experiences).toHaveLength(1)
  })

  it('写盘前 schema 校验：非法数据拒绝写入', () => {
    useGameStore.getState().beginJourney(profile)
    // 直接构造非法存档（缺少必填字段）
    const badSave = { ...useGameStore.getState().save! }
    delete (badSave as Record<string, unknown>).profile
    // @ts-expectError 故意传非法数据测试
    const ok = persistSave(badSave as never)
    expect(ok).toBe(false)
    // 原存档不应被覆盖
    expect(loadSave()?.profile.nickname).toBe('小满')
  })
})

describe('v5 关系与行动力', () => {
  it('初始存档有 3 点行动力与空关系列表', () => {
    useGameStore.getState().beginJourney(profile)
    const save = useGameStore.getState().save
    expect(save?.actionPoints).toBe(3)
    expect(save?.relationships).toEqual([])
  })

  it('打个招呼消耗 1 点行动力并提升理解度，同一天只算一次', () => {
    useGameStore.getState().beginJourney(profile)

    expect(useGameStore.getState().greetCharacter('lin')).toBe(true)
    const save = useGameStore.getState().save
    expect(save?.actionPoints).toBe(2)
    expect(save?.relationships[0].characterId).toBe('lin')
    expect(save?.relationships[0].affinity).toBe(2)
    expect(save?.relationships[0].stage).toBe('stranger')

    // 同一天第二次不生效，也不扣行动力
    expect(useGameStore.getState().greetCharacter('lin')).toBe(false)
    expect(useGameStore.getState().save?.actionPoints).toBe(2)
  })

  it('行动力耗尽后不能再互动', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().greetCharacter('lin')
    useGameStore.getState().greetCharacter('zhou')
    useGameStore.getState().greetCharacter('yu')
    expect(useGameStore.getState().save?.actionPoints).toBe(0)
    expect(useGameStore.getState().greetCharacter('lin')).toBe(false)
    expect(useGameStore.getState().spendActionPoint()).toBe(false)
  })

  it('跨天恢复行动力', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().spendActionPoint()
    useGameStore.getState().spendActionPoint()
    useGameStore.getState().spendActionPoint()
    expect(useGameStore.getState().save?.actionPoints).toBe(0)

    useGameStore.getState().advanceTime()
    useGameStore.getState().advanceTime()
    useGameStore.getState().advanceTime()
    useGameStore.getState().advanceTime()

    expect(useGameStore.getState().save?.gameDay).toBe(2)
    expect(useGameStore.getState().save?.actionPoints).toBe(3)
  })

  it('角色事件更新理解度并消耗行动力', () => {
    useGameStore.getState().beginJourney(profile)
    const result = useGameStore.getState().completeEvent({
      eventId: 'lin_001',
      eventTitle: '窗边的取景框',
      sceneId: 'campus',
      experienceType: 'social',
      choiceId: 'ask',
      choiceText: '问她刚才在拍什么',
      choiceTags: ['approach'],
      outcome: ['她说在等一个人走过。'],
      effects: { affinity: 6, advanceTime: true },
      characterId: 'lin',
      markExplored: true,
    })

    expect(result.ok).toBe(true)
    const save = useGameStore.getState().save
    expect(save?.relationships[0].affinity).toBe(6)
    expect(save?.actionPoints).toBe(2)
    expect(save?.seenEventIds).toContain('lin_001')
  })

  it('行动力为 0 时角色事件拒绝结算且不写已读', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().spendActionPoint()
    useGameStore.getState().spendActionPoint()
    useGameStore.getState().spendActionPoint()

    const result = useGameStore.getState().completeEvent({
      eventId: 'lin_001',
      eventTitle: '窗边的取景框',
      sceneId: 'campus',
      experienceType: 'social',
      choiceId: 'ask',
      choiceText: '问她刚才在拍什么',
      outcome: ['她说在等一个人走过。'],
      effects: { affinity: 6 },
      characterId: 'lin',
      requiredAffinity: 0,
    })

    expect(result.ok).toBe(false)
    expect(useGameStore.getState().save?.seenEventIds).not.toContain('lin_001')
    expect(useGameStore.getState().save?.relationships).toEqual([])
  })

  it('理解度不足时角色事件拒绝结算', () => {
    useGameStore.getState().beginJourney(profile)

    const result = useGameStore.getState().completeEvent({
      eventId: 'lin_002',
      eventTitle: '没拍下的那张',
      sceneId: 'campus',
      experienceType: 'social',
      choiceId: 'ask',
      choiceText: '问她当时想拍什么',
      outcome: ['她说想拍光落在墙上的样子。'],
      effects: { affinity: 8 },
      characterId: 'lin',
      requiredAffinity: 30,
    })

    expect(result.ok).toBe(false)
    expect(useGameStore.getState().save?.seenEventIds).not.toContain('lin_002')
  })

  it('睡到明天早晨会恢复行动力', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().spendActionPoint()
    useGameStore.getState().spendActionPoint()
    useGameStore.getState().spendActionPoint()

    const before = useGameStore.getState().save!
    useGameStore.getState().restUntilMorning()
    const after = useGameStore.getState().save!

    expect(after.gameDay).toBe(before.gameDay + 1)
    expect(after.timeSlot).toBe('morning')
    expect(after.actionPoints).toBe(3)
  })
})
