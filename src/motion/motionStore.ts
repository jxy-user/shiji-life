import { create } from 'zustand'

export const MOTION_KEY = 'shiji.motion.v1'

export interface MotionPrefs {
  introSeenAt: string | null
}

const defaults: MotionPrefs = {
  introSeenAt: null,
}

function readPrefs(): MotionPrefs {
  try {
    const raw = globalThis.localStorage?.getItem(MOTION_KEY)
    if (!raw) return { ...defaults }
    const parsed = JSON.parse(raw) as Partial<MotionPrefs>
    return {
      introSeenAt: typeof parsed.introSeenAt === 'string' ? parsed.introSeenAt : null,
    }
  } catch {
    return { ...defaults }
  }
}

function writePrefs(prefs: MotionPrefs) {
  try {
    globalThis.localStorage?.setItem(MOTION_KEY, JSON.stringify(prefs))
  } catch {
    /* 存储不可用时静默降级：只是不再记住偏好 */
  }
}

interface MotionStore {
  prefs: MotionPrefs
  markIntroSeen: () => void
}

export const useMotionStore = create<MotionStore>((set, get) => ({
  prefs: readPrefs(),
  markIntroSeen: () => {
    const next: MotionPrefs = { ...get().prefs, introSeenAt: new Date().toISOString() }
    writePrefs(next)
    set({ prefs: next })
  },
}))
