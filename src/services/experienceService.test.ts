import { beforeEach, describe, expect, it } from 'vitest'

import { useGameStore } from '@/stores/useGameStore'
import { getEligibleExperiences, getVisibleExperiences } from './experienceService'

const baseInput = {
  eventId: 'campus_001',
  eventTitle: '那个没有发出的消息',
  sceneId: 'campus' as const,
  experienceType: 'social' as const,
  choiceId: 'ask',
  choiceText: '主动问问具体安排',
  outcome: ['你发了消息。'],
  analysisConsent: true,
}

beforeEach(() => {
  window.localStorage.clear()
  useGameStore.setState({ save: null, hasSave: false })
  useGameStore.getState().beginJourney({
    nickname: '小满',
    avatarId: 'sun',
    lifeStage: null,
    explorationTopic: null,
  })
})

describe('经历查询', () => {
  it('回顾查询只返回未删除且已授权的经历', () => {
    const store = useGameStore.getState()
    const keep = store.recordExperience({ ...baseInput })!
    const revoked = store.recordExperience({ ...baseInput })!
    const deleted = store.recordExperience({ ...baseInput })!

    useGameStore.getState().setExperienceConsent(revoked, false)
    useGameStore.getState().deleteExperience(deleted)

    const save = useGameStore.getState().save!
    const eligible = getEligibleExperiences(save)
    const visible = getVisibleExperiences(save)

    expect(eligible.map((experience) => experience.id)).toEqual([keep])
    expect(visible).toHaveLength(2)
  })

  it('删除记录会同时收回授权，避免被后续分析捡回来', () => {
    const id = useGameStore.getState().recordExperience(baseInput)!
    useGameStore.getState().deleteExperience(id)

    const experience = useGameStore.getState().save?.experiences[0]
    expect(experience?.analysisConsent).toBe(false)
    expect(experience?.deletedAt).not.toBeNull()
  })
})
