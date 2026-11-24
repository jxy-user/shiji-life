import type { ReactNode } from 'react'

import type { LifeTag } from '@/data/lifeStory'

/**
 * 人生节点的极简线条图标
 *
 * 每个节点配一个「小场景」，用描边绘制动画替代纯文字提示。
 * 全部是内联 SVG，不引入图片资源。
 */
const GLYPHS: Record<string, ReactNode> = {
  age_18: (
    <>
      <rect x="18" y="12" width="24" height="34" rx="2" data-draw />
      <path d="M23 20h14M23 26h14M23 32h8" data-draw />
      <path d="M44 34l6 6-10 3 1-7 3-4z" data-draw />
    </>
  ),
  age_22: (
    <>
      <path d="M22 54V24a10 10 0 0 1 20 0v30" data-draw />
      <path d="M32 54V24" data-draw />
      <circle cx="28" cy="39" r="1.3" fill="currentColor" />
    </>
  ),
  age_25: (
    <>
      <path d="M12 50h12V38h12V26h12V14" data-draw />
      <path d="M12 50h40" data-draw />
    </>
  ),
  age_28: (
    <>
      <path d="M16 32v18M16 40h14V30H16z" data-draw />
      <path d="M34 32v18M34 40h14V30H34z" data-draw />
      <path d="M23 30v-4M41 30v-4" data-draw />
    </>
  ),
  age_32: (
    <>
      <path d="M14 30L32 16l18 14" data-draw />
      <path d="M18 30v22h28V30" data-draw />
      <path d="M28 52V40h8v12" data-draw />
    </>
  ),
  age_36: (
    <>
      <path d="M22 54V24a10 10 0 0 1 20 0v30" data-draw />
      <path d="M46 16l1.8 4.2 4.2 1.8-4.2 1.8L46 28l-1.8-4.2L40 22l4.2-1.8z" data-draw />
    </>
  ),
  age_40: (
    <>
      <rect x="21" y="14" width="16" height="36" rx="3" data-draw />
      <path d="M28 44h4" data-draw />
      <path d="M42 22c4 2 4 8 0 10" data-draw />
      <path d="M47 18c6 4 6 14 0 18" data-draw />
    </>
  ),
  age_45: (
    <>
      <path d="M10 34h11l4-12 6 24 5-16 3 4h15" data-draw />
    </>
  ),
  age_50: (
    <>
      <path d="M12 40h18" data-draw />
      <path d="M34 40h18" data-draw />
      <circle cx="32" cy="40" r="4" data-draw />
      <path d="M14 36l-4 4 4 4M50 36l4 4-4 4" data-draw />
    </>
  ),
  age_55: (
    <>
      <path d="M12 20h26v14H24l-6 6v-6h-6z" data-draw />
      <path d="M30 32h22v12H40l-4 5v-5h-6z" data-draw />
    </>
  ),
  age_60: (
    <>
      <path d="M12 46h40" data-draw />
      <path d="M20 46a12 12 0 0 1 24 0" data-draw />
      <path d="M32 18v6M18 28l4 4M46 28l-4 4" data-draw />
    </>
  ),
}

/** 选择倾向的小图标（结果页徽章用） */
const TAG_GLYPHS: Record<LifeTag, ReactNode> = {
  explore: <path d="M14 32h30M34 22l10 10-10 10" data-draw />,
  steady: (
    <>
      <path d="M16 44V28l14-10 14 10v16" data-draw />
      <path d="M12 46h36" data-draw />
    </>
  ),
  connect: (
    <>
      <circle cx="24" cy="28" r="6" data-draw />
      <circle cx="40" cy="28" r="6" data-draw />
      <path d="M18 44c0-6 12-6 12 0M34 44c0-6 12-6 12 0" data-draw />
    </>
  ),
  self: (
    <>
      <circle cx="30" cy="30" r="12" data-draw />
      <circle cx="30" cy="30" r="4" data-draw />
    </>
  ),
  give: (
    <>
      <path d="M18 30h18" data-draw />
      <path d="M18 30l6-6M18 30l6 6" data-draw />
      <path d="M36 18v20" data-draw />
      <path d="M36 18h14v20H36" data-draw />
    </>
  ),
}

export function LifeGlyph({ nodeId, size = 112, className }: { nodeId: string; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={['life-glyph', className].filter(Boolean).join(' ')}
    >
      {GLYPHS[nodeId] ?? GLYPHS.age_18}
    </svg>
  )
}

export function TagGlyph({ tag, size = 16, className }: { tag: LifeTag; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={['life-glyph', className].filter(Boolean).join(' ')}
    >
      {TAG_GLYPHS[tag]}
    </svg>
  )
}
