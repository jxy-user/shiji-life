import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createEmptySave } from '../../src/domain/state'
import { LEGACY_SAVE_KEY, loadSave, SAVE_KEY, writeSave } from '../../src/store/persistence'

describe('v2 persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('starts with an empty save and ignores v1 data', () => {
    localStorage.setItem(LEGACY_SAVE_KEY, JSON.stringify({ profile: { name: '旧存档' } }))
    const result = loadSave()
    expect(result.status).toBe('ready')
    expect(result.save.profile.createdAt).toBeNull()
    expect(result.save.actions).toEqual([])
  })

  it('round-trips a valid v2 save', () => {
    const save = createEmptySave()
    save.profile.name = '林晚'
    expect(writeSave(save).status).toBe('ready')
    expect(loadSave().save.profile.name).toBe('林晚')
  })

  it('reports broken data without overwriting it', () => {
    localStorage.setItem(SAVE_KEY, '{not-json')
    const result = loadSave()
    expect(result.status).toBe('broken')
    expect(localStorage.getItem(SAVE_KEY)).toBe('{not-json')
  })

  it('reports unavailable storage instead of silently using demo data', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    expect(loadSave().status).toBe('unavailable')
  })
})
