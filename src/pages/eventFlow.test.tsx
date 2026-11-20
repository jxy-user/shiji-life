import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/app/App'
import { createInitialSave } from '@/game/saveSchema'
import { loadSave } from '@/services/saveService'
import { useGameStore } from '@/stores/useGameStore'

function seedSave() {
  const save = createInitialSave({
    nickname: '小满',
    avatarId: 'sun',
    lifeStage: null,
    explorationTopic: null,
  })
  useGameStore.setState({ save, hasSave: true })
  return save
}

beforeEach(() => {
  window.localStorage.clear()
  useGameStore.setState({ save: null, hasSave: false })
})

describe('事件流程', () => {
  it('做出选择后写为一条经历，并能在档案里查到', async () => {
    const user = userEvent.setup()
    seedSave()

    render(
      <MemoryRouter initialEntries={['/event/campus_001']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', { name: '那个没有发出的消息' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /主动问问具体安排/ }))

    expect(screen.getByText(/你发了消息/)).toBeInTheDocument()
    expect(screen.getByText(/已记入「校园」的经历/)).toBeInTheDocument()

    const save = loadSave()
    expect(save?.experiences).toHaveLength(1)
    expect(save?.experiences[0].choiceId).toBe('ask')
    // 默认不授权：不用含糊文案替玩家同意
    expect(save?.experiences[0].analysisConsent).toBe(false)
    expect(save?.experiences[0].playerReason).toBeNull()
    expect(save?.experiences[0].gameDay).toBe(1)
    expect(save?.seenEventIds).toContain('campus_001')

    await user.click(screen.getByRole('link', { name: '去人生档案看看' }))

    expect(
      await screen.findByRole('heading', { name: '人生档案' }),
    ).toBeInTheDocument()
    expect(screen.getByText('主动问问具体安排')).toBeInTheDocument()
    expect(screen.getByText('共 1 条')).toBeInTheDocument()
  })

  it('同一事件不会重复触发', async () => {
    const user = userEvent.setup()
    const save = seedSave()
    useGameStore.setState({
      save: { ...save, seenEventIds: ['campus_001'] },
      hasSave: true,
    })

    render(
      <MemoryRouter initialEntries={['/event/campus_001']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('这件事已经过去了。')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: '回到城市' }))
    expect(
      await screen.findByRole('heading', { name: /想去哪里走走/ }),
    ).toBeInTheDocument()
  })

  it('可选理由不写也能完成，写了才保存', async () => {
    const user = userEvent.setup()
    seedSave()

    render(
      <MemoryRouter initialEntries={['/event/home_001']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(
      await screen.findByRole('button', { name: /先做一个最小的版本/ }),
    )

    expect(loadSave()?.experiences[0].playerReason).toBeNull()

    await user.type(
      screen.getByLabelText(/当时是怎么想的/),
      '因为想先看到结果',
    )
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(loadSave()?.experiences[0].playerReason).toBe('因为想先看到结果')
  })

  it('打开「新经历默认授权」后只影响之后创建的经历', async () => {
    const user = userEvent.setup()
    seedSave()

    useGameStore.getState().recordExperience({
      eventId: 'park_001',
      eventTitle: '被落下的书',
      sceneId: 'park',
      experienceType: 'inner',
      choiceId: 'leave',
      choiceText: '留在原地，继续散步',
      outcome: ['你把书摆回原处。'],
      analysisConsent: false,
    })
    useGameStore.getState().setAnalysisConsentDefault(true)

    render(
      <MemoryRouter initialEntries={['/event/campus_001']}>
        <App />
      </MemoryRouter>,
    )
    await user.click(
      await screen.findByRole('button', { name: /主动问问具体安排/ }),
    )

    const experiences = loadSave()?.experiences ?? []
    expect(experiences).toHaveLength(2)
    expect(experiences[0].analysisConsent).toBe(false)
    expect(experiences[1].analysisConsent).toBe(true)
  })

  it('在档案里撤回授权与删除经历', async () => {
    const user = userEvent.setup()
    seedSave()

    render(
      <MemoryRouter initialEntries={['/event/campus_001']}>
        <App />
      </MemoryRouter>,
    )
    await user.click(
      await screen.findByRole('button', { name: /主动问问具体安排/ }),
    )
    await user.click(screen.getByRole('link', { name: '去人生档案看看' }))

    const consentSwitch = await screen.findByRole('switch', {
      name: '已撤回授权',
    })
    await user.click(consentSwitch)
    expect(loadSave()?.experiences[0].analysisConsent).toBe(true)

    await user.click(screen.getByRole('button', { name: '删除' }))
    await user.click(screen.getByRole('button', { name: '再次点击确认删除' }))

    expect(screen.queryByText('主动问问具体安排')).not.toBeInTheDocument()
    expect(loadSave()?.experiences[0].deletedAt).not.toBeNull()
  })
})
