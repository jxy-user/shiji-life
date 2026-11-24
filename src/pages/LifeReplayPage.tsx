import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { summarizeLife } from '@/data/lifeStory'
import { useLifeStore } from '@/stores/useLifeStore'

/** 每条选择在回放里停留的时间；整段约 1–2 分钟，可随时跳过 */
const REVEAL_DELAY_MS = 6000

/**
 * 人生回放：按时间顺序逐条播放玩家的选择
 *
 * 只是如实呈现做过的事，不做评价；
 * 尊重 prefers-reduced-motion，开启时直接展开全部。
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
      () => setVisible((value) => Math.min(value + 1, total)),
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

  function handleRestart() {
    reset()
    navigate('/life')
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-cream-50 text-ink-900">
      <div aria-hidden className="scanlines absolute inset-0 opacity-50" />
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 h-[360px] w-[680px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,79,163,0.22),transparent_70%)] blur-2xl"
      />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-6 py-14 lg:max-w-3xl">
        <p className="text-[10px] tracking-[0.5em] text-sage-500">回放</p>
        <h1 className="mt-4 font-display text-3xl font-black italic text-ink-900">
          你走过的这一生
        </h1>
        <p className="mt-3 text-[12px] text-ink-500">
          18 岁到 60 岁，你做了 {total} 个选择。
        </p>

        <ol className="mt-10 space-y-10">
          {shown.map((choice, index) => (
            <li key={`${choice.nodeId}-${index}`} className="animate-rise-in">
              <div className="flex items-center gap-3">
                <span className="font-display text-3xl font-black tabular-nums text-gold-500">
                  {choice.age}
                </span>
                <span className="text-[11px] tracking-[0.3em] text-ink-500">
                  岁 · {choice.title}
                </span>
              </div>
              <p className="mt-3 font-display text-[17px] leading-8 text-ink-900">
                {choice.label}
              </p>
              <p className="mt-2 text-[13px] leading-7 text-ink-500">{choice.result}</p>
            </li>
          ))}
        </ol>

        {!finished ? (
          <div className="mt-12 flex items-center justify-between border-t border-sand-300/60 pt-5 text-[11px] text-ink-500">
            <span>
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
          <div className="mt-12 animate-rise-in border-t border-sand-300 pt-8">
            <p className="text-[11px] tracking-[0.35em] text-gold-500">
              这一生的关键词
            </p>
            <p className="mt-3 font-display text-3xl font-black italic text-ink-900">
              {summary.label}
            </p>
            <p className="mt-4 text-[14px] leading-8 text-ink-700">
              {summary.description}
            </p>
            <p className="mt-4 text-[11px] leading-6 text-ink-500">
              这不是评判，只是你走过的一条路。同一个问题，换一天再问，答案可能不一样。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-md bg-gold-500 px-5 py-2.5 text-[13px] font-semibold text-cream-50 shadow-[0_0_20px_rgba(255,79,163,0.3)] transition-colors hover:bg-gold-400"
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
