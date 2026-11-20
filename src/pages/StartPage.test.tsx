import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { createInitialSave } from '@/game/saveSchema'
import { SAVE_KEY } from '@/services/storage'
import StartPage from './StartPage'

function renderStart() {
  return render(
    <MemoryRouter>
      <StartPage />
    </MemoryRouter>,
  )
}

describe('StartPage', () => {
  it('展示作品名与「开始新的旅程」入口', () => {
    renderStart()

    expect(screen.getByRole('heading', { name: '拾己' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '开始新的旅程' })).toHaveAttribute(
      'href',
      '/prologue',
    )
  })

  it('没有存档时「继续旅程」不可用', () => {
    renderStart()

    expect(screen.getByRole('button', { name: '继续旅程' })).toBeDisabled()
    expect(screen.getByText('还没有存档')).toBeInTheDocument()
  })

  it('存在存档时提供继续入口', () => {
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

    expect(screen.getByRole('link', { name: '继续旅程' })).toHaveAttribute(
      'href',
      '/city',
    )
  })
})
