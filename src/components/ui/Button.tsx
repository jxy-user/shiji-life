import type { ButtonHTMLAttributes, ReactNode } from 'react'

import {
  buttonStyles,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[buttonStyles(variant, size), className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
