import { beforeEach, describe, expect, it, vi } from 'vitest'

import { LIFE_NODES, summarizeLife } from '@/data/lifeStory'
import { LIFE_SAVE_KEY, useLifeStore } from './useLifeStore'

beforeEach(() => {
  window.localStorage.clear()
  useLifeStore.setState({ save: null })
})

describe('人生线存档', () => {
  it('开始后从 18 岁节点出发', () => {
    useLifeStore.getState().start()
    const save = useLifeStore.getState().save
    expect(save?.currentIndex).toBe(0)
    expect(save?.choices).toEqual([])
    expect(save?.finishedAt).toBeNull()
  })

  it('选择后记录并推进到下一节点', () => {
    useLifeStore.getState().start()
    const first = LIFE_NODES[0]
    useLifeStore.getState().choose(first.choices[0].id)

    const save = useLifeStore.getState().save
    expect(save?.currentIndex).toBe(1)
    expect(save?.choices).toHaveLength(1)
    expect(save?.choices[0].age).toBe(18)
    expect(save?.choices[0].label).toBe(first.choices[0].label)
  })

  it('走完所有节点后标记完成', () => {
    useLifeStore.getState().start()
    for (const node of LIFE_NODES) {
      useLifeStore.getState().choose(node.choices[0].id)
    }

    const save = useLifeStore.getState().save
    expect(save?.choices).toHaveLength(LIFE_NODES.length)
    expect(save?.currentIndex).toBe(LIFE_NODES.length)
    expect(save?.finishedAt).not.toBeNull()
  })

  it('重置会清空存档', () => {
    useLifeStore.getState().start()
    useLifeStore.getState().choose(LIFE_NODES[0].choices[0].id)
    useLifeStore.getState().reset()

    expect(useLifeStore.getState().save).toBeNull()
    expect(window.localStorage.getItem(LIFE_SAVE_KEY)).toBeNull()
  })

  it('选择结果会持久化，刷新后仍能看到', () => {
    useLifeStore.getState().start()
    const first = LIFE_NODES[0]
    useLifeStore.getState().choose(first.choices[0].id)

    expect(useLifeStore.getState().save?.pendingChoice?.label).toBe(
      first.choices[0].label,
    )

    // 模拟刷新：从 localStorage 重新读取
    useLifeStore.getState().reload()
    expect(useLifeStore.getState().save?.pendingChoice?.label).toBe(
      first.choices[0].label,
    )
    expect(useLifeStore.getState().save?.currentIndex).toBe(1)
  })

  it('确认结果后清空 pendingChoice', () => {
    useLifeStore.getState().start()
    useLifeStore.getState().choose(LIFE_NODES[0].choices[0].id)
    useLifeStore.getState().clearPending()

    expect(useLifeStore.getState().save?.pendingChoice).toBeNull()
  })

  it('损坏的 choices 元素不会让存档崩溃', () => {
    window.localStorage.setItem(
      LIFE_SAVE_KEY,
      JSON.stringify({
        version: 1,
        startedAt: new Date().toISOString(),
        currentIndex: 1,
        choices: [null, { nodeId: 'age_18' }],
        finishedAt: null,
        pendingChoice: null,
      }),
    )

    useLifeStore.getState().reload()
    const save = useLifeStore.getState().save
    expect(save?.choices).toEqual([])
    expect(save?.currentIndex).toBe(0)
  })

  it('存储被禁用时仍可在本次会话内游玩', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('write blocked', 'SecurityError')
    })

    expect(() => {
      useLifeStore.getState().start()
      useLifeStore.getState().choose(LIFE_NODES[0].choices[0].id)
    }).not.toThrow()
    expect(useLifeStore.getState().save?.choices).toHaveLength(1)

    setItem.mockRestore()
  })
})

describe('人生倾向统计', () => {
  it('返回出现最多的倾向', () => {
    const summary = summarizeLife([
      { tags: ['explore'] },
      { tags: ['explore'] },
      { tags: ['steady'] },
    ])
    expect(summary.tag).toBe('explore')
    expect(summary.label).toBe('向外走')
  })

  it('没有选择时返回稳定的默认值', () => {
    const summary = summarizeLife([])
    expect(summary.tag).toBe('explore')
    expect(summary.counts.explore).toBe(0)
  })

  it('平局时使用中性描述，不写「更常」', () => {
    const summary = summarizeLife([{ tags: ['explore'] }, { tags: ['steady'] }])
    expect(summary.isTie).toBe(true)
    expect(summary.label).toBe('几种都有一点')
    expect(summary.description).not.toContain('更常')
  })

  it('null 记录不会导致统计崩溃', () => {
    const summary = summarizeLife([null, { tags: ['self'] }])
    expect(summary.counts.self).toBe(1)
  })
})
