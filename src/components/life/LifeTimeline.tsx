import { LIFE_NODES } from '@/data/lifeStory'

/**
 * 人生年龄轴：18 → 60
 *
 * 用进度线与节点圆点把「走到哪一年」可视化，替代「第 N / 11 个选择」的纯文字。
 */
export function LifeTimeline({ currentAge }: { currentAge: number }) {
  const first = LIFE_NODES[0].age
  const last = LIFE_NODES[LIFE_NODES.length - 1].age
  const ratio = Math.max(0, Math.min(1, (currentAge - first) / (last - first)))

  return (
    <div className="relative mx-auto h-9 w-full max-w-xl" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-sand-300/60" />
      <div
        className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-gold-500 transition-[width] duration-700 ease-out"
        style={{ width: `${ratio * 100}%` }}
      />

      {LIFE_NODES.map((node, index) => {
        const left = (index / (LIFE_NODES.length - 1)) * 100
        const reached = node.age <= currentAge
        const current = node.age === currentAge
        return (
          <span
            key={node.id}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%` }}
          >
            <span
              className={[
                'block rounded-full transition-all duration-500',
                current
                  ? 'h-3 w-3 bg-gold-500 shadow-[0_0_0_4px_rgba(201,162,90,0.18)]'
                  : reached
                    ? 'h-2 w-2 bg-gold-500'
                    : 'h-1.5 w-1.5 bg-sand-300',
              ].join(' ')}
            />
          </span>
        )
      })}

      <span className="absolute left-0 top-full mt-1 text-[10px] tabular-nums text-ink-500">
        {first}
      </span>
      <span className="absolute right-0 top-full mt-1 text-[10px] tabular-nums text-ink-500">
        {last}
      </span>
      {/* 当前年龄放在轴上方，避免与两端标签重叠 */}
      <span
        className="absolute bottom-full mb-1 -translate-x-1/2 text-[10px] tabular-nums tracking-[0.2em] text-gold-500 transition-[left] duration-700 ease-out"
        style={{ left: `${ratio * 100}%` }}
      >
        {currentAge}
      </span>
    </div>
  )
}
