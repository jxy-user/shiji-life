export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-body transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-ink-900 text-(--site-on-accent) shadow-[0_10px_24px_-14px_rgba(43,38,33,0.7)] hover:bg-ink-700',
  secondary:
    'border border-sand-300 bg-cream-50/70 text-ink-700 hover:border-gold-400 hover:text-ink-900',
  ghost: 'text-ink-500 hover:bg-cream-200/70 hover:text-ink-900',
}

const sizes: Record<ButtonSize, string> = {
  md: 'h-10 px-5 text-sm tracking-wide',
  lg: 'h-13 px-7 text-[15px] tracking-[0.08em]',
}

/** 生成按钮样式，供 <button> 与 <Link> 共用，保证外观一致 */
export function buttonStyles(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
) {
  return [base, variants[variant], sizes[size]].join(' ')
}
