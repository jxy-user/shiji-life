import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { createInitialSave } from '@/game/saveSchema'
import { useGameStore } from '@/stores/useGameStore'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  useGameStore.setState({ save: null, hasSave: false, persistenceError: false })
})

describe('路由', () => {
  it('根路径展示开始页', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })

  it('没有存档时访问城市会回到开始页', () => {
    renderAt('/city')

    expect(screen.getByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })

  it('未实现的页面保留占位与返回入口', () => {
    renderAt('/archive')

    expect(screen.getByRole('heading', { name: '人生档案' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /回到开始页/ })).toHaveAttribute(
      'href',
      '/',
    )
  })

  it('未知路径回到开始页', () => {
    renderAt('/not-exist')

    expect(screen.getByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })

  it('写盘失败时在页面上提示玩家', () => {
    useGameStore.setState({ persistenceError: true })

    renderAt('/')

    expect(screen.getByRole('status')).toHaveTextContent('刷新后会丢失')
  })

  it('有存档时可以直接进入城市', () => {
    useGameStore.setState({
      save: createInitialSave({
        nickname: '小满',
        avatarId: 'sun',
        lifeStage: null,
        explorationTopic: null,
      }),
      hasSave: true,
    })

    renderAt('/city')

    expect(
      screen.getByRole('heading', { name: /小满，想去哪里走走/ }),
    ).toBeInTheDocument()
  })
})
