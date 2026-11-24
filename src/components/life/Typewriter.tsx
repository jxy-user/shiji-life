import { useEffect, useState } from 'react'

type TypewriterProps = {
  text: string
  /** 每个字的间隔（毫秒） */
  speed?: number
  /** 减少动态效果时直接显示全文 */
  instant?: boolean
  className?: string
}

/**
 * 逐字显示的文本。
 *
 * 尾部用不可见文本占位，避免打字过程中布局跳动；
 * 调用处用 key 保证换文本时从头开始。
 */
export function Typewriter({ text, speed = 32, instant = false, className }: TypewriterProps) {
  const [count, setCount] = useState(() => (instant ? text.length : 0))

  useEffect(() => {
    if (instant || count >= text.length) return
    const timer = window.setTimeout(
      () => setCount((value) => Math.min(text.length, value + 1)),
      speed,
    )
    return () => window.clearTimeout(timer)
  }, [count, text.length, speed, instant])

  return (
    <span className={className}>
      {text.slice(0, count)}
      <span className="invisible">{text.slice(count)}</span>
    </span>
  )
}
