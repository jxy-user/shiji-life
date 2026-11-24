import type { ReactNode, SVGProps } from 'react'

/**
 * 统一的线性图标
 *
 * 用内联 SVG 代替 emoji：emoji 在不同系统上字形、颜色、基线都不一致，
 * 是「模板感」最明显的来源之一。这里统一 24px 视框、1.6px 描边、currentColor。
 */
export type IconName =
  | 'refresh'
  | 'offline'
  | 'install'
  | 'smartphone'
  | 'close'
  | 'edit'
  | 'trash'
  | 'check'
  | 'plus'
  | 'arrow-left'
  | 'chevron-right'

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
  install: (
    <>
      <path d="M12 3v11" />
      <path d="M7.5 9.5L12 14l4.5-4.5" />
      <path d="M4 20h16" />
    </>
  ),
  smartphone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M11 18.5h2" />
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
  check: <path d="M20 6.5L9.5 17 4 11.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  'arrow-left': (
    <>
      <path d="M19 12H5" />
      <path d="M11.5 18.5L5 12l6.5-6.5" />
    </>
  ),
  'chevron-right': <path d="M9 5l7 7-7 7" />,
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
