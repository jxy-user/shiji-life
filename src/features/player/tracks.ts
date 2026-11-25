import type { ArtKey } from '../../domain/types'

export interface Track {
  id: string
  title: string
  artist: string
  /** 复用现有 webp 插画作为唱片封面 */
  artKey: ArtKey
  /** 秒，用于进度条兜底与格式化为总时长 */
  duration: number
}

/**
 * 曲目清单。音频文件放在 public/audio/[id].ogg|mp3（见 public/audio/CREDITS.md）。
 * 空数组时播放器渲染「暂无音轨」空态，其余功能不受影响。
 */
export const tracks: Track[] = [
  { id: 'millennium-ambient', title: '千年之后（氛围版）', artist: '氛围轻音乐', artKey: 'sketch-ruins', duration: 134 },
  { id: 'healing-lake', title: 'The Healing Lake', artist: 'Uplifting Pills', artKey: 'sketch-park', duration: 180 },
  { id: 'painting-twilight', title: 'Painting Twilight', artist: 'Uplifting Pills', artKey: 'sketch-plaza', duration: 180 },
  { id: 'slow-drifter', title: 'Slow Drifter', artist: 'Uplifting Pills', artKey: 'sketch-bridge', duration: 180 },
]

/** ogg 在前、mp3 在后：规避部分浏览器对 mp3 的 canPlayType 误报。 */
export function audioSources(track: Track): string[] {
  const base = `${import.meta.env.BASE_URL}audio/${track.id}`
  return [`${base}.ogg`, `${base}.mp3`]
}

export function clampTrackIndex(index: number): number {
  if (tracks.length === 0) return 0
  if (!Number.isFinite(index)) return 0
  return Math.min(Math.max(Math.trunc(index), 0), tracks.length - 1)
}

export function getTrack(index: number): Track | null {
  return tracks[clampTrackIndex(index)] ?? null
}
