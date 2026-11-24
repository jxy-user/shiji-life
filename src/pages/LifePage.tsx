import { Link, Navigate, useNavigate } from 'react-router-dom'

import { LIFE_NODES, type LifeChoice } from '@/data/lifeStory'
import { useLifeStore } from '@/stores/useLifeStore'

/**
 * 人生线：18 → 60 岁
 *
 * 一个节点对应一次重大抉择；选择后立刻写入存档并展示一小段结果，
 * 「继续」进入下一个节点。走完最后一个节点后进入回放页。
 */
export default function LifePage() {
  const navigate = useNavigate()
  const save = useLifeStore((state) => state.save)
  const start = useLifeStore((state) => state.start)
  const choose = useLifeStore((state) => state.choose)
  const clearPending = useLifeStore((state) => state.clearPending)
  const reset = useLifeStore((state) => state.reset)

  if (!save) {
    return (
      <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-cream-50 text-ink-900">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--color-gold-200)_0%,transparent_60%)] opacity-40"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
          <p className="text-[10px] tracking-[0.55em] text-gold-600">人生线</p>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-[0.04em] text-ink-900 lg:text-5xl">
            从 18 岁，到 60 岁
          </h1>
          <p className="mt-6 text-[14px] leading-7 text-ink-500">
            你会遇到 {LIFE_NODES.length} 个重大抉择。每选一项，就往前走一段。
            没有标准答案，也不会有人给你打分。
          </p>

          <button
            type="button"
            onClick={start}
            className="mt-10 rounded-md bg-gold-500 px-6 py-3 text-[15px] font-semibold tracking-[0.06em] text-cream-50 transition-colors hover:bg-gold-400"
          >
            开始这段人生
          </button>
          <Link
            to="/"
            className="mt-4 text-[12px] text-ink-500 transition-colors hover:text-ink-900"
          >
            回到首页
          </Link>
        </div>
      </main>
    )
  }

  // 已走完且没有待确认的结果：直接进入回放
  if (!save.pendingChoice && save.finishedAt) {
    return <Navigate to="/life/replay" replace />
  }

  const pending = save.pendingChoice
  const node = LIFE_NODES[save.currentIndex]
  const progress = Math.min(save.choices.length, LIFE_NODES.length)

  function handleChoose(choice: LifeChoice) {
    choose(choice.id)
  }

  function handleContinue() {
    clearPending()
    if (useLifeStore.getState().save?.finishedAt) navigate('/life/replay')
  }

  function handleRestart() {
    if (!window.confirm('重新开始会清空这一段人生的选择，确定吗？')) return
    reset()
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-cream-50 text-ink-900">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-12%,var(--color-gold-200)_0%,transparent_58%)] opacity-30"
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-6 py-10 lg:max-w-3xl">
        <header className="flex items-center justify-between text-[11px] tracking-[0.2em] text-ink-500">
          <Link to="/" className="transition-colors hover:text-ink-900">
            ← 首页
          </Link>
          <span>
            人生线 · {progress} / {LIFE_NODES.length}
          </span>
        </header>

        <div className="mt-10 flex-1">
          {pending ? (
            <section className="animate-rise-in" aria-live="polite">
              <p className="text-[11px] tracking-[0.35em] text-gold-500">
                {pending.age} 岁 · {pending.title}
              </p>
              <p className="mt-4 text-[12px] text-ink-500">你选择了</p>
              <h2 className="mt-1 font-display text-xl text-ink-900">{pending.label}</h2>
              <p className="mt-6 font-display text-[16px] leading-8 text-ink-700">
                {pending.result}
              </p>

              <button
                type="button"
                onClick={handleContinue}
                className="mt-10 rounded-md bg-gold-500 px-6 py-3 text-[15px] font-semibold text-cream-50 transition-colors hover:bg-gold-400"
              >
                {save.finishedAt ? '看看这一生' : '继续'}
              </button>
            </section>
          ) : node ? (
            <section className="animate-rise-in">
              <p className="text-[11px] tracking-[0.35em] text-gold-500">
                {node.age} 岁 · {node.title}
              </p>
              <p className="mt-4 font-display text-[15px] leading-8 text-ink-500">
                {node.scene}
              </p>
              <h2 className="mt-6 font-display text-2xl leading-9 text-ink-900">
                {node.prompt}
              </h2>

              <div className="mt-8 space-y-3">
                {node.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleChoose(choice)}
                    className="group flex w-full items-center justify-between gap-4 rounded-xl border border-sand-300 bg-cream-100/70 px-5 py-4 text-left transition-colors hover:border-gold-400 hover:bg-gold-500/10"
                  >
                    <span className="text-[15px] text-ink-900">{choice.label}</span>
                    <span
                      aria-hidden
                      className="text-gold-400 transition-transform group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <footer className="mt-10 flex items-center justify-between border-t border-sand-300/60 pt-4 text-[11px] text-ink-500">
          <button type="button" onClick={handleRestart} className="hover:text-ink-900">
            重新开始
          </button>
          <span>选择没有标准答案</span>
        </footer>
      </div>
    </main>
  )
}
