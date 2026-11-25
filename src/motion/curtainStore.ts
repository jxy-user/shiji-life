import { create } from 'zustand'
import type { CurtainTheme } from './films/chapterCurtain'

export interface CurtainPayload {
  /** 章节编号显示，如 CHAPTER 01 */
  code: string
  title: string
  subtitle?: string
  /** 章节主题：雨（01）或日光（02），缺省按标题推断 */
  theme?: CurtainTheme
  /** 幕布播完/跳过后的回调，用于衔接下一段对白，替代硬编码 setTimeout */
  onDone?: () => void
}

interface CurtainStore {
  curtain: CurtainPayload | null
  openCurtain: (payload: CurtainPayload) => void
  closeCurtain: () => void
}

/**
 * 章节过场幕布：纯视觉层。调用方自行导航，再 openCurtain 播放幕布；
 * 幕布播完/跳过后自动清场并触发 onDone，不阻塞路由与既有 E2E。
 */
export const useCurtainStore = create<CurtainStore>((set) => ({
  curtain: null,
  openCurtain: (payload) => set({ curtain: payload }),
  closeCurtain: () => set({ curtain: null }),
}))

export function curtainThemeOf(payload: CurtainPayload): CurtainTheme {
  if (payload.theme) return payload.theme
  return payload.title.includes('雨停') ? 'sun' : 'rain'
}
