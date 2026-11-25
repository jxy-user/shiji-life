import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import JournalPage from '../../src/features/journal/JournalPage'
import ActionsPage from '../../src/features/actions/ActionsPage'
import SettingsPage from '../../src/features/settings/SettingsPage'
import { useGameStore } from '../../src/store/gameStore'

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<h1>开始页</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('journal, actions and settings', () => {
  beforeEach(() => {
    useGameStore.getState().resetProgress()
    useGameStore.getState().completeOnboarding({ name: '旅人', avatarId: 'chenguang', lifeStages: [], topics: [] })
  })

  it('creates, edits, filters and confirms deletion of a private journal', async () => {
    const user = userEvent.setup()
    renderRoute('/journal?new=1&scene=plaza&title=广场随记')
    let dialog = screen.getByRole('dialog')
    await user.type(within(dialog).getByLabelText(/想留下什么/), '今天在广场听见了很慢的钟声。')
    await user.click(within(dialog).getByRole('button', { name: '收进日记' }))
    expect(useGameStore.getState().save.journals).toHaveLength(1)
    expect(useGameStore.getState().save.journals[0]?.sceneId).toBe('plaza')
    await user.click(screen.getByRole('button', { name: '编辑' }))
    dialog = screen.getByRole('dialog')
    const textarea = within(dialog).getByLabelText(/想留下什么/)
    await user.clear(textarea)
    await user.type(textarea, '钟声比记忆里慢。')
    await user.click(within(dialog).getByRole('button', { name: '保存修改' }))
    expect(useGameStore.getState().save.journals[0]?.text).toBe('钟声比记忆里慢。')
    await user.click(screen.getByRole('button', { name: '行动复盘' }))
    expect(screen.getByRole('heading', { name: '这个分类还是空的' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '全部' }))
    await user.click(screen.getByRole('button', { name: '删除' }))
    dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: '确认删除' }))
    expect(useGameStore.getState().save.journals).toHaveLength(0)
  })

  it('supports the complete action lifecycle and keeps one auto review across repeats', async () => {
    const user = userEvent.setup()
    renderRoute('/actions?new=1&title=下楼走十分钟')
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByLabelText(/想做什么/)).toHaveValue('下楼走十分钟')
    await user.click(within(dialog).getByRole('button', { name: '放进行动账本' }))
    await user.click(screen.getByRole('button', { name: '开始这件事' }))
    expect(useGameStore.getState().save.actions[0]?.status).toBe('doing')
    await user.click(screen.getByRole('button', { name: '先暂停' }))
    expect(useGameStore.getState().save.actions[0]?.status).toBe('paused')
    await user.click(screen.getByRole('button', { name: '继续这件事' }))
    await user.click(screen.getByRole('button', { name: '完成并复盘' }))
    expect(useGameStore.getState().save.actions[0]?.status).toBe('done')
    expect(useGameStore.getState().save.journals).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: '再做一次' }))
    expect(useGameStore.getState().save.actions[0]?.status).toBe('todo')
    await user.click(screen.getByRole('button', { name: '开始这件事' }))
    await user.click(screen.getByRole('button', { name: '完成并复盘' }))
    expect(useGameStore.getState().save.journals).toHaveLength(1)
    await user.click(screen.getByRole('button', { name: /这篇行动已经自动留下复盘/ }))
    expect(useGameStore.getState().save.actions[0]?.status).toBe('done')
  })

  it('deletes an action while preserving and unlinking its private review', async () => {
    const user = userEvent.setup()
    useGameStore.getState().createAction({ title: '整理桌面', sourceLabel: '自己的选择', when: 'today', artKey: 'sketch-desk' })
    const id = useGameStore.getState().save.actions[0]!.id
    useGameStore.getState().changeActionStatus(id, 'doing')
    useGameStore.getState().completeAction(id)
    renderRoute(`/actions?id=${id}`)
    await user.click(screen.getByRole('button', { name: '删除行动' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText(/私人日记不会删除/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: '删除行动' }))
    expect(useGameStore.getState().save.actions).toHaveLength(0)
    expect(useGameStore.getState().save.journals).toHaveLength(1)
    expect(useGameStore.getState().save.journals[0]?.actionId).toBeNull()
  })

  it('updates privacy switches and resets v2 without touching v1', async () => {
    const user = userEvent.setup()
    localStorage.setItem('shiji.life.v1', 'legacy-must-stay')
    renderRoute('/settings')
    await user.click(screen.getByRole('switch', { name: /新经历默认授权/ }))
    await user.click(screen.getByRole('switch', { name: /接收微光邀请/ }))
    expect(useGameStore.getState().save.settings.defaultExperienceConsent).toBe(true)
    expect(useGameStore.getState().save.settings.invitationsEnabled).toBe(false)
    expect(screen.getByLabelText('固定门槛：3 条经历，2 类地点')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '清空本机数据' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: '确认清空' }))
    expect(localStorage.getItem('shiji.life.v2')).toBeNull()
    expect(localStorage.getItem('shiji.life.v1')).toBe('legacy-must-stay')
    expect(screen.getByRole('heading', { name: '开始页' })).toBeInTheDocument()
  })
})
