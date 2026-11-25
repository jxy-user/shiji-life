import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LifeSave } from '@/stores/useLifeStore'
import { useLifeStore } from '@/stores/useLifeStore'
import LifeReplayPage from './LifeReplayPage'

const LIFE_KEY = 'shiji-life:life:v1'

function finishedSave(): LifeSave {
  return {
    version: 1,
    startedAt: 'x',
    currentIndex: 1,
    choices: [
      {
        nodeId: 'age_18',
        age: 18,
        title: '志愿表',
        choiceId: 'steady',
        label: '选一个稳妥的专业',
        result: '你填了一个稳妥的名字。',
        tags: ['steady'],
      },
    ],
    finishedAt: new Date().toISOString(),
    pendingChoice: null,
  }
}

function renderReplay() {
  return render(
    <MemoryRouter initialEntries={['/life/replay']}>
      <LifeReplayPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  const save = finishedSave()
  useLifeStore.setState({ save })
  window.localStorage.setItem(LIFE_KEY, JSON.stringify(save))
})

describe('LifeReplayPage 清除本地数据', () => {
  it('确认后清空人生存档、旧存档与音效偏好并回到首页', () => {
    window.localStorage.setItem('shiji-life:save:v1', '{}')
    window.localStorage.setItem('shiji-life:sound-muted', 'true')
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderReplay()
    fireEvent.click(screen.getByRole('button', { name: '清除本地数据' }))

    expect(window.localStorage.getItem(LIFE_KEY)).toBeNull()
    expect(window.localStorage.getItem('shiji-life:save:v1')).toBeNull()
    expect(window.localStorage.getItem('shiji-life:sound-muted')).toBeNull()

    confirmSpy.mockRestore()
  })

  it('取消时保留数据', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderReplay()
    fireEvent.click(screen.getByRole('button', { name: '清除本地数据' }))

    expect(window.localStorage.getItem(LIFE_KEY)).not.toBeNull()

    confirmSpy.mockRestore()
  })
})
