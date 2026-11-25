import { useSoundStore } from './soundStore'

type SfxName =
  | 'paper-drop'
  | 'stamp'
  | 'option-hover'
  | 'complete'
  | 'curtain'
  | 'motif'
  | 'tick'
  | 'type'
  | 'whoosh'
  | 'impact'
  | 'chime'
  | 'riser'

/** 每场戏只允许响一次的强音，避免同屏反复砸。 */
const ONCE_PER_SCENE: ReadonlySet<SfxName> = new Set<SfxName>(['impact', 'chime'])

/** 逐字音效的节流窗口（毫秒），防止一次揭示爆出一串点击声。 */
const TYPE_THROTTLE_MS = 30

/**
 * Web Audio 合成音效，0 音频文件。
 * sfxEnabled 关闭时直接 return；AudioContext 懒创建（需用户手势）。
 */
class SfxEngine {
  private ctx: AudioContext | null = null
  private lastTypeAt = 0
  private playedThisScene = new Set<SfxName>()

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx
    const Ctor = (globalThis as { AudioContext?: typeof AudioContext }).AudioContext
    if (!Ctor) return null
    try {
      this.ctx = new Ctor()
    } catch {
      this.ctx = null
    }
    return this.ctx
  }

  /** 用户手势后调用，解锁 AudioContext */
  resume() {
    const ctx = this.ensure()
    if (ctx && ctx.state === 'suspended') void ctx.resume()
  }

  /** 路由/场景切换时重置「每场一次」的强音额度。 */
  resetScene() {
    this.playedThisScene.clear()
  }

  play(name: SfxName) {
    if (!useSoundStore.getState().prefs.sfxEnabled && name !== 'motif') return
    if (name === 'motif' && !useSoundStore.getState().prefs.musicEnabled) return
    if (ONCE_PER_SCENE.has(name)) {
      if (this.playedThisScene.has(name)) return
      this.playedThisScene.add(name)
    }
    if (name === 'type') {
      const ctxNow = this.ctx?.currentTime ?? 0
      if ((ctxNow - this.lastTypeAt) * 1000 < TYPE_THROTTLE_MS) return
      this.lastTypeAt = ctxNow
    }
    const ctx = this.ensure()
    if (!ctx || ctx.state !== 'running') return
    const now = ctx.currentTime

    const tone = (freq: number, start: number, dur: number, type: OscillatorType, gain: number) => {
      const osc = ctx.createOscillator()
      const amp = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, now + start)
      amp.gain.setValueAtTime(0.0001, now + start)
      amp.gain.exponentialRampToValueAtTime(gain, now + start + 0.01)
      amp.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
      osc.connect(amp).connect(ctx.destination)
      osc.start(now + start)
      osc.stop(now + start + dur + 0.02)
    }

    const noise = (dur: number, cutoff: number, gain: number, start = 0) => {
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = cutoff
      const amp = ctx.createGain()
      amp.gain.value = gain
      src.connect(filter).connect(amp).connect(ctx.destination)
      src.start(now + start)
    }

    switch (name) {
      case 'paper-drop':
        noise(0.09, 800, 0.12)
        break
      case 'stamp':
        tone(80, 0, 0.09, 'sine', 0.28)
        noise(0.05, 2200, 0.08)
        break
      case 'option-hover':
        tone(3200, 0, 0.02, 'square', 0.04)
        break
      case 'complete':
        tone(587.33, 0, 0.12, 'triangle', 0.16)
        tone(880, 0.1, 0.16, 'triangle', 0.14)
        break
      case 'curtain':
        tone(120, 0, 0.4, 'sine', 0.2)
        tone(60, 0.05, 0.35, 'sine', 0.16)
        break
      case 'motif':
        // 阳光黄四音动机 D-F-A-D，配乐文件缺失时的降级 sting
        tone(293.66, 0, 0.18, 'triangle', 0.12)
        tone(349.23, 0.16, 0.18, 'triangle', 0.12)
        tone(440, 0.32, 0.18, 'triangle', 0.12)
        tone(293.66, 0.48, 0.3, 'triangle', 0.12)
        break
      case 'tick':
        // 轻拨一下，给开关/划线/重排这类小状态一个落点
        tone(1180, 0, 0.035, 'triangle', 0.05)
        break
      case 'type':
        // 逐字推进的纸面轻点；靠节流压成细密底噪
        tone(2400, 0, 0.012, 'square', 0.018)
        break
      case 'whoosh':
        noise(0.16, 1400, 0.09)
        break
      case 'impact':
        // 强落定：低频 + 短噪声，每场最多一次
        tone(58, 0, 0.22, 'sine', 0.32)
        tone(116, 0.01, 0.12, 'sine', 0.2)
        noise(0.12, 900, 0.16)
        break
      case 'chime':
        // 上行三音，用于章节收束或重要确认，每场最多一次
        tone(659.25, 0, 0.16, 'triangle', 0.12)
        tone(783.99, 0.12, 0.16, 'triangle', 0.11)
        tone(987.77, 0.24, 0.24, 'triangle', 0.1)
        break
      case 'riser':
        // 进场前的上挑噪声，配 reveal 起手
        noise(0.3, 2600, 0.05)
        tone(392, 0, 0.28, 'sine', 0.05)
        break
    }
  }
}

export const sfx = new SfxEngine()
export type { SfxName }
