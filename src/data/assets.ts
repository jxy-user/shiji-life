import type { ArtKey, AvatarId } from '../domain/types'

const webpFiles = import.meta.glob<string>('../../assets/img/webp/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})

const artWidths = {
  'avatar-chenguang': [160, 320, 512],
  'avatar-yese': [160, 320, 512],
  'avatar-qingtai': [160, 320, 512],
  'avatar-taotu': [160, 320, 512],
  'night-room': [480, 800, 1000],
  plaza: [420, 700, 1000],
  'sketch-plaza': [400, 800],
  'sketch-oldman': [480, 800, 1200],
  'sketch-bridge': [400, 800],
  'sketch-mugs': [400, 800],
  'sketch-desk': [400, 800],
  'sketch-park': [400, 800],
  'sketch-ruins': [400, 800],
  'sketch-plane': [400, 800],
  'sketch-map': [400, 800],
} as const satisfies Record<ArtKey, readonly number[]>

interface ArtSource {
  src: string
  srcSet: string
}

function createArtSource(artKey: ArtKey): ArtSource {
  const widths = artWidths[artKey]
  const srcSet = widths.map((width) => {
    const file = webpFiles[`../../assets/img/webp/${artKey}-${width}.webp`]
    if (!file) throw new Error(`Missing optimized asset: ${artKey}-${width}.webp`)
    return `${file} ${width}w`
  }).join(', ')
  const largestWidth = widths[widths.length - 1]
  const src = webpFiles[`../../assets/img/webp/${artKey}-${largestWidth}.webp`]
  if (!src) throw new Error(`Missing optimized asset: ${artKey}-${largestWidth}.webp`)
  return { src, srcSet }
}

export const art = Object.fromEntries(
  (Object.keys(artWidths) as ArtKey[]).map((artKey) => [artKey, createArtSource(artKey)]),
) as Record<ArtKey, ArtSource>

export const avatarOptions: { id: AvatarId; name: string; artKey: ArtKey }[] = [
  { id: 'chenguang', name: '晨光', artKey: 'avatar-chenguang' },
  { id: 'yese', name: '夜色', artKey: 'avatar-yese' },
  { id: 'qingtai', name: '青苔', artKey: 'avatar-qingtai' },
  { id: 'taotu', name: '陶土', artKey: 'avatar-taotu' },
]

export const lifeStageOptions = ['想好好生活', '正在重新开始', '想找到方向', '先缓一缓']
export const topicOptions = ['关于独处', '关于靠近', '关于疲惫', '关于表达', '关于改变']

export const actionWindowLabels = {
  'today-week': '今天 / 本周',
  today: '今天',
  week: '本周',
  someday: '不着急',
} as const

export const actionStatusLabels = {
  todo: '待办',
  doing: '进行中',
  paused: '暂停',
  done: '已完成',
} as const

export const journalTypeLabels = {
  free: '自由记录',
  action: '行动复盘',
  insight: '关联认知',
} as const
