import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from './useReducedMotion'
import { ease, motion, stagger as staggerTokens } from './tokens'

gsap.registerPlugin(useGSAP)

interface PageMotionOptions {
  /** stagger 组间距（秒），默认 0.06 */
  stagger?: number
  /** 是否从下方带入（默认 true） */
  rise?: boolean
}

/**
 * 页面入场编排：容器内所有 [data-motion] 元素依次落纸。
 * reduced-motion 下直接设终态，不建 timeline。
 */
export function usePageMotion<T extends HTMLElement = HTMLElement>(options: PageMotionOptions = {}) {
  const scopeRef = useRef<T | null>(null)
  const reduced = useReducedMotion()
  const { stagger: staggerSec = staggerTokens.paper, rise = true } = options

  useGSAP(
    () => {
      const targets = scopeRef.current?.querySelectorAll<HTMLElement>('[data-motion]')
      if (!targets || targets.length === 0) return

      if (reduced) {
        gsap.set(targets, { clearProps: 'all' })
        return
      }

      gsap.fromTo(
        targets,
        { opacity: 0, y: rise ? 22 : 0 },
        {
          opacity: 1,
          y: 0,
          duration: motion.cover,
          ease: ease.paper,
          stagger: staggerSec,
          clearProps: 'transform,opacity',
          overwrite: 'auto',
        },
      )
    },
    { scope: scopeRef, revertOnUpdate: true },
  )

  return scopeRef
}

export { gsap, useGSAP }
