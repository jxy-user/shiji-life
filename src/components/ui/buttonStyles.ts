export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-body font-semibold tracking-[0.06em] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-45'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gold-500 text-cream-50 shadow-[0_0_22px_rgba(255,79,163,0.35)] hover:bg-gold-400 hover:shadow-[0_0_30px_rgba(255,79,163,0.5)]',
  secondary:
    'border border-gold-500/60 text-gold-400 hover:border-gold-400 hover:bg-gold-500/10 hover:shadow-[0_0_18px_rgba(255,79,163,0.3)]',
  ghost: 'text-ink-500 hover:text-ink-900',
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
