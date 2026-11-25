import { gsap } from 'gsap'
import { ease } from '../tokens'

export type CurtainTheme = 'rain' | 'sun'

/**
 * 章节过场幕布 timeline（约 2.2s，预算上限见 tokens.motion.chapter）。
 * kinetic-type 章节卡：色场 flood → 章节号 → 标题字符 → 副题 → 反向 flood 退场。
 * rain：墨场纸字（雨）；sun：黄场墨字（日光）。共用结构，只换色与节奏。
 */
export function createCurtainTimeline(root: HTMLElement, onDone: () => void, theme: CurtainTheme = 'rain') {
  const q = gsap.utils.selector(root)
  const fast = theme === 'sun' ? 0.92 : 1

  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      gsap.set(root, { opacity: 0 })
      onDone()
    },
  })

  tl.set(q('.g-curtain-field'), { scaleY: 0, backgroundColor: theme === 'sun' ? '#f2b705' : '#141414' })
    .set(q('.g-curtain-code'), { opacity: 0, y: -10 })
    .set(q('.g-curtain-title .char'), { yPercent: 140 })
    .set(q('.g-curtain-subtitle'), { opacity: 0, y: 8 })
    .set(q('.g-curtain-rule'), { scaleX: 0 })
    .set(q('.g-curtain-torn'), { y: '100vh' })

  // 0–0.45 色场从底部涨满；雨章的撕纸边随前缘一起升起
  tl.addLabel('scene:flood', 0)
    .to(q('.g-curtain-field'), { scaleY: 1, transformOrigin: 'bottom center', duration: 0.45 * fast, ease: 'power3.in' }, 0)
  if (theme === 'rain') {
    tl.to(q('.g-curtain-torn'), { y: 0, duration: 0.45 * fast, ease: 'power3.in' }, 0)
  }

  // 0.52–0.84 章节号
  tl.addLabel('scene:code', 0.52)
    .to(q('.g-curtain-code'), { opacity: 1, y: 0, duration: 0.32 * fast, ease: ease.paper }, 0.52)

  // 0.72–1.42 标题字符揭示
  tl.addLabel('scene:title', 0.72)
    .to(q('.g-curtain-title .char'), { yPercent: 0, duration: 0.4, ease: 'back.out(1.5)', stagger: 0.045 }, 0.72)
    .to(q('.g-curtain-rule'), { scaleX: 1, duration: 0.28, ease: ease.paper }, 1.12)
    .to(q('.g-curtain-subtitle'), { opacity: 1, y: 0, duration: 0.28, ease: ease.paper }, 1.22)

  // 1.74–2.2 收束：色场从顶部退场，露出目标页
  tl.addLabel('scene:close', 1.74)
    .to(q('.g-curtain-copy'), { opacity: 0, duration: 0.24, ease: ease.exit }, 1.7)
    .to(q('.g-curtain-field'), { scaleY: 0, transformOrigin: 'top center', duration: 0.44 * fast, ease: 'power3.in' }, 1.76 * fast)
  if (theme === 'rain') {
    // 撕纸边跟着色场顶边一起上移出场
    tl.to(q('.g-curtain-torn'), { y: '-100vh', duration: 0.44 * fast, ease: 'power3.in' }, 1.76 * fast)
  }

  return tl
}
