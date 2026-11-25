import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, Ref } from 'react'
import { Loader2 } from 'lucide-react'
import styles from './GPrimitives.module.css'

interface PaperSheetProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  className?: string
  torn?: boolean
  halftone?: boolean
  as?: 'section' | 'article' | 'aside' | 'header' | 'div'
}

export function PaperSheet({ children, className = '', torn = false, halftone = false, as = 'section', ...rest }: PaperSheetProps) {
  const Component = as
  return <Component className={[styles.paper, torn ? styles.torn : '', halftone ? styles.halftone : '', className].filter(Boolean).join(' ')} {...rest}>{children}</Component>
}

interface PaperButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: 'primary' | 'secondary' | 'quiet' | 'ink'
  size?: 'normal' | 'small'
  loading?: boolean
  ref?: Ref<HTMLButtonElement>
}

export function PaperButton({ intent = 'primary', size = 'normal', className = '', type = 'button', loading = false, disabled, children, ...props }: PaperButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, styles[intent], size === 'small' ? styles.small : '', className].filter(Boolean).join(' ')}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 size={size === 'small' ? 16 : 18} className={styles.spinner} aria-hidden="true" />}
      {children}
    </button>
  )
}

interface PaperTagProps {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  pressed?: boolean
  disabled?: boolean
  className?: string
}

export function PaperTag({ children, active = false, onClick, pressed, disabled, className = '' }: PaperTagProps) {
  const classes = [styles.tag, active ? styles.active : '', onClick ? styles.interactive : '', className].filter(Boolean).join(' ')
  if (onClick) {
    return <button type="button" className={classes} onClick={onClick} aria-pressed={pressed} disabled={disabled}>{children}</button>
  }
  return <span className={classes}>{children}</span>
}

export function Stamp({ children, tone = 'ink', className }: { children: ReactNode; tone?: 'ink' | 'sun' | 'paper' | 'signal'; className?: string }) {
  return <span className={[styles.stamp, styles[tone === 'paper' ? 'stampPaper' : tone === 'ink' ? 'inkTone' : tone], className].filter(Boolean).join(' ')}>{children}</span>
}

export function Pin({ tone = 'sun' }: { tone?: 'sun' | 'signal' }) {
  return <span className={[styles.pin, styles[tone]].filter(Boolean).join(' ')} aria-hidden="true" />
}

export function Halftone({ className = '' }: { className?: string }) {
  return <span className={[styles.halftoneField, className].filter(Boolean).join(' ')} aria-hidden="true" />
}

export function EmptyPaper({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <PaperSheet className={styles.empty} halftone>
      <span className={styles.emptyCode} aria-hidden="true">NO ENTRIES</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </PaperSheet>
  )
}
