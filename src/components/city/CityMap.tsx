import type { ReactNode } from 'react'

import type { SceneId } from '@/game/saveSchema'

type HotspotID = SceneId | 'district' | 'studio' | 'faraway'

type Hotspot = {
  id: HotspotID
  label: string
  hint: string
  x: number
  y: number
  locked?: boolean
}

const HOTSPOTS: Hotspot[] = [
  { id: 'park', label: '公园', hint: '散步的地方', x: 16, y: 27 },
  { id: 'campus', label: '校园', hint: '走廊的尽头', x: 77, y: 25 },
  { id: 'home', label: '家', hint: '你的房间', x: 15, y: 72 },
  { id: 'plaza', label: '中央广场', hint: '城市的心跳', x: 50, y: 51 },
  { id: 'district', label: '街区', hint: '还在建造', x: 78, y: 71, locked: true },
  { id: 'studio', label: '工作室', hint: '还在建造', x: 45, y: 12, locked: true },
  { id: 'faraway', label: '远方', hint: '还在建造', x: 88, y: 44, locked: true },
]

type CityMapProps = {
  onEnter: (scene: SceneId) => void
  /** 微光在广场树下的位置，由页面决定是否出现 */
  lumiSlot?: ReactNode
}

export function CityMap({ onEnter, lumiSlot }: CityMapProps) {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-5xl overflow-hidden rounded-2xl border border-sand-300/70 bg-cream-100 shadow-[0_18px_40px_-32px_rgba(43,38,33,0.3)] sm:aspect-[16/10] lg:max-w-6xl">
      <svg
        viewBox="0 0 900 620"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f4e2bd" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f4e2bd" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="map-ground" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f6efdf" />
            <stop offset="100%" stopColor="#eee1cb" />
          </linearGradient>
        </defs>

        <rect width="900" height="620" fill="url(#map-ground)" />

        {/* 绿地 */}
        <ellipse cx="150" cy="150" rx="180" ry="120" fill="#dfe7d8" />
        <ellipse cx="700" cy="140" rx="150" ry="100" fill="#e3ead9" />
        <ellipse cx="820" cy="400" rx="110" ry="90" fill="#e9eee0" />

        {/* 道路 */}
        <g stroke="#efe4d2" strokeWidth="34" strokeLinecap="round" fill="none">
          <path d="M440 310 L170 440" />
          <path d="M440 310 L680 160" />
          <path d="M440 310 L160 175" />
          <path d="M440 310 L690 445" />
          <path d="M440 310 L520 90" />
          <path d="M440 310 L820 300" />
        </g>

        {/* 广场 */}
        <circle cx="445" cy="310" r="96" fill="url(#map-glow)" />
        <circle cx="445" cy="310" r="66" fill="#f8f2e7" stroke="#dcc9ac" strokeWidth="2" />
        <circle cx="445" cy="310" r="44" fill="none" stroke="#e2d3bb" strokeWidth="1.5" strokeDasharray="8 8" />
        <circle cx="445" cy="310" r="12" fill="#e9c98c" stroke="#c08f45" strokeWidth="2" />

        {/* 广场西侧的老树（微光出现的地方） */}
        <g>
          <path d="M332 404 v-22" stroke="#8a715c" strokeWidth="6" strokeLinecap="round" />
          <circle cx="330" cy="362" r="24" fill="#b8cbba" />
          <circle cx="312" cy="372" r="15" fill="#cddccf" />
          <circle cx="348" cy="372" r="13" fill="#a9c0ad" />
        </g>

        {/* 公园：树与池塘 */}
        <g>
          <ellipse cx="118" cy="150" rx="46" ry="30" fill="#b8cbba" />
          <ellipse cx="92" cy="140" rx="26" ry="18" fill="#cddccf" />
          <ellipse cx="196" cy="112" rx="30" ry="20" fill="#a9c0ad" />
          <ellipse cx="150" cy="196" rx="54" ry="24" fill="#c9d8cf" opacity="0.9" />
        </g>

        {/* 校园：主楼与庭院 */}
        <g>
          <rect x="620" y="92" width="118" height="70" rx="6" fill="#e9dcc7" stroke="#c4b193" strokeWidth="2" />
          <path d="M612 92 h134 l-10 -16 h-114 z" fill="#c9b79a" />
          <g fill="#fdfbf6">
            <rect x="636" y="110" width="16" height="20" rx="2" />
            <rect x="664" y="110" width="16" height="20" rx="2" />
            <rect x="692" y="110" width="16" height="20" rx="2" />
          </g>
          <ellipse cx="700" cy="190" rx="60" ry="26" fill="#e3ead9" />
          <circle cx="640" cy="176" r="18" fill="#a9c0ad" />
        </g>

        {/* 家：两间小屋 */}
        <g>
          <rect x="96" y="410" width="76" height="54" rx="5" fill="#f2e6d2" stroke="#c9b79a" strokeWidth="2" />
          <path d="M88 410 L134 378 L180 410 Z" fill="#c9a98a" />
          <rect x="120" y="434" width="18" height="30" rx="3" fill="#b9a98f" />
          <circle cx="200" cy="446" r="22" fill="#b8cbba" />
        </g>

        {/* 街区（未开放） */}
        <g opacity="0.55">
          <rect x="650" y="410" width="52" height="40" rx="4" fill="#efe0c9" stroke="#c4b193" strokeDasharray="6 5" />
          <rect x="712" y="422" width="52" height="28" rx="4" fill="#efe0c9" stroke="#c4b193" strokeDasharray="6 5" />
        </g>

        {/* 工作室（未开放） */}
        <rect
          x="480"
          y="52"
          width="62"
          height="42"
          rx="4"
          fill="#efe0c9"
          stroke="#c4b193"
          strokeDasharray="6 5"
          opacity="0.55"
        />

        {/* 远方：地平线上的一点光 */}
        <g opacity="0.75">
          <path d="M760 470 q40 -34 90 -10 q40 18 80 -4 v24 h-170 z" fill="#e3ead9" />
          <circle cx="846" cy="392" r="8" fill="#f4e2bd" />
          <circle cx="846" cy="392" r="26" fill="#f4e2bd" opacity="0.4" />
        </g>
      </svg>

      <div className="paper-grain absolute inset-0 opacity-50" aria-hidden />

      {lumiSlot}

      {HOTSPOTS.map((spot) => (
        <button
          key={spot.id}
          type="button"
          disabled={spot.locked}
          onClick={() => !spot.locked && onEnter(spot.id as SceneId)}
          style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
          aria-label={
            spot.locked ? `${spot.label}（还在建造，暂未开放）` : `前往${spot.label}`
          }
          className={[
            'group absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1.5',
            'text-[11px] tracking-[0.12em] shadow-sm backdrop-blur-sm transition-all duration-200 sm:px-3.5 sm:text-[12px]',
            spot.locked
              ? 'cursor-not-allowed border border-dashed border-sand-300 bg-cream-50/60 text-ink-500'
              : 'border border-sand-300 bg-cream-50/90 text-ink-700 hover:-translate-y-[calc(50%+2px)] hover:border-gold-400 hover:text-ink-900 hover:shadow-md',
          ].join(' ')}
        >
          {spot.label}
          <span className="mt-0.5 block text-[9px] tracking-[0.06em] text-ink-500 group-hover:text-ink-500">
            {spot.hint}
          </span>
        </button>
      ))}
    </div>
  )
}
