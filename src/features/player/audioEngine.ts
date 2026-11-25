import type { Howl as HowlType } from 'howler'
import { audioSources, tracks } from './tracks'

type HowlerModule = typeof import('howler')

interface EngineHandlers {
  onPlay: () => void
  onPause: () => void
  onEnd: () => void
  onLoad: (duration: number) => void
  onProgress: (currentTime: number, duration: number) => void
  onError: () => void
}

/**
 * howler 单例封装。
 * howler 只在首次播放时动态 import，绝不进入首屏 chunk（受 200KB 预算约束）。
 * 模块作用域持有实例：React 重挂载 / 路由切换都不会中断或重建播放。
 */
class AudioEngine {
  private howl: HowlType | null = null
  private howlId: string | null = null
  private pending: Promise<HowlerModule | null> | null = null
  private handlers: EngineHandlers | null = null
  private progressTimer: ReturnType<typeof setInterval> | null = null

  setHandlers(handlers: EngineHandlers | null) {
    this.handlers = handlers
  }

  private async loadModule(): Promise<HowlerModule | null> {
    if (!this.pending) {
      this.pending = import('howler').catch(() => null)
    }
    return this.pending
  }

  /** 预取 howler 模块（用户手势时调用，避免首次播放卡顿）。 */
  warmup() {
    void this.loadModule()
  }

  private ensureHowl(Howl: HowlerModule['Howl'], trackId: string): HowlType {
    if (this.howl && this.howlId === trackId) return this.howl
    this.howl?.unload()
    this.howl = null
    const track = tracks.find((item) => item.id === trackId)
    if (!track) throw new Error(`unknown track ${trackId}`)
    const howl = new Howl({
      src: audioSources(track),
      html5: false,
      preload: true,
      volume: 1,
      onplay: () => {
        this.handlers?.onPlay()
        this.startProgress()
      },
      onpause: () => {
        this.handlers?.onPause()
        this.stopProgress()
      },
      onend: () => {
        this.handlers?.onEnd()
        this.stopProgress()
      },
      onload: () => this.handlers?.onLoad(this.howl?.duration() ?? 0),
      onloaderror: () => this.handlers?.onError(),
      onplayerror: () => this.handlers?.onError(),
    })
    this.howl = howl
    this.howlId = trackId
    return howl
  }

  private startProgress() {
    this.stopProgress()
    this.progressTimer = setInterval(() => {
      if (!this.howl) return
      this.handlers?.onProgress((this.howl.seek() as number) ?? 0, this.howl.duration() ?? 0)
    }, 250)
  }

  private stopProgress() {
    if (this.progressTimer !== null) {
      clearInterval(this.progressTimer)
      this.progressTimer = null
    }
  }

  /** 播放指定曲目；ensureHowl 会在曲目变化时卸载旧实例并重建。 */
  async play(trackId: string, volume: number, muted: boolean) {
    const mod = await this.loadModule()
    if (!mod) {
      this.handlers?.onError()
      return
    }
    try {
      const howl = this.ensureHowl(mod.Howl, trackId)
      howl.volume(muted ? 0 : volume)
      if (!howl.playing()) howl.play()
    } catch {
      this.handlers?.onError()
    }
  }

  /**
   * 自动播放：尝试播放并返回是否真的出声。
   * 浏览器自动播放策略会挂起 AudioContext；返回 false 时调用方应等待用户手势后再调用 play()。
   */
  async startFromAutoplay(trackId: string, volume: number, muted: boolean): Promise<boolean> {
    const mod = await this.loadModule()
    if (!mod) return false
    try {
      const howl = this.ensureHowl(mod.Howl, trackId)
      howl.volume(muted ? 0 : volume)
      howl.play()
      // 给浏览器一拍让 AudioContext 落定；被拦截时它会保持 suspended
      await new Promise<void>((resolve) => setTimeout(resolve, 60))
      return mod.Howler.ctx?.state === 'running'
    } catch {
      return false
    }
  }

  /** 用户手势后强制恢复 AudioContext 并播放（用于自动播放被拦截后的补偿）。 */
  async resumeAndPlay(trackId: string, volume: number, muted: boolean) {
    const mod = await this.loadModule()
    if (!mod) {
      this.handlers?.onError()
      return
    }
    try {
      if (mod.Howler.ctx && mod.Howler.ctx.state === 'suspended') {
        await mod.Howler.ctx.resume()
      }
      const howl = this.ensureHowl(mod.Howl, trackId)
      howl.volume(muted ? 0 : volume)
      if (!howl.playing()) howl.play()
    } catch {
      this.handlers?.onError()
    }
  }

  pause() {
    this.howl?.pause()
    this.stopProgress()
  }

  seek(seconds: number) {
    const howl = this.howl
    if (!howl) return
    const duration = howl.duration() ?? 0
    const target = duration > 0 ? Math.min(Math.max(seconds, 0), duration) : Math.max(seconds, 0)
    howl.seek(target)
    this.handlers?.onProgress(target, duration)
  }

  setVolume(volume: number, muted: boolean) {
    this.howl?.volume(muted ? 0 : Math.min(Math.max(volume, 0), 1))
  }

  /** 卸载实例（清空数据 / 全局销毁时用）。 */
  unload() {
    this.howl?.unload()
    this.howl = null
    this.howlId = null
    this.stopProgress()
  }
}

export const audioEngine = new AudioEngine()
