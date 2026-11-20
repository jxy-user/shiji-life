import { useUiStore } from '@/stores/useUiStore'

/**
 * 写盘失败提示
 *
 * localStorage 不可用（隐私模式、配额已满）时，游戏仍可继续，
 * 但必须让玩家知道「刷新后会丢」，而不是默默丢失进度。
 */
export function PersistenceNotice() {
  const failed = useUiStore((state) => state.persistenceError)
  if (!failed) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-3"
    >
      <div className="mx-auto max-w-xl rounded-2xl border border-gold-500/40 bg-ink-900/95 px-4 py-3 text-center text-[12px] leading-5 text-cream-100 shadow-[0_18px_40px_-20px_rgba(43,38,33,0.8)]">
        这次进度没能保存到本地，刷新后会丢失。你可以继续玩，但建议检查浏览器的隐私模式或存储空间。
      </div>
    </div>
  )
}
