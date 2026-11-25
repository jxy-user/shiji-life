/** 与 CSS 动效令牌对齐的 JS 常量，GSAP timeline 统一从这里取值。 */
export const motion = {
  fast: 0.12,
  normal: 0.22,
  cover: 0.36,
  slow: 0.8,
  /** 开屏 sting 总时长（秒） */
  film: 12,
  /** UI 节拍：一次交互不超过一拍（秒） */
  beat: 0.52,
  /** 章节幕布总时长（秒），超过须可跳过 */
  chapter: 2.4,
} as const

export const ease = {
  paper: 'power2.out',
  land: 'back.out(1.4)',
  steps: 'steps(12)',
  none: 'none',
  /** 退场比入场快 */
  exit: 'power2.in',
  /** 盖章：先快后砸 */
  stamp: 'power4.in',
} as const

export const stagger = {
  tight: 0.06,
  paper: 0.06,
  choice: 0.08,
  /** 字母/字符揭示 */
  char: 0.05,
} as const
