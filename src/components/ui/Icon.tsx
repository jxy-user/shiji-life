import type { ReactNode, SVGProps } from 'react'

/**
 * 统一的线性图标
 *
 * 用内联 SVG 代替 emoji：emoji 在不同系统上字形、颜色、基线都不一致，
 * 是「模板感」最明显的来源之一。这里统一 24px 视框、1.6px 描边、currentColor。
 */
export type IconName = 'refresh' | 'offline' | 'close' | 'edit' | 'trash'

const PATHS: Record<IconName, ReactNode> = {
  refresh: (
    <>
      <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
      <path d="M20.5 3.5V9h-5.5" />
    </>
  ),
  offline: (
    <>
      <path d="M3 3l18 18" />
      <path d="M8.2 8.6a6.5 6.5 0 0 1 9.3 9.1" />
      <path d="M5.4 12.4a10.4 10.4 0 0 1 2.8-1.9" />
      <path d="M1.9 9.2a15.4 15.4 0 0 1 3.4-2.3" />
      <circle cx="12" cy="19" r="1" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7.5 18.5 3.5 19.5l1-4L16.4 3.6z" />
    </>
  ),
  trash: (
    <>
      <path d="M3.5 6h17" />
      <path d="M8.5 6V4.2a1.2 1.2 0 0 1 1.2-1.2h4.6a1.2 1.2 0 0 1 1.2 1.2V6" />
      <path d="M18.5 6l-.9 13a2 2 0 0 1-2 1.9H8.4a2 2 0 0 1-2-1.9L5.5 6" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>
  ),
}

type IconProps = {
  name: IconName
  size?: number
} & Omit<SVGProps<SVGSVGElement>, 'name'>

export function Icon({ name, size = 16, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
