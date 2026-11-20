import { describe, expect, it } from 'vitest'

import { gameEventSchema } from '@/game/eventSchema'
import { GAME_EVENTS, pendingEventFor } from './events'

describe('事件数据', () => {
  it('全部通过 schema 校验', () => {
    for (const event of GAME_EVENTS) {
      expect(() => gameEventSchema.parse(event)).not.toThrow()
    }
  })

  it('事件 id 不重复', () => {
    const ids = GAME_EVENTS.map((event) => event.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('首章四个场景各有一个可触发事件', () => {
    const scenes = new Set(GAME_EVENTS.map((event) => event.sceneId))
    expect(scenes).toEqual(new Set(['plaza', 'home', 'campus', 'park']))
  })

  it('首章至少有五个事件，且有一个会邀请玩家补充理由', () => {
    expect(GAME_EVENTS.length).toBeGreaterThanOrEqual(5)
    expect(GAME_EVENTS.some((event) => event.memory.askReason)).toBe(true)
  })

  it('每个事件都有 2–4 个选项，且结果文案非空', () => {
    for (const event of GAME_EVENTS) {
      expect(event.choices.length).toBeGreaterThanOrEqual(2)
      expect(event.choices.length).toBeLessThanOrEqual(4)
      for (const choice of event.choices) {
        expect(choice.result.length).toBeGreaterThan(0)
      }
    }
  })

  it('已经历过的事件不会再出现，直到该场景的事件都结束', () => {
    expect(pendingEventFor('campus', [])?.id).toBe('campus_001')
    expect(pendingEventFor('campus', ['campus_001'])?.id).toBe('campus_002')
    expect(pendingEventFor('campus', ['campus_001', 'campus_002'])).toBeUndefined()
  })
})
