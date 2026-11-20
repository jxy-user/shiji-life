import { describe, expect, it } from 'vitest'

import { buildCandidateInsights } from '@/game/insightRules'
import { evaluateReflection } from '@/game/reflection'
import {
  createInitialSave,
  type LifeExperience,
  type Reflection,
  type SaveData,
} from '@/game/saveSchema'

const profile = {
  nickname: '小满',
  avatarId: 'sun' as const,
  lifeStage: null,
  explorationTopic: null,
}

function experience(overrides: Partial<LifeExperience> = {}): LifeExperience {
  return {
    id: `exp-${Math.random().toString(36).slice(2, 8)}`,
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
    createdAt: '2026-11-20T10:00:00.000Z',
    deletedAt: null,
    ...overrides,
  }
}

function saveWith(experiences: LifeExperience[], patch: Partial<SaveData> = {}): SaveData {
  return { ...createInitialSave(profile), experiences, ...patch }
}

function reflection(overrides: Partial<Reflection> = {}): Reflection {
  return {
    id: 'reflection-1',
    status: 'declined',
    trigger: 'threshold',
    experienceIds: [],
    createdAt: '2026-11-20T10:00:00.000Z',
    respondedAt: null,
    completedAt: null,
    cooldownUntilGameDay: 2,
    ...overrides,
  }
}

describe('回顾触发判断', () => {
  it('经历不足阈值时不邀请', () => {
    const save = saveWith([experience(), experience({ experienceType: 'inner' })])

    expect(evaluateReflection(save).reason).toBe('too-few-experiences')
  })

  it('达到阈值但类型不够时不邀请', () => {
    const save = saveWith([experience(), experience(), experience()])

    expect(evaluateReflection(save).reason).toBe('too-few-types')
  })

  it('达到阈值与类型要求时邀请', () => {
    const save = saveWith([
      experience(),
      experience({ experienceType: 'inner' }),
      experience({ experienceType: 'action' }),
    ])

    const readiness = evaluateReflection(save)
    expect(readiness.shouldInvite).toBe(true)
    expect(readiness.threshold).toBe(3)
  })

  it('关闭主动邀请后不邀请', () => {
    const save = saveWith(
      [experience(), experience({ experienceType: 'inner' }), experience({ experienceType: 'action' })],
      { settings: { ...createInitialSave(profile).settings, invitationsEnabled: false } },
    )

    expect(evaluateReflection(save).reason).toBe('disabled')
  })

  it('拒绝后进入冷却，冷却结束才能再次邀请', () => {
    const experiences = [
      experience(),
      experience({ experienceType: 'inner' }),
      experience({ experienceType: 'action' }),
    ]

    expect(
      evaluateReflection(saveWith(experiences, { reflections: [reflection()], gameDay: 1 }))
        .reason,
    ).toBe('cooldown')

    expect(
      evaluateReflection(
        saveWith(experiences, { reflections: [reflection()], gameDay: 2 }),
      ).shouldInvite,
    ).toBe(true)
  })

  it('已有进行中的会话时不再重复邀请', () => {
    const save = saveWith(
      [experience(), experience({ experienceType: 'inner' }), experience({ experienceType: 'action' })],
      { reflections: [reflection({ status: 'invited', cooldownUntilGameDay: null })] },
    )

    expect(evaluateReflection(save).reason).toBe('active-session')
  })
})

describe('候选观察规则', () => {
  it('两次绕开的选择会生成一条带证据的猜测', () => {
    const first = experience({ choiceId: 'close', choiceTags: ['avoid'], eventTitle: 'A' })
    const second = experience({
      choiceId: 'leave',
      choiceTags: ['avoid'],
      eventTitle: 'B',
      sceneId: 'park',
    })

    const candidates = buildCandidateInsights([first, second], 'reflection-1')

    expect(candidates).toHaveLength(1)
    expect(candidates[0].category).toBe('patterns')
    expect(candidates[0].evidenceIds).toEqual([first.id, second.id])
    expect(candidates[0].hypothesis).toContain('不是关于你的结论')
  })

  it('只有一次同类选择时不生成任何观察', () => {
    const candidates = buildCandidateInsights([experience()], 'reflection-1')

    expect(candidates).toHaveLength(0)
  })

  it('同一场景的两种做法会生成一条「不同」的观察', () => {
    const first = experience({ choiceTags: ['approach'], sceneId: 'campus', eventTitle: 'A' })
    const second = experience({ choiceTags: ['avoid'], sceneId: 'campus', eventTitle: 'B' })

    const candidates = buildCandidateInsights([first, second], 'reflection-1')
    const thinking = candidates.find((candidate) => candidate.category === 'thinking')

    expect(thinking?.title).toBe('同一个地方的两种做法')
    expect(thinking?.evidenceIds).toEqual([first.id, second.id])
  })

  it('候选观察最多两条', () => {
    const list = [
      experience({ choiceTags: ['avoid'], sceneId: 'campus', eventTitle: 'A' }),
      experience({ choiceTags: ['avoid'], sceneId: 'campus', eventTitle: 'B' }),
      experience({ choiceTags: ['approach'], sceneId: 'park', eventTitle: 'C' }),
    ]

    expect(buildCandidateInsights(list, 'reflection-1').length).toBeLessThanOrEqual(2)
  })
})
