import { beforeEach, describe, expect, it } from 'vitest'

import { loadSave } from '@/services/saveService'
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

  it('删除进度会清空本地存档', () => {
    useGameStore.getState().beginJourney(profile)
    useGameStore.getState().resetProgress()

    expect(useGameStore.getState().save).toBeNull()
    expect(loadSave()).toBeNull()
  })
})
