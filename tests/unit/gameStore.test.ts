import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../../src/store/gameStore'

const eventInput = {
  eventId: 'bench',
  sceneId: 'plaza',
  choiceId: 'sit',
  title: '长椅上的老人',
  body: '你在他旁边坐下。',
  reason: '',
  consent: true,
  artKey: 'sketch-oldman' as const,
}

describe('game store', () => {
  beforeEach(() => {
    localStorage.clear()
    useGameStore.getState().resetProgress()
  })

  it('completes onboarding with the traveler fallback', () => {
    useGameStore.getState().completeOnboarding({
      name: '   ',
      avatarId: 'chenguang',
      lifeStages: [],
      topics: [],
    })
    const save = useGameStore.getState().save
    expect(save.profile.name).toBe('旅人')
    expect(save.profile.createdAt).not.toBeNull()
    expect(save.progress.prologueStep).toBe(5)
  })

  it('completes an event only once', () => {
    const first = useGameStore.getState().completeEvent(eventInput)
    const second = useGameStore.getState().completeEvent(eventInput)
    expect(second).toBe(first)
    expect(useGameStore.getState().save.experiences).toHaveLength(1)
    expect(useGameStore.getState().save.events.bench?.experienceId).toBe(first)
  })

  it('stores submitted consent independently of the default in one commit', () => {
    useGameStore.getState().updateSettings({ defaultExperienceConsent: true })
    let commits = 0
    const unsubscribe = useGameStore.subscribe(() => { commits += 1 })
    useGameStore.getState().completeEvent({ ...eventInput, consent: false })
    unsubscribe()
    expect(commits).toBe(1)
    expect(useGameStore.getState().save.experiences[0]?.consent).toBe(false)
    useGameStore.getState().updateSettings({ defaultExperienceConsent: false })
    expect(useGameStore.getState().save.experiences[0]?.consent).toBe(false)
  })

  it('creates one automatic review when an action completes', () => {
    const actionId = useGameStore.getState().createAction({
      title: '去公园走一圈',
      sourceLabel: '关于疲惫',
      when: 'today',
      artKey: 'sketch-park',
    })
    expect(useGameStore.getState().changeActionStatus(actionId, 'doing')).toBe(true)
    expect(useGameStore.getState().completeAction(actionId)).toBe(true)
    expect(useGameStore.getState().completeAction(actionId)).toBe(false)
    expect(useGameStore.getState().save.journals.filter((journal) => journal.actionId === actionId)).toHaveLength(1)
  })

  it('keeps an edited automatic review linked across repeated completions', () => {
    const actionId = useGameStore.getState().createAction({
      title: '去公园走一圈',
      sourceLabel: '关于疲惫',
      when: 'today',
      artKey: 'sketch-park',
    })
    useGameStore.getState().changeActionStatus(actionId, 'doing')
    useGameStore.getState().completeAction(actionId)
    const review = useGameStore.getState().save.journals[0]
    expect(review).toBeDefined()
    useGameStore.getState().updateJournal(review!.id, {
      type: 'action',
      text: '我慢慢走完了一圈，风吹过来的时候轻松了一些。',
      period: '傍晚',
      sceneId: 'park',
      linkLabel: '关联地点：公园',
      artKey: 'sketch-park',
    })
    expect(useGameStore.getState().save.journals[0]?.actionId).toBe(actionId)
    expect(useGameStore.getState().save.journals[0]?.linkLabel).toBe('关联行动：去公园走一圈')
    expect(useGameStore.getState().repeatAction(actionId)).toBe(true)
    useGameStore.getState().changeActionStatus(actionId, 'doing')
    expect(useGameStore.getState().completeAction(actionId)).toBe(true)
    const reviews = useGameStore.getState().save.journals.filter((journal) => journal.actionId === actionId)
    expect(reviews).toHaveLength(1)
    expect(reviews[0]?.id).toBe(review!.id)
  })

  it('keeps private journals when deleting an action', () => {
    const actionId = useGameStore.getState().createAction({
      title: '整理桌面',
      sourceLabel: '关于独处',
      when: 'someday',
      artKey: 'sketch-desk',
    })
    useGameStore.getState().changeActionStatus(actionId, 'doing')
    useGameStore.getState().completeAction(actionId)
    useGameStore.getState().deleteAction(actionId)
    const save = useGameStore.getState().save
    expect(save.actions).toHaveLength(0)
    expect(save.journals).toHaveLength(1)
    expect(save.journals[0]?.actionId).toBeNull()
  })

  it('regenerates a stale observation from currently approved sources', () => {
    const ids = ['a', 'b', 'c'].map((id) =>
      useGameStore.getState().completeEvent({ ...eventInput, eventId: id, sceneId: id }),
    )
    const insightId = useGameStore.getState().ensureInsight({ key: '关于独处', text: '你需要安静。', sourceExperienceIds: ids })
    useGameStore.getState().judgeInsight(insightId, 'rewritten', '我需要在安静里恢复。')
    useGameStore.getState().setExperienceConsent(ids[0]!, false)
    const replacementId = useGameStore.getState().completeEvent({ ...eventInput, eventId: 'd', sceneId: 'park' })
    expect(useGameStore.getState().ensureInsight({ key: '关于独处', text: '你需要安静。', sourceExperienceIds: [ids[1]!, ids[2]!, replacementId] })).toBe(insightId)
    const insight = useGameStore.getState().save.insights[0]
    expect(insight?.status).toBe('guess')
    expect(insight?.rewrittenText).toBeNull()
    expect(insight?.sourceExperienceIds).not.toContain(ids[0])
    expect(insight?.sourceExperienceIds).toContain(replacementId)
  })

  it('invalidates reflection eligibility when consent is revoked', () => {
    const ids = ['a', 'b', 'c'].map((id) =>
      useGameStore.getState().completeEvent({ ...eventInput, eventId: id, sceneId: id }),
    )
    ids.forEach((id) => useGameStore.getState().setExperienceConsent(id, false))
    expect(useGameStore.getState().save.experiences.every((item) => !item.consent)).toBe(true)
  })

  it('clears player preferences together with the save', () => {
    localStorage.setItem('shiji.player.v1', JSON.stringify({ volume: 0.3, trackIndex: 2 }))
    useGameStore.getState().resetProgress()
    expect(localStorage.getItem('shiji.player.v1')).toBeNull()
  })
})
