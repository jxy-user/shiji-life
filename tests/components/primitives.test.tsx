import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChoiceGroup, SwitchRow } from '../../src/components/forms/FormPrimitives'
import { ModalSheet, ToastRegion } from '../../src/components/feedback/Feedback'
import { PaperButton } from '../../src/components/g/GPrimitives'
import { useUIStore } from '../../src/store/uiStore'

function ChoiceHarness() {
  const [value, setValue] = useState<string[]>([])
  return <ChoiceGroup legend="选择状态" options={[{ value: 'a', label: '想休息' }, { value: 'b', label: '想出发' }]} value={value} onChange={setValue} />
}

function SwitchHarness() {
  const [checked, setChecked] = useState(false)
  return <SwitchRow checked={checked} onChange={setChecked} label="默认授权" description="影响之后的经历" stateLabel={['关闭', '开启']} />
}

describe('G form and feedback primitives', () => {
  it('toggles native checkbox choices', async () => {
    const user = userEvent.setup()
    render(<ChoiceHarness />)
    const choice = screen.getByRole('checkbox', { name: '想休息' })
    expect(choice).not.toBeChecked()
    await user.click(screen.getByText('想休息'))
    expect(choice).toBeChecked()
  })

  it('announces switch state through native semantics', async () => {
    const user = userEvent.setup()
    render(<SwitchHarness />)
    const control = screen.getByRole('switch', { name: /默认授权/ })
    await user.click(screen.getByText('默认授权'))
    expect(control).toBeChecked()
  })

  it('does not repeat the close callback when the parent closes the dialog', () => {
    const onClose = vi.fn()
    const { rerender } = render(<ModalSheet open onClose={onClose} title="测试弹层">内容</ModalSheet>)
    rerender(<ModalSheet open={false} onClose={onClose} title="测试弹层">内容</ModalSheet>)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('exposes toast messages in a live region', () => {
    useUIStore.getState().showToast('这条记录已保存。')
    render(<ToastRegion />)
    expect(screen.getByRole('status')).toHaveTextContent('这条记录已保存。')
    expect(screen.getByRole('status')).toHaveTextContent('已记录')
  })

  it('marks warn toasts and disables a loading button', () => {
    useUIStore.getState().showToast('本机数据已清空。', 'warn')
    render(<ToastRegion />)
    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('需要注意')
    expect(status).toHaveTextContent('本机数据已清空。')

    render(<PaperButton loading>保存</PaperButton>)
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '保存' })).toHaveAttribute('aria-busy', 'true')
  })
})
