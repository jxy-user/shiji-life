import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { AuroraBand } from '@/components/effects/AuroraBand'
import { CinemaFrame } from '@/components/effects/CinemaFrame'
import { TagGlyph } from '@/components/life/LifeGlyph'
import { SoundToggle } from '@/components/life/SoundToggle'
import { LIFE_TAGS, LIFE_TAG_LABELS, summarizeLife } from '@/data/lifeStory'
import { sfx } from '@/services/sound'
import { useLifeStore } from '@/stores/useLifeStore'

/** 每条选择在回放里停留的时间；整段约 1–2 分钟，可随时跳过 */
const REVEAL_DELAY_MS = 6000

/**
 * 人生回放：按时间顺序逐条播放玩家的选择
 *
 * 左侧时间轴随进度点亮，结尾用倾向标签收束；
 * 只是如实呈现做过的事，不做评价。
 */
export default function LifeReplayPage() {
  const navigate = useNavigate()
  const save = useLifeStore((state) => state.save)
  const reset = useLifeStore((state) => state.reset)
  const [visible, setVisible] = useState(1)

  const total = save?.choices.length ?? 0

  useEffect(() => {
    if (!save) return
    if (visible >= total) return

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const timer = setTimeout(
      () => {
        const next = Math.min(visible + 1, total)
        if (next >= total) sfx.ding()
        else sfx.tick()
        setVisible(next)
      },
      reduced ? 0 : REVEAL_DELAY_MS,
    )
    return () => clearTimeout(timer)
  }, [save, visible, total])

  // 只有真正走完（finishedAt）的人生才允许回放；深链直接访问会被带回人生线
  if (!save || save.choices.length === 0 || !save.finishedAt) {
    return <Navigate to="/life" replace />
  }

  const summary = summarizeLife(save.choices)
  const shown = save.choices.slice(0, visible)
  const finished = visible >= total

  const sortedTags = LIFE_TAGS.map((tag) => ({ tag, count: summary.counts[tag] })).sort(
    (a, b) => b.count - a.count,
  )
  const maxCount = sortedTags[0]?.count ?? 0

  function handleRestart() {
    sfx.whoosh()
    reset()
    navigate('/life')
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-cream-50 text-ink-900">
      <CinemaFrame />
      <div
        aria-hidden
        className="absolute inset-0 animate-[kenburns_26s_ease-in-out_infinite_alternate] bg-[radial-gradient(ellipse_at_50%_-12%,var(--color-gold-200)_0%,transparent_58%)] opacity-30"
      />
      <AuroraBand />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-[8vh] pt-[8vh] lg:max-w-3xl">
        <div className="flex items-center justify-between">
          <p className="text-[10px] tracking-[0.5em] text-sage-500">回放</p>
          <SoundToggle />
        </div>
        <h1 className="mt-4 font-display text-3xl tracking-[0.04em] text-ink-900">
          你走过的这一生
        </h1>
        <p className="mt-3 text-[12px] text-ink-500">
          18 岁到 60 岁，你做了 {total} 个选择。
        </p>

        {/* 回放进度：随逐条出现平滑增长 */}
        <div className="mt-8 h-px w-full overflow-hidden bg-sand-300/60" aria-hidden>
          <div
            className="h-px bg-gold-500 transition-all duration-700 ease-out"
            style={{ width: `${total === 0 ? 0 : (shown.length / total) * 100}%` }}
          />
        </div>

        <ol className="mt-10 space-y-10">
          {shown.map((choice, index) => (
            <li key={`${choice.nodeId}-${index}`} className="relative animate-rise-in pl-8">
              {/* 时间轴：竖线与节点 */}
              <span
                aria-hidden
                className="absolute bottom-0 left-0 top-0 w-px bg-sand-300/50"
              />
              <span
                aria-hidden
                className="absolute left-0 top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-gold-500 ring-4 ring-gold-500/15"
              />

              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl tabular-nums text-gold-500">
                  {choice.age}
                </span>
                <span className="text-[11px] tracking-[0.3em] text-ink-500">
                  岁 · {choice.title}
                </span>
              </div>
              <p className="mt-3 font-display text-lg leading-8 text-ink-900">
                {choice.label}
              </p>
              <p className="mt-2 text-sm leading-8 text-ink-500">{choice.result}</p>
            </li>
          ))}
        </ol>

        {!finished ? (
          <div className="mt-12 flex items-center justify-between border-t border-sand-300/60 pt-5 text-[11px] text-ink-500">
            <span className="tabular-nums">
              {shown.length} / {total}
            </span>
            <button
              type="button"
              onClick={() => setVisible(total)}
              className="rounded-md border border-sand-300 px-4 py-1.5 transition-colors hover:border-gold-400 hover:text-ink-900"
            >
              跳过回放
            </button>
          </div>
        ) : (
          <div className="mt-14 animate-rise-in border-t border-sand-300 pt-10 text-center">
            <p className="text-[11px] tracking-[0.5em] text-gold-500">
              这一生的关键词
            </p>
            <p className="mt-4 font-display text-5xl tracking-[0.06em] text-ink-900">
              {summary.label}
            </p>
            <p className="mx-auto mt-5 max-w-lg text-[14px] leading-8 text-ink-700">
              {summary.description}
            </p>

            {/* 倾向标签：按出现次数排序，只做视觉强调，不显示数字 */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2" aria-hidden>
              {sortedTags.map(({ tag, count }, index) => {
                const leading = count > 0 && count === maxCount
                return (
                  <span
                    key={tag}
                    className={[
                      'inline-flex animate-rise-in items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] tracking-[0.1em]',
                      leading
                        ? 'border-gold-500/50 bg-gold-500/10 text-gold-600'
                        : 'border-sand-300 text-ink-500',
                    ].join(' ')}
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <TagGlyph tag={tag} size={13} />
                    {LIFE_TAG_LABELS[tag]}
                  </span>
                )
              })}
            </div>

            <p className="mx-auto mt-7 max-w-md text-[11px] leading-6 text-ink-500">
              这不是评判，只是你走过的一条路。同一个问题，换一天再问，答案可能不一样。
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-md bg-gold-500 px-5 py-2.5 text-[13px] font-semibold text-cream-50 transition-colors hover:bg-gold-400"
              >
                再走一次
              </button>
              <Link
                to="/"
                className="rounded-md border border-sand-300 px-5 py-2.5 text-[13px] text-ink-700 transition-colors hover:border-gold-400"
              >
                回到首页
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
