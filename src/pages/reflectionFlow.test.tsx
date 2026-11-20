import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import App from '@/app/App'
import { loadSave } from '@/services/saveService'
import { useGameStore } from '@/stores/useGameStore'

const profile = {
  nickname: '小满',
  avatarId: 'sun' as const,
  lifeStage: null,
  explorationTopic: null,
}

function seedExperiences() {
  useGameStore.getState().beginJourney(profile)

  const store = useGameStore.getState()
  store.recordExperience({
    eventId: 'campus_001',
    eventTitle: '那个没有发出的消息',
    sceneId: 'campus',
    experienceType: 'social',
    choiceId: 'ask',
    choiceText: '主动问问具体安排',
    choiceTags: ['approach'],
    outcome: ['你发了消息。'],
    analysisConsent: true,
  })
  store.recordExperience({
    eventId: 'campus_002',
    eventTitle: '走廊里的三个人',
    sceneId: 'campus',
    experienceType: 'social',
    choiceId: 'leave',
    choiceText: '找个借口走开',
    choiceTags: ['avoid'],
    outcome: ['你走开了。'],
    analysisConsent: true,
  })
  store.recordExperience({
    eventId: 'home_001',
    eventTitle: '永远在准备开始',
    sceneId: 'home',
    experienceType: 'action',
    choiceId: 'close',
    choiceText: '把它合上，改天再说',
    choiceTags: ['avoid'],
    outcome: ['你把它收进抽屉。'],
    analysisConsent: true,
  })
}

beforeEach(() => {
  window.localStorage.clear()
  useGameStore.setState({ save: null, hasSave: false })
})

describe('阶段回顾流程', () => {
  it('经历够了以后，微光邀请 → 确认观察 → 写入人生档案', async () => {
    const user = userEvent.setup()
    seedExperiences()

    render(
      <MemoryRouter initialEntries={['/city']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: '现在聊聊' }))

    expect(
      await screen.findByRole('heading', { name: '先看看哪些事可以一起看' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '开始回顾' }))

    expect(await screen.findByText('绕开的那几步')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('微光注意到 2 条观察')

    // 第一条确认，第二条否认
    await user.click(screen.getAllByRole('button', { name: '是的，像我' })[0])
    await user.click(screen.getByRole('button', { name: '不太像' }))

    const save = loadSave()
    expect(save?.insights).toHaveLength(1)
    expect(save?.candidateInsights.filter((item) => item.status === 'confirmed')).toHaveLength(1)
    expect(save?.candidateInsights.filter((item) => item.status === 'rejected')).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: '结束这次回顾' }))
    expect(await screen.findByText('这次就到这里。')).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: '看看人生档案' }))
    expect(await screen.findByRole('heading', { name: '人生档案' })).toBeInTheDocument()
    expect(screen.getByText('绕开的那几步')).toBeInTheDocument()
  })

  it('拒绝邀请后进入冷却，城市页不再出现邀请', async () => {
    const user = userEvent.setup()
    seedExperiences()

    render(
      <MemoryRouter initialEntries={['/city']}>
        <App />
      </MemoryRouter>,
    )

    await user.click(await screen.findByRole('button', { name: '这次不聊' }))

    const save = loadSave()
    expect(save?.reflections[0].status).toBe('declined')
    expect(save?.reflections[0].cooldownUntilGameDay).toBe(2)
    expect(screen.queryByRole('button', { name: '现在聊聊' })).not.toBeInTheDocument()
  })
})
