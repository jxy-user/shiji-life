import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../useReducedMotion'

/** 标点之后的额外停顿（毫秒），让对白有呼吸而非匀速滚动。 */
const PAUSE_AFTER: Record<string, number> = {
  '，': 120,
  '、': 90,
  '；': 180,
  '：': 160,
  '。': 280,
  '！': 280,
  '？': 280,
  '…': 500,
}

function pauseAfter(char: string): number {
  return PAUSE_AFTER[char] ?? 0
}

interface TypewriterProps {
  /** 要逐字揭示的完整文本；完整文本始终在 DOM，视觉用 clip-path 揭示 */
  text: string
  /** 每字间隔（毫秒），默认 32 */
  speed?: number
  /** 渲染标签，默认 p */
  as?: 'p' | 'blockquote' | 'span' | 'div' | 'h2' | 'h3'
  className?: string
  /** 为 true 时跳过动画直接显示全文 */
  skip?: boolean
  onDone?: () => void
}

/**
 * 打字机：整段文本渲染在 DOM（读屏与复制拿到的都是全文），视觉用 clip-path 从左到右揭示。
 * 中文按字符推进；每个字符耗时 = speed，另加前一个字符若是标点则停一拍。
 * rAF 步进，不用逐字 setState。reduced-motion 或 skip 时直接显示全文。
 */
export default function Typewriter({ text, speed = 32, as = 'p', className, skip = false, onDone }: TypewriterProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduced || skip) {
      node.style.clipPath = ''
      onDone?.()
      return
    }

    const chars = Array.from(text)
    const total = chars.length
    let shown = 0
    let acc = 0
    let prev = performance.now()
    let raf = 0
    // 第一个字只需基准 speed；之后每个字的入场成本包含前一字（若为标点）的停顿
    let cost = speed
    node.style.clipPath = 'inset(0 100% 0 0)'

    const paint = () => {
      node.style.clipPath = shown >= total ? '' : `inset(0 ${Math.round((1 - shown / total) * 100)}% 0 0)`
    }

    const step = (now: number) => {
      acc += now - prev
      prev = now
      while (shown < total && acc >= cost) {
        acc -= cost
        shown += 1
        cost = speed + pauseAfter(chars[shown - 1] ?? '')
      }
      paint()
      if (shown < total) {
        raf = requestAnimationFrame(step)
      } else {
        onDone?.()
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // onDone 引用变化不应重启揭示
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, reduced, skip])

  const Tag = as as 'p'
  return (
    <Tag
      ref={ref as React.Ref<HTMLParagraphElement>}
      className={className}
    >
      {text}
    </Tag>
  )
}
