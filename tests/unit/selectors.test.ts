import { beforeEach, describe, expect, it } from 'vitest'
import { selectApprovedExperiences, selectReflectionStats } from '../../src/domain/selectors'
import { createEmptySave } from '../../src/domain/state'
import type { Experience } from '../../src/domain/types'

function experience(id: string, sceneId: string, consent = true): Experience {
  return {
    id,
    eventId: id,
    sceneId,
    title: id,
    body: id,
    kind: 'event',
    occurredAt: '2026-11-24T12:00:00.000Z',
    consent,
    consentUpdatedAt: '2026-11-24T12:00:00.000Z',
    deletedAt: null,
    artKey: 'sketch-plaza',
  }
}

describe('reflection selectors', () => {
  beforeEach(() => localStorage.clear())

  it('only counts active approved experiences', () => {
    const save = createEmptySave()
    save.experiences = [
      experience('a', 'plaza'),
      experience('b', 'park'),
      experience('c', 'home'),
      experience('d', 'school', false),
      { ...experience('e', 'studio'), deletedAt: '2026-11-24T13:00:00.000Z' },
    ]
    expect(selectApprovedExperiences(save)).toHaveLength(3)
    expect(selectReflectionStats(save)).toEqual({ approvedCount: 3, categoryCount: 3, eligible: true })
  })

  it('requires both the experience and category thresholds', () => {
    const save = createEmptySave()
    save.experiences = [experience('a', 'plaza'), experience('b', 'plaza'), experience('c', 'plaza')]
    expect(selectReflectionStats(save)).toEqual({ approvedCount: 3, categoryCount: 1, eligible: false })
  })
})
