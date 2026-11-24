import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { LIFE_NODES } from '@/data/lifeStory'
import { createInitialSave } from '@/game/saveSchema'
import { SAVE_KEY } from '@/services/storage'
import { useLifeStore } from '@/stores/useLifeStore'
import StartPage from './StartPage'

function renderStart() {
  return render(
    <MemoryRouter>
      <StartPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  useLifeStore.setState({ save: null })
})

describe('StartPage', () => {
  it('展示作品名与人生线入口', () => {
    renderStart()

    expect(screen.getByRole('heading', { name: '拾己' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '开始人生 · 18 → 60' })).toHaveAttribute(
      'href',
      '/life',
    )
  })

  it('没有人生存档时「继续上次的人生」不可用', () => {
    renderStart()

    expect(screen.getByRole('button', { name: '继续上次的人生' })).toBeDisabled()
  })

  it('有人生存档时提供继续入口', () => {
    useLifeStore.getState().start()

    renderStart()

    expect(screen.getByRole('link', { name: '继续上次的人生' })).toHaveAttribute(
      'href',
      '/life',
    )
  })

  it('人生已结束时可查看回放', () => {
    useLifeStore.setState({
      save: {
        version: 1,
        startedAt: new Date().toISOString(),
        currentIndex: LIFE_NODES.length,
        choices: [],
        finishedAt: new Date().toISOString(),
      },
    })

    renderStart()

    expect(screen.getByRole('link', { name: '查看上次的回放' })).toHaveAttribute(
      'href',
      '/life/replay',
    )
  })

  it('旧存档损坏时旧版入口退回序章', () => {
    window.localStorage.setItem(SAVE_KEY, '{ broken json')

    renderStart()

    expect(
      screen.getByRole('link', { name: '进入未完成之城（旧版）' }),
    ).toHaveAttribute('href', '/prologue')
  })

  it('存在旧存档时旧版入口进入城市', () => {
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(
        createInitialSave({
          nickname: '小满',
          avatarId: 'sun',
          lifeStage: null,
          explorationTopic: null,
        }),
      ),
    )

    renderStart()

    expect(
      screen.getByRole('link', { name: '进入未完成之城（旧版）' }),
    ).toHaveAttribute('href', '/city')
  })
})
