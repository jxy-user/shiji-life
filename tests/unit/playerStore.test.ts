import { beforeEach, describe, expect, it } from 'vitest'
import { formatTime, PLAYER_KEY, usePlayerStore, clearPlayerPrefs } from '../../src/features/player/playerStore'
import { tracks } from '../../src/features/player/tracks'

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

describe('player store', () => {
  beforeEach(() => {
    localStorage.clear()
    resetPlayer()
  })

  it('formats seconds as mm:ss and clamps invalid input', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(61)).toBe('1:01')
    expect(formatTime(180)).toBe('3:00')
    expect(formatTime(3599)).toBe('59:59')
    expect(formatTime(Number.NaN)).toBe('0:00')
    expect(formatTime(-5)).toBe('0:00')
  })

  it('clamps track index into range', () => {
    usePlayerStore.getState().setTrackIndex(999)
    expect(usePlayerStore.getState().trackIndex).toBe(tracks.length - 1)
    usePlayerStore.getState().setTrackIndex(-3)
    expect(usePlayerStore.getState().trackIndex).toBe(0)
  })

  it('persists volume and repeat preferences', () => {
    usePlayerStore.getState().setVolume(0.4)
    usePlayerStore.getState().setRepeat('one')
    const raw = JSON.parse(localStorage.getItem(PLAYER_KEY) ?? '{}')
    expect(raw.volume).toBeCloseTo(0.4, 5)
    expect(raw.repeat).toBe('one')
  })

  it('mutes automatically when volume hits zero', () => {
    usePlayerStore.getState().setVolume(0)
    expect(usePlayerStore.getState().muted).toBe(true)
    usePlayerStore.getState().setVolume(0.5)
    expect(usePlayerStore.getState().muted).toBe(false)
  })

  it('ignores non-finite duration when updating progress', () => {
    usePlayerStore.getState().setProgress(12, Number.NaN)
    expect(usePlayerStore.getState().currentTime).toBe(12)
    expect(usePlayerStore.getState().duration).toBe(tracks[0]?.duration ?? 0)
  })

  it('clears persisted prefs for reset', () => {
    usePlayerStore.getState().setVolume(0.3)
    expect(localStorage.getItem(PLAYER_KEY)).not.toBeNull()
    clearPlayerPrefs()
    expect(localStorage.getItem(PLAYER_KEY)).toBeNull()
  })
})
