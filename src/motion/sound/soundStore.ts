import { create } from 'zustand'

export const SOUND_KEY = 'shiji.sound.v1'

export interface SoundPrefs {
  /** 应用内音效（盖章、落纸、完成音），默认关 */
  sfxEnabled: boolean
  /** 片头/章节配乐动机，默认开（仍受浏览器手势限制） */
  musicEnabled: boolean
  /** 环境音，默认关 */
  ambienceEnabled: boolean
}

const defaults: SoundPrefs = {
  sfxEnabled: false,
  musicEnabled: true,
  ambienceEnabled: false,
}

function readPrefs(): SoundPrefs {
  try {
    const raw = globalThis.localStorage?.getItem(SOUND_KEY)
    if (!raw) return { ...defaults }
    const parsed = JSON.parse(raw) as Partial<SoundPrefs>
    return {
      sfxEnabled: parsed.sfxEnabled === true,
      musicEnabled: parsed.musicEnabled !== false,
      ambienceEnabled: parsed.ambienceEnabled === true,
    }
  } catch {
    return { ...defaults }
  }
}

function writePrefs(prefs: SoundPrefs) {
  try {
    globalThis.localStorage?.setItem(SOUND_KEY, JSON.stringify(prefs))
  } catch {
    /* 存储不可用时只保留会话内偏好 */
  }
}

interface SoundStore {
  prefs: SoundPrefs
  setSfxEnabled: (value: boolean) => void
  setMusicEnabled: (value: boolean) => void
  setAmbienceEnabled: (value: boolean) => void
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  prefs: readPrefs(),
  setSfxEnabled: (value) => {
    const next = { ...get().prefs, sfxEnabled: value }
    writePrefs(next)
    set({ prefs: next })
  },
  setMusicEnabled: (value) => {
    const next = { ...get().prefs, musicEnabled: value }
    writePrefs(next)
    set({ prefs: next })
  },
  setAmbienceEnabled: (value) => {
    const next = { ...get().prefs, ambienceEnabled: value }
    writePrefs(next)
    set({ prefs: next })
  },
}))
