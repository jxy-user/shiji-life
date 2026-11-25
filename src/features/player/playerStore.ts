import { create } from 'zustand'
import { clampTrackIndex, tracks } from './tracks'

export const PLAYER_KEY = 'shiji.player.v1'

export type RepeatMode = 'off' | 'all' | 'one'
export type PlayerStatus = 'idle' | 'loading' | 'ready' | 'error'

interface PersistedPrefs {
  trackIndex: number
  volume: number
  muted: boolean
  repeat: RepeatMode
}

const defaults: PersistedPrefs = {
  trackIndex: 0,
  volume: 0.65,
  muted: false,
  repeat: 'all',
}

function readPrefs(): PersistedPrefs {
  try {
    const raw = globalThis.localStorage?.getItem(PLAYER_KEY)
    if (!raw) return { ...defaults }
    const parsed = JSON.parse(raw) as Partial<PersistedPrefs>
    const volume = typeof parsed.volume === 'number' && Number.isFinite(parsed.volume)
      ? Math.min(Math.max(parsed.volume, 0), 1)
      : defaults.volume
    const repeat: RepeatMode = parsed.repeat === 'off' || parsed.repeat === 'one' || parsed.repeat === 'all'
      ? parsed.repeat
      : defaults.repeat
    return {
      trackIndex: clampTrackIndex(typeof parsed.trackIndex === 'number' ? parsed.trackIndex : 0),
      volume,
      muted: parsed.muted === true,
      repeat,
    }
  } catch {
    return { ...defaults }
  }
}

function writePrefs(prefs: PersistedPrefs) {
  try {
    globalThis.localStorage?.setItem(PLAYER_KEY, JSON.stringify(prefs))
  } catch {
    /* 存储不可用时只保留会话内偏好 */
  }
}

/** 把秒数格式化为 mm:ss；非法值回落到 0:00。 */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}:${rest.toString().padStart(2, '0')}`
}

interface PlayerStore extends PersistedPrefs {
  isPlaying: boolean
  currentTime: number
  duration: number
  expanded: boolean
  status: PlayerStatus
  setTrackIndex: (index: number) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setRepeat: (repeat: RepeatMode) => void
  setPlaying: (playing: boolean) => void
  setProgress: (currentTime: number, duration: number) => void
  setStatus: (status: PlayerStatus) => void
  setExpanded: (expanded: boolean) => void
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
  const persist = (patch: Partial<PersistedPrefs>) => {
    const { trackIndex, volume, muted, repeat } = { ...get(), ...patch }
    writePrefs({ trackIndex, volume, muted, repeat })
  }

  return {
    ...readPrefs(),
    isPlaying: false,
    currentTime: 0,
    duration: tracks[clampTrackIndex(0)]?.duration ?? 0,
    expanded: false,
    status: 'idle',

    setTrackIndex: (index) => {
      const next = clampTrackIndex(index)
      persist({ trackIndex: next })
      set({ trackIndex: next, currentTime: 0, duration: tracks[next]?.duration ?? 0, status: 'idle' })
    },

    setVolume: (volume) => {
      const next = Math.min(Math.max(volume, 0), 1)
      persist({ volume: next, muted: next === 0 })
      set({ volume: next, muted: next === 0 })
    },

    setMuted: (muted) => {
      persist({ muted })
      set({ muted })
    },

    setRepeat: (repeat) => {
      persist({ repeat })
      set({ repeat })
    },

    setPlaying: (playing) => set({ isPlaying: playing }),

    setProgress: (currentTime, duration) => set({
      currentTime: Number.isFinite(currentTime) ? Math.max(0, currentTime) : 0,
      ...(Number.isFinite(duration) && duration > 0 ? { duration } : {}),
    }),

    setStatus: (status) => set({ status }),
    setExpanded: (expanded) => set({ expanded }),
  }
})

/** 清空本机数据时一并移除播放器偏好并停止播放。 */
export function clearPlayerPrefs(): void {
  try {
    globalThis.localStorage?.removeItem(PLAYER_KEY)
  } catch {
    /* 存储不可用时无需处理 */
  }
  usePlayerStore.setState({
    ...defaults,
    isPlaying: false,
    currentTime: 0,
    duration: tracks[0]?.duration ?? 0,
    expanded: false,
    status: 'idle',
  })
}
