import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePlayerStore } from '../../src/features/player/playerStore'
import { tracks } from '../../src/features/player/tracks'

const play = vi.fn().mockResolvedValue(undefined)
const pause = vi.fn()
const seek = vi.fn()
const setVolume = vi.fn()
const warmup = vi.fn()
const setHandlers = vi.fn()
const startFromAutoplay = vi.fn().mockResolvedValue(true)
const resumeAndPlay = vi.fn().mockResolvedValue(undefined)

vi.mock('../../src/features/player/audioEngine', () => ({
  audioEngine: { play, pause, seek, setVolume, warmup, setHandlers, startFromAutoplay, resumeAndPlay, unload: vi.fn() },
}))

const { PlayerDock } = await import('../../src/features/player/PlayerDock')

function resetPlayer() {
  usePlayerStore.setState({
    trackIndex: 0,
    volume: 0.65,
    muted: false,
    repeat: 'all',
    isPlaying: false,
    currentTime: 0,
    duration: tracks[0]?.duration ?? 0,
    expanded: false,
    status: 'idle',
  })
}

describe('player dock', () => {
  beforeEach(() => {
    localStorage.clear()
    resetPlayer()
    vi.clearAllMocks()
  })

  it('renders the millennium track first by default', () => {
    expect(tracks[0]?.id).toBe('millennium-ambient')
    expect(tracks[0]?.title).toBe('千年之后（氛围版）')
  })

  it('renders a collapsed badge and expands on click', async () => {
    const user = userEvent.setup()
    render(<PlayerDock />)
    const toggle = screen.getByRole('button', { name: '展开音乐播放器' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(usePlayerStore.getState().expanded).toBe(true)
    expect(screen.getByRole('button', { name: '收起播放面板' })).toBeInTheDocument()
  })

  it('plays the current track when the play button is pressed', async () => {
    const user = userEvent.setup()
    usePlayerStore.setState({ expanded: true })
    render(<PlayerDock />)
    await user.click(screen.getByRole('button', { name: /^播放$/ }))
    expect(play).toHaveBeenCalledWith('millennium-ambient', 0.65, false)
  })

  it('pauses when already playing', async () => {
    const user = userEvent.setup()
    usePlayerStore.setState({ expanded: true, isPlaying: true })
    render(<PlayerDock />)
    await user.click(screen.getByRole('button', { name: /^暂停$/ }))
    expect(pause).toHaveBeenCalled()
  })

  it('moves to the next track and plays it', async () => {
    const user = userEvent.setup()
    usePlayerStore.setState({ expanded: true })
    render(<PlayerDock />)
    await user.click(screen.getByRole('button', { name: '下一首' }))
    expect(usePlayerStore.getState().trackIndex).toBe(1)
    expect(play).toHaveBeenCalledWith('healing-lake', 0.65, false)
  })

  it('toggles mute and exposes volume state', async () => {
    const user = userEvent.setup()
    usePlayerStore.setState({ expanded: true })
    render(<PlayerDock />)
    await user.click(screen.getByRole('button', { name: '静音' }))
    expect(usePlayerStore.getState().muted).toBe(true)
    expect(screen.getByRole('button', { name: '取消静音' })).toBeInTheDocument()
  })

  it('seeks when the progress slider changes', () => {
    usePlayerStore.setState({ expanded: true, duration: 134 })
    render(<PlayerDock />)
    const slider = screen.getByRole('slider', { name: '播放进度' })
    expect(slider).toHaveAttribute('aria-valuetext', '0:00 / 2:14')
  })
})
