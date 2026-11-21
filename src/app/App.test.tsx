import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { createInitialSave } from '@/game/saveSchema'
import { SAVE_KEY } from '@/services/storage'
import { useGameStore } from '@/stores/useGameStore'
import { useUiStore } from '@/stores/useUiStore'
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
  useGameStore.setState({ save: null, hasSave: false })
  useUiStore.setState({ persistenceError: false })
})

describe('路由', () => {
  it('根路径展示开始页', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })

  it('没有存档时访问城市会回到开始页', async () => {
    renderAt('/city')

    expect(await screen.findByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })

  it('日记页面可正常访问', async () => {
    renderAt('/journal')

    expect(await screen.findByRole('heading', { name: '日记' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '城市' })).toHaveAttribute(
      'href',
      '#/city',
    )
  })

  it('人生档案在没有存档时回到开始页', async () => {
    renderAt('/archive')

    expect(await screen.findByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })

  it('未知路径回到开始页', () => {
    renderAt('/not-exist')

    expect(screen.getByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })

  it('写盘失败时在页面上提示玩家', () => {
    useUiStore.setState({ persistenceError: true })

    renderAt('/')

    expect(screen.getByRole('status')).toHaveTextContent('刷新后会丢失')
  })

  it('存档结构损坏时给出明确提示，而不是静默跳转', async () => {
    const broken = createInitialSave({
      nickname: '小满',
      avatarId: 'sun',
      lifeStage: null,
      explorationTopic: null,
    })
    window.localStorage.setItem(
      SAVE_KEY,
      JSON.stringify({ ...broken, experiences: [{ id: 'bad' }] }),
    )

    renderAt('/city')

    expect(await screen.findByText(/上一份存档读不出来/)).toBeInTheDocument()
    // 已知读不出来的存档不再提供继续入口，避免反复弹回
    expect(screen.getByRole('button', { name: '继续旅程' })).toBeDisabled()
  })

  it('有存档时可以直接进入城市', async () => {
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
      await screen.findByRole('heading', { name: /小满，想去哪里走走/ }),
    ).toBeInTheDocument()
  })
})
