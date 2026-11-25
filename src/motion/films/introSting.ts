import { gsap } from 'gsap'
import { ease } from '../tokens'

const selectors = {
  pin: '.g-film-pin',
  map: '.g-film-map',
  mapArt: '.g-film-map svg',
  cards: '.g-film-card',
  cardArt: '.g-film-card .art',
  title: '.g-film-title',
  titleChars: '.g-film-title .char',
  underline: '.g-film-title .underline',
  stamp: '.g-film-stamp',
  claim: '.g-film-claim',
  out: '.g-film-out',
  stage: '.g-film-frame, .g-film-skip',
}

/** 影像层的虚焦半径（px）：文字一律不参与模糊 */
const blur = {
  /** 拼贴落纸前的虚焦量 */
  card: 8,
  /** 地图撕纸揭示的虚焦量 */
  map: 6,
  /** 退场散景 */
  exit: 7,
} as const

/**
 * 开屏 sting timeline（约 10.6s）。
 * 从 huashu-motion motion-films/intro-sting 移植；此处是运行时唯一真相。
 * 节奏（120 BPM ≈ 0.5s/拍）：
 *   0.0–1.5  hook：图钉砸落，撕纸揭示半张地图
 *   1.5–4.4  三栏拼贴 stagger 落纸 + Ken Burns 轻推
 *   4.4–6.6  hero：「拾己 LIFE」字符 stagger + 黄色下划线擦除
 *   6.6–8.2  周刊刊号盖章
 *   8.2–10.6 收束：slogan + 散景淡出交棒
 * 模糊只作用于影像层（地图 / 卡片图片），文字始终锐利。
 */
export function createIntroTimeline(root: HTMLElement, onDone: () => void, onReveal?: () => void) {
  const q = gsap.utils.selector(root)
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      gsap.set(root, { opacity: 0 })
      onDone()
    },
  })

  tl.set(q(selectors.pin), { y: -240, rotate: -24, opacity: 1 })
    .set(q(selectors.mapArt), { filter: `blur(${blur.map}px)` })
    .set(q(selectors.map), { clipPath: 'inset(0 100% 0 0)' })
    .set(q(selectors.title), { opacity: 0 })
    .set(q(selectors.titleChars), { yPercent: 140 })
    .set(q(selectors.stamp), { scale: 1.6, opacity: 0, rotate: -14 })
    .set(q(selectors.claim), { opacity: 0, y: 14 })
    .set(q(selectors.out), { opacity: 0 })
    .set(q(selectors.cards), { y: 48, rotate: -2.5, opacity: 0 })
    .set(q(selectors.cardArt), { scale: 1, filter: `saturate(0.7) contrast(1.12) blur(${blur.card}px)` })

  // Scene 1: hook —— 图钉砸落 + 撕纸揭示地图
  tl.addLabel('scene:hook', 0)
    .to(q(selectors.pin), { y: 0, rotate: 0, duration: 0.42, ease: 'power4.in' }, 0.12)
    .to(q(selectors.pin), { y: -7, duration: 0.1, ease: ease.paper }, 0.54)
    .to(q(selectors.pin), { y: 0, duration: 0.16, ease: 'bounce.out' }, 0.64)
    .to(q(selectors.map), { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: ease.paper }, 0.62)
    // 撕开的同时拉焦：地图从虚到实
    .to(q(selectors.mapArt), { filter: 'blur(0px)', duration: 0.9, ease: ease.paper }, 0.62)

  // Scene 2: 三栏拼贴落纸 + Ken Burns（虚焦只作用在图片上，卡框和文字保持锐利）
  tl.addLabel('scene:collage', 1.5)
    .to(q(selectors.cards), {
      y: 0,
      rotate: (index: number) => [-1.2, 0.8, 2][index] ?? 0,
      opacity: 1,
      duration: 0.5,
      ease: ease.paper,
      stagger: 0.14,
    }, 1.5)
    .to(q(selectors.cardArt), {
      filter: 'saturate(0.7) contrast(1.12) blur(0px)',
      duration: 0.5,
      ease: ease.paper,
      stagger: 0.14,
    }, 1.5)
    .to(q(selectors.cardArt), { scale: 1.07, duration: 4.4, ease: ease.none, stagger: 0.1 }, 1.6)

  // Scene 3: hero 标题
  // 标题在场期间地图图面退成极淡幽灵（只留纸框与图钉作构图锚点），
  // 蓝街区与虚线不再出现在字面后方；拼贴压暗作为低对比衬景。文字永不模糊。
  tl.addLabel('scene:hero', 4.4)
    .set(q(selectors.title), { opacity: 1 }, 4.4)
    .to(q(selectors.mapArt), { opacity: 0.08, duration: 0.55, ease: ease.paper }, 4.4)
    .to(q(selectors.cards), { filter: 'brightness(0.42)', duration: 0.6, ease: ease.paper }, 4.4)
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
  // 标题与章保持在场，slogan / 角标依次落定。
  // 退场严格串行：先把影片内容收干净（stage 归零），再淡墨底，
  // 任何时刻都不会出现影片与 StartPage 双层同时可见的重叠
  tl.addLabel('scene:close', 8.2)
    .to(q(selectors.claim), { opacity: 1, y: 0, duration: 0.45, ease: ease.paper }, 8.4)
    .to(q(selectors.out), { opacity: 1, duration: 0.4, ease: ease.paper }, 9.5)
    // 影像层收尾再压低一档；文字不参与
    .to(q(selectors.cards), { filter: 'brightness(0.3)', duration: 0.5, ease: ease.paper }, 9.9)
    .to(q(selectors.cardArt), {
      filter: `saturate(0.7) contrast(1.12) blur(${blur.exit}px)`,
      duration: 0.5,
      ease: ease.paper,
    }, 9.9)
    // 内容先收干净：10.28s 时 stage 已到 0，画面上只剩纯墨
    .to(q(selectors.stage), { opacity: 0, duration: 0.36, ease: ease.paper }, 9.92)
    // 影片内容归零后才放出底层页面，墨底同步淡出：
    // 观众看到的是「纯墨 → 完整 StartPage」的一次性交棒，任何一帧都没有双层内容
    .call(() => onReveal?.(), undefined, 10.3)
    .to(root, { opacity: 0, duration: 0.45, ease: ease.paper }, 10.3)

  return tl
}
