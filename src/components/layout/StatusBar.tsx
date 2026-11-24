import { Link } from 'react-router-dom'

import { TIME_SLOT_LABELS, type SaveData } from '@/game/saveSchema'
import { MAX_ACTION_POINTS } from '@/game/relationships'

type StatusBarProps = {
  save: SaveData
  /** 显示返回城市的入口；在城市页本身不显示 */
  showBackHome?: boolean
  title?: string
}

/**
 * 顶部状态栏：游戏内时间与精力。
 * 精力是游戏资源，不是心理状态评分，因此只显示数值和示意条。
 */
export function StatusBar({ save, showBackHome = true, title }: StatusBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-sand-300/70 bg-cream-50/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 lg:max-w-6xl lg:px-6">
        {showBackHome ? (
          <Link
            to="/city"
            className="-ml-1 rounded-full px-2 py-1 text-[12px] tracking-[0.08em] text-ink-500 transition-colors hover:text-ink-900"
          >
            ← 城市
          </Link>
        ) : (
          <span className="w-[52px]" aria-hidden />
        )}

        <p className="flex-1 truncate text-center text-[12px] tracking-[0.16em] text-ink-500">
          {title ?? '未完成之城'}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-ink-500">
          <span
            className="flex items-center gap-1.5 whitespace-nowrap"
            aria-label={`行动力 ${save.actionPoints} / ${MAX_ACTION_POINTS}`}
          >
            <span className="flex gap-0.5" aria-hidden>
              {Array.from({ length: MAX_ACTION_POINTS }).map((_, index) => (
                <span
                  key={index}
                  className={[
                    'h-1.5 w-1.5 rounded-full transition-colors duration-300',
                    index < save.actionPoints ? 'bg-sage-500' : 'bg-sand-300',
                  ].join(' ')}
                />
              ))}
            </span>
            <span className="tabular-nums">行动 {save.actionPoints}</span>
          </span>
          <span className="whitespace-nowrap">
            第 {save.gameDay} 天 · {TIME_SLOT_LABELS[save.timeSlot]}
          </span>
          <span
            className="flex items-center gap-1.5 whitespace-nowrap"
            aria-label={`精力 ${save.energy}`}
          >
            <span className="relative h-1.5 w-10 overflow-hidden rounded-full bg-sand-300/70">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-gold-400 transition-[width] duration-500"
                style={{ width: `${save.energy}%` }}
              />
            </span>
            <span className="tabular-nums">精力 {save.energy}</span>
          </span>
        </div>
      </div>
    </header>
  )
}
