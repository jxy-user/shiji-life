import { describe, expect, it } from 'vitest'
import { canTransition } from '../../src/domain/actionStateMachine'

describe('action state machine', () => {
  it('allows the supported lifecycle transitions', () => {
    expect(canTransition('todo', 'doing')).toBe(true)
    expect(canTransition('todo', 'paused')).toBe(true)
    expect(canTransition('doing', 'paused')).toBe(true)
    expect(canTransition('paused', 'doing')).toBe(true)
    expect(canTransition('doing', 'done')).toBe(true)
    expect(canTransition('done', 'todo')).toBe(true)
  })

  it('rejects skipped and reversed transitions', () => {
    expect(canTransition('todo', 'done')).toBe(false)
    expect(canTransition('paused', 'done')).toBe(false)
    expect(canTransition('done', 'doing')).toBe(false)
  })
})
