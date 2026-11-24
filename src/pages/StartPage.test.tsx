import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LIFE_NODES } from '@/data/lifeStory'
import { createInitialSave } from '@/game/saveSchema'
import { SAVE_KEY } from '@/services/storage'
import { useLifeStore } from '@/stores/useLifeStore'
import StartPage from './StartPage'

function LocationProbe() {
  const location = useLocation()
  return <p data-testid="path">{location.pathname}</p>
}

function renderStart() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <StartPage />
      <LocationProbe />
    </MemoryRouter>,
  )
}

function arrive() {
  fireEvent.click(screen.getByRole('button', { name: '跳过' }))
}

beforeEach(() => {
  window.localStorage.clear()
  useLifeStore.setState({ save: null })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('StartPage 门厅', () => {
  it('抵达门前显示标题与门扉提示，白幕字幕逐句播放后进入人生线', () => {
    vi.useFakeTimers()
    renderStart()

    expect(screen.getByRole('heading', { name: '拾己' })).toBeInTheDocument()

    const doorBefore = screen.getByRole('button', { name: '轻触门扉，推门进入' })
    expect(doorBefore).toBeDisabled()

    arrive()

    expect(screen.queryByRole('button', { name: '跳过' })).not.toBeInTheDocument()
    const door = screen.getByRole('button', { name: '轻触门扉，推门进入' })
    expect(door).toBeEnabled()

    fireEvent.click(door)
    act(() => {
      vi.advanceTimersByTime(1600)
    })

    expect(screen.getAllByText('先生活，再认识自己。').length).toBeGreaterThan(0)
    expect(
      screen.queryByText('在这座还没建完的城市里，选择没有标准答案。'),
    ).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2600)
    })
    expect(screen.queryByText('先生活，再认识自己。')).not.toBeInTheDocument()
    expect(
      screen.getAllByText('在这座还没建完的城市里，选择没有标准答案。').length,
    ).toBeGreaterThan(0)

    act(() => {
      vi.advanceTimersByTime(2600)
    })
    expect(
      screen.getAllByText('你经历的每件小事，都会在某个时刻被温柔地回望。').length,
    ).toBeGreaterThan(0)

    act(() => {
      vi.advanceTimersByTime(2600)
    })

    expect(screen.getByTestId('path')).toHaveTextContent('/life')
  })

  it('白幕上点击可跳过字幕直接进入', () => {
    vi.useFakeTimers()
    renderStart()

    arrive()
    fireEvent.click(screen.getByRole('button', { name: '轻触门扉，推门进入' }))
    act(() => {
      vi.advanceTimersByTime(1600)
    })

    const curtain = document.querySelector('[data-door-curtain]')
    expect(curtain).not.toBeNull()
    fireEvent.click(curtain as Element)

    expect(screen.getByTestId('path')).toHaveTextContent('/life')
  })

  it('有人生存档时白幕结束后继续当前人生', () => {
    vi.useFakeTimers()
    useLifeStore.getState().start()
    renderStart()

    arrive()
    fireEvent.click(screen.getByRole('button', { name: '轻触门扉，推门进入' }))
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    act(() => {
      vi.advanceTimersByTime(2600)
    })
    act(() => {
      vi.advanceTimersByTime(2600)
    })
    act(() => {
      vi.advanceTimersByTime(2600)
    })

    expect(screen.getByTestId('path')).toHaveTextContent('/life')
  })

  it('人生已结束时白幕结束后进入回放', () => {
    vi.useFakeTimers()
    useLifeStore.setState({
      save: {
        version: 1,
        startedAt: new Date().toISOString(),
        currentIndex: LIFE_NODES.length,
        choices: [],
        finishedAt: new Date().toISOString(),
        pendingChoice: null,
      },
    })
    renderStart()

    arrive()
    fireEvent.click(screen.getByRole('button', { name: '轻触门扉，推门进入' }))
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    act(() => {
      vi.advanceTimersByTime(2600)
    })
    act(() => {
      vi.advanceTimersByTime(2600)
    })
    act(() => {
      vi.advanceTimersByTime(2600)
    })

    expect(screen.getByTestId('path')).toHaveTextContent('/life/replay')
  })

  it('门前显示人生线当前年龄', () => {
    useLifeStore.getState().start()
    renderStart()

    expect(screen.getByText('18 岁 · 未完成之城')).toBeInTheDocument()
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
