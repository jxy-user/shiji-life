import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('路由', () => {
  it('根路径展示开始页', () => {
    renderAt('/')

    expect(screen.getByRole('heading', { name: '拾己' })).toBeInTheDocument()
  })

  it('占位页可访问并保留返回入口', () => {
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
})
