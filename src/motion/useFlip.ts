import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from './useReducedMotion'
import { motion } from './tokens'

/**
 * 列表 FLIP 重排：容器内同一个 key 的元素换位时补上位移过渡。
 * deps 变化（筛选、排序、状态迁移）后测量前后位置，用 transform 回放。
 * reduced-motion 下不播，直接落在新位置。
 */
export function useFlip<T extends HTMLElement = HTMLUListElement>(deps: unknown[]) {
  const scopeRef = useRef<T | null>(null)
  const prevRects = useRef<Map<string, DOMRect>>(new Map())
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope) return
    const items = [...scope.querySelectorAll<HTMLElement>('[data-flip-key]')]
    const next = new Map<string, DOMRect>()
    items.forEach((item) => next.set(item.dataset.flipKey ?? '', item.getBoundingClientRect()))

    if (!reduced && prevRects.current.size > 0) {
      items.forEach((item) => {
        const key = item.dataset.flipKey ?? ''
        const before = prevRects.current.get(key)
        const after = next.get(key)
        if (!before || !after) return
        const dx = before.left - after.left
        const dy = before.top - after.top
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
        gsap.fromTo(item, { x: dx, y: dy }, { x: 0, y: 0, duration: motion.normal, ease: 'power2.out', clearProps: 'transform' })      })
    }

    prevRects.current = next
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scopeRef
}
