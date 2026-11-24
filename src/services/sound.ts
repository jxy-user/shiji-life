/**
 * 轻量音效：用 Web Audio API 现场合成，不加载任何音频文件。
 *
 * 浏览器要求用户交互后才能出声，所以在「开始人生」等首次点击时调用
 * unlockAudio()；未解锁时所有音效静默返回，不会抛错。
 */

let context: AudioContext | null = null
let muted = false

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return null
      context = new Ctor()
    }
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

/** 首次点击时调用，解锁音频上下文 */
export function unlockAudio(): void {
  getContext()
}

export function setMuted(value: boolean): void {
  muted = value
}

type ToneOptions = {
  freq: number
  duration: number
  type?: OscillatorType
  gain?: number
  /** 频率滑向的目标值 */
  slideTo?: number
  delay?: number
}

function playTone({
  freq,
  duration,
  type = 'sine',
  gain = 0.05,
  slideTo,
  delay = 0,
}: ToneOptions): void {
  const ctx = getContext()
  if (!ctx || muted) return

  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()

  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
  }

  // 快速起音 + 指数衰减，避免爆音
  amp.gain.setValueAtTime(0.0001, start)
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(amp).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.03)
}

export const sfx = {
  /** 轻微的操作反馈 */
  tick(): void {
    playTone({ freq: 760, duration: 0.06, type: 'triangle', gain: 0.032 })
  },
  /** 选中的一下：短促上扬 */
  select(): void {
    playTone({ freq: 520, duration: 0.15, type: 'triangle', gain: 0.055, slideTo: 880 })
    playTone({ freq: 1040, duration: 0.18, type: 'sine', gain: 0.025, delay: 0.04 })
  },
  /** 标题卡落点：低频闷响 */
  thud(): void {
    playTone({ freq: 110, duration: 0.5, type: 'sine', gain: 0.08, slideTo: 55 })
    playTone({ freq: 220, duration: 0.18, type: 'triangle', gain: 0.018 })
  },
  /** 结果浮现：柔和和弦 */
  chime(): void {
    playTone({ freq: 660, duration: 0.6, type: 'sine', gain: 0.04 })
    playTone({ freq: 990, duration: 0.7, type: 'sine', gain: 0.026, delay: 0.05 })
    playTone({ freq: 1320, duration: 0.8, type: 'sine', gain: 0.016, delay: 0.1 })
  },
  /** 推进/翻页：轻声掠过 */
  whoosh(): void {
    playTone({ freq: 180, duration: 0.28, type: 'sawtooth', gain: 0.02, slideTo: 90 })
  },
  /** 片尾关键词：明亮的一声 */
  ding(): void {
    playTone({ freq: 880, duration: 0.5, type: 'sine', gain: 0.045 })
    playTone({ freq: 1760, duration: 0.4, type: 'sine', gain: 0.016, delay: 0.02 })
  },
}
