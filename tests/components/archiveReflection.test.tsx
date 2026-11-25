import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ArchivePage from '../../src/features/archive/ArchivePage'
import ReflectionPage from '../../src/features/reflection/ReflectionPage'
import { createEmptySave } from '../../src/domain/state'
import type { Experience, SaveV2 } from '../../src/domain/types'
import { useGameStore } from '../../src/store/gameStore'

const timestamp = '2026-11-24T10:00:00.000Z'

function seedSave(): SaveV2 {
  const save = createEmptySave()
  const experiences: Experience[] = [
    { id: 'exp-1', eventId: 'plaza-visit', sceneId: 'plaza', title: '广场上的人群', body: '你记住了钟声和风。', kind: 'scene', occurredAt: timestamp, consent: true, consentUpdatedAt: timestamp, deletedAt: null, artKey: 'plaza' },
    { id: 'exp-2', eventId: 'park-visit', sceneId: 'park', title: '晒干的长椅', body: '太阳慢慢移过草地。', kind: 'scene', occurredAt: timestamp, consent: true, consentUpdatedAt: timestamp, deletedAt: null, artKey: 'sketch-park' },
    { id: 'exp-3', eventId: 'harbor-visit', sceneId: 'harbor', title: '靠岸的船', body: '水面把远处的塔折成两截。', kind: 'scene', occurredAt: timestamp, consent: true, consentUpdatedAt: timestamp, deletedAt: null, artKey: 'sketch-bridge' },
  ]
  return {
    ...save,
    profile: { ...save.profile, name: '旅人', createdAt: timestamp },
    experiences,
    journals: [{ id: 'journal-1', type: 'free', text: '这条私人日记绝不能成为分析依据。', period: '傍晚', createdAt: timestamp, updatedAt: timestamp, actionId: null, insightId: null, sceneId: 'plaza', linkLabel: null, artKey: 'sketch-desk' }],
  }
}

function renderPage(path: string, page: 'archive' | 'reflection') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path={page} element={page === 'archive' ? <ArchivePage /> : <ReflectionPage />} /></Routes>
    </MemoryRouter>,
  )
}

describe('archive and reflection', () => {
  beforeEach(() => {
    useGameStore.getState().replaceFromStorage(seedSave())
  })

  it('opens a requested experience and supports consent, soft delete and restore', async () => {
    const user = userEvent.setup()
    renderPage('/archive?experience=exp-2', 'archive')
    expect(screen.getByRole('heading', { name: '晒干的长椅' })).toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: '允许这条经历进入阶段回顾' }))
    expect(useGameStore.getState().save.experiences.find((item) => item.id === 'exp-2')?.consent).toBe(false)
    await user.click(screen.getByRole('button', { name: '收起经历' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: '收起经历' }))
    expect(useGameStore.getState().save.experiences.find((item) => item.id === 'exp-2')?.deletedAt).not.toBeNull()
    expect(screen.queryByRole('heading', { name: '晒干的长椅' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /已收起 1 条经历/ }))
    await user.click(screen.getByRole('button', { name: '恢复' }))
    expect(useGameStore.getState().save.experiences.find((item) => item.id === 'exp-2')?.deletedAt).toBeNull()
  })

  it('creates a sourced guess, rewrites it, and immediately invalidates it after consent is revoked', async () => {
    const user = userEvent.setup()
    renderPage('/reflection', 'reflection')
    expect(screen.getByText('3 / 3 条')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /让微光留一个猜测/ }))
    expect(screen.getByText('这只是猜测')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '这条猜测的依据' })).toBeInTheDocument()
    const insight = useGameStore.getState().save.insights[0]
    expect(insight?.sourceExperienceIds).toEqual(['exp-1', 'exp-2', 'exp-3'])
    expect(useGameStore.getState().save.journals[0]?.id).not.toBe(insight?.sourceExperienceIds[0])

    await user.click(screen.getByRole('button', { name: '换成我的说法' }))
    await user.clear(screen.getByLabelText(/我的说法/))
    await user.type(screen.getByLabelText(/我的说法/), '我需要在安静里确认自己的节奏。')
    await user.click(screen.getByRole('button', { name: '保存这句话' }))
    expect(screen.getByText('换成你的说法')).toBeInTheDocument()
    expect(useGameStore.getState().save.insights[0]?.rewrittenText).toBe('我需要在安静里确认自己的节奏。')

    await user.click(screen.getByRole('switch', { name: '撤销回顾：广场上的人群' }))
    expect(screen.queryByText('换成你的说法')).not.toBeInTheDocument()
    expect(screen.getByText('这条观察的依据已经变化')).toBeInTheDocument()
    expect(screen.getByText(/还需要 1 条授权经历、0 类地点/)).toBeInTheDocument()
  })

  it('does not use private journals to satisfy the review threshold', () => {
    const save = seedSave()
    useGameStore.getState().replaceFromStorage({ ...save, experiences: save.experiences.slice(0, 2).map((item) => ({ ...item, consent: true })) })
    renderPage('/reflection', 'reflection')
    expect(screen.getByRole('heading', { name: '再等几页，也完全可以' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /让微光留一个猜测/ })).not.toBeInTheDocument()
  })

  it('keeps an editable stage summary', async () => {
    const user = userEvent.setup()
    renderPage('/archive', 'archive')
    await user.click(screen.getByRole('button', { name: '写阶段总结' }))
    const dialog = screen.getByRole('dialog')
    await user.clear(within(dialog).getByLabelText(/这一章的名字/))
    await user.type(within(dialog).getByLabelText(/这一章的名字/), '第一章 · 风开始变软')
    await user.clear(within(dialog).getByLabelText(/此刻想留下的话/))
    await user.type(within(dialog).getByLabelText(/此刻想留下的话/), '我开始记得经过的地方。')
    await user.click(within(dialog).getByRole('button', { name: '保存总结' }))
    expect(useGameStore.getState().save.summary?.title).toBe('第一章 · 风开始变软')
    expect(screen.getByRole('heading', { name: '第一章 · 风开始变软' })).toBeInTheDocument()
  })
})
