import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { useReducedMotion } from '../useReducedMotion'
import { ease } from '../tokens'
import { sfx } from '../sound/SfxEngine'

/**
 * 事件揭晓（L3 节点转场，约 1.2s）：
 * 结果纸自上而下被「揭开」，随后「已完成」章砸落，正文再逐段淡入。
 * play=false（刷新后进入完成态）时直接是终态，不重播。
 * reduced-motion 直接设终态。
 */
export default function EventResultTimeline({ children, play = true }: { children: React.ReactNode; play?: boolean }) {
  const scopeRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      if (!play) return
      const root = scopeRef.current
      if (!root) return
      const sheet = root.querySelector<HTMLElement>('[data-reveal-sheet]')
      const stamp = root.querySelector<HTMLElement>('[data-reveal-stamp]')
      const rows = root.querySelectorAll<HTMLElement>('[data-reveal-row]')
      if (!sheet) return

      if (reduced) {
        gsap.set([sheet, ...Array.from(rows)], { clearProps: 'all' })
        gsap.set(stamp, { clearProps: 'all' })
        return
      }

      gsap.set(sheet, { clipPath: 'inset(0 0 100% 0)' })
      gsap.set(stamp, { scale: 1.6, opacity: 0, rotate: -14 })
      gsap.set(rows, { opacity: 0, y: 10 })

      sfx.play('paper-drop')
      gsap.timeline({ defaults: { ease: ease.paper } })
        .fromTo(sheet, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.42, ease: 'power2.out' }, 0)
        .to(stamp, { scale: 1, opacity: 1, rotate: -6, duration: 0.3, ease: ease.stamp }, 0.34)
        .add(() => sfx.play('stamp'), 0.48)
        .to(rows, { opacity: 1, y: 0, duration: 0.34, stagger: 0.07 }, 0.56)
        // 结束后彻底清掉裁剪与位移，避免 inset 0% 的渲染歧义与基线残留
        .set([sheet, ...Array.from(rows), stamp], { clearProps: 'clipPath,transform,opacity' })
    },
    { scope: scopeRef, revertOnUpdate: true },
  )

  return <div ref={scopeRef}>{children}</div>
}
