import { gsap } from 'gsap'
import { ease } from '../tokens'

const selectors = {
  pin: '.g-film-pin',
  map: '.g-film-map',
  frame: '.g-film-frame',
  cards: '.g-film-card',
  cardArt: '.g-film-card .art',
  title: '.g-film-title',
  titleChars: '.g-film-title .char',
  underline: '.g-film-title .underline',
  stamp: '.g-film-stamp',
  claim: '.g-film-claim',
  out: '.g-film-out',
  root: '.g-film-root',
}

/**
 * 开屏 sting timeline（约 10.6s）。
 * 从 huashu-motion motion-films/intro-sting 移植；此处是运行时唯一真相。
 * 节奏（120 BPM ≈ 0.5s/拍）：
 *   0.0–1.5  hook：图钉砸落，撕纸揭示半张地图
 *   1.5–4.4  三栏拼贴 stagger 落纸 + Ken Burns 轻推
 *   4.4–6.6  hero：「拾己 LIFE」字符 stagger + 黄色下划线擦除
 *   6.6–8.2  周刊刊号盖章
 *   8.2–10.6 收束：slogan + 淡出交棒
 */
export function createIntroTimeline(root: HTMLElement, onDone: () => void) {
  const q = gsap.utils.selector(root)
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      gsap.set(root, { opacity: 0 })
      onDone()
    },
  })

  tl.set(q(selectors.pin), { y: -240, rotate: -24, opacity: 1 })
    .set(q(selectors.map), { clipPath: 'inset(0 100% 0 0)' })
    .set(q(selectors.title), { opacity: 0 })
    .set(q(selectors.titleChars), { yPercent: 140 })
    .set(q(selectors.stamp), { scale: 1.6, opacity: 0, rotate: -14 })
    .set(q(selectors.claim), { opacity: 0, y: 14 })
    .set(q(selectors.out), { opacity: 0 })
    .set(q(selectors.cards), { y: 48, rotate: -2.5, opacity: 0 })
    .set(q(selectors.cardArt), { scale: 1 })

  // Scene 1: hook —— 图钉砸落 + 撕纸揭示地图
  tl.addLabel('scene:hook', 0)
    .to(q(selectors.pin), { y: 0, rotate: 0, duration: 0.42, ease: 'power4.in' }, 0.12)
    .to(q(selectors.pin), { y: -7, duration: 0.1, ease: ease.paper }, 0.54)
    .to(q(selectors.pin), { y: 0, duration: 0.16, ease: 'bounce.out' }, 0.64)
    .to(q(selectors.map), { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: ease.paper }, 0.62)

  // Scene 2: 三栏拼贴落纸 + Ken Burns
  tl.addLabel('scene:collage', 1.5)
    .to(q(selectors.cards), {
      y: 0,
      rotate: (index: number) => [-1.2, 0.8, 2][index] ?? 0,
      opacity: 1,
      duration: 0.5,
      ease: ease.paper,
      stagger: 0.14,
    }, 1.5)
    .to(q(selectors.cardArt), { scale: 1.07, duration: 4.4, ease: ease.none, stagger: 0.1 }, 1.6)

  // Scene 3: hero 标题
  tl.addLabel('scene:hero', 4.4)
    .set(q(selectors.title), { opacity: 1 }, 4.4)
    .to(q(selectors.titleChars), {
      yPercent: 0,
      duration: 0.5,
      ease: 'back.out(1.6)',
      stagger: 0.05,
    }, 4.5)
    .fromTo(q(selectors.underline),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.36, ease: ease.paper }, 5.3)

  // Scene 4: 刊号盖章
  tl.addLabel('scene:stamp', 6.6)
    .to(q(selectors.stamp), {
      opacity: 1,
      scale: 1,
      rotate: -6,
      duration: 0.3,
      ease: 'power4.in',
    }, 6.7)

  // Scene 5: 收束
  tl.addLabel('scene:close', 8.2)
    .to(q(selectors.claim), { opacity: 1, y: 0, duration: 0.45, ease: ease.paper }, 8.4)
    .to(q(selectors.out), { opacity: 1, duration: 0.4, ease: ease.paper }, 9.6)
    .to(q(selectors.root), { opacity: 0, duration: 0.6, ease: ease.paper }, 10.0)

  return tl
}
