import { BookOpen, Compass, ListChecks, Map, MessagesSquare, Settings } from 'lucide-react'

export const primaryNavigation = [
  { to: '/city', label: '城市', code: 'CITY', icon: Map },
  { to: '/archive', label: '人生档案', code: 'FILE', icon: BookOpen },
  { to: '/journal', label: '日记', code: 'NOTE', icon: Compass },
  { to: '/actions', label: '现实行动', code: 'ACT', icon: ListChecks },
  { to: '/reflection', label: '阶段回顾', code: 'REVIEW', icon: MessagesSquare },
  { to: '/settings', label: '设置', code: 'SET', icon: Settings },
] as const

export function routeMeta(pathname: string) {
  if (pathname === '/') return { title: '拾己 · LIFE', code: 'COVER / 001', backTo: null }
  if (pathname === '/prologue') return { title: '序章 · 夜雨', code: 'PROLOGUE / 000', backTo: '/' }
  if (pathname === '/create') return { title: '新居民登记', code: 'REGISTER / 001', backTo: '/prologue' }
  if (pathname === '/city') return { title: '未完成之城', code: 'CITY / 001', backTo: null }
  if (pathname.startsWith('/scene/')) return { title: '城市现场', code: 'SCENE / LIVE', backTo: '/city' }
  if (pathname.startsWith('/event/')) return { title: '现场记录', code: 'EVENT / 004', backTo: '/city' }
  if (pathname === '/archive') return { title: '人生档案', code: 'ARCHIVE / 001', backTo: '/city' }
  if (pathname === '/reflection') return { title: '阶段回顾', code: 'REVIEW / 002', backTo: '/archive' }
  if (pathname === '/journal') return { title: '日记 · 私人记录', code: 'PRIVATE / 003', backTo: '/city' }
  if (pathname === '/actions') return { title: '现实行动', code: 'ACTION / 004', backTo: '/city' }
  if (pathname === '/settings') return { title: '设置 · 权限登记', code: 'SETTING / 005', backTo: '/' }
  return { title: '未找到这一页', code: 'ERROR / 404', backTo: '/city' }
}
