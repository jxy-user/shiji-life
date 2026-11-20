import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { useGameStore } from '@/stores/useGameStore'

export default function StartPage() {
  const hasSave = useGameStore((state) => state.hasSave)
  const refreshSaveState = useGameStore((state) => state.refreshSaveState)

  useEffect(() => {
    refreshSaveState()
  }, [refreshSaveState])

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-cream-50">
      {/* 背景：暖光、城市边缘的一点绿、纸张颗粒 */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-15%,var(--color-gold-200)_0%,transparent_62%)] opacity-80"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_8%_112%,var(--color-sage-300)_0%,transparent_52%)] opacity-35"
      />
      <div aria-hidden className="paper-grain absolute inset-0 opacity-80" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16">
        {/* 微光：还没遇到 Lumi，只留一点光 */}
        <div aria-hidden className="relative mb-11 h-20 w-20">
          <div className="lumi-glow absolute inset-0 animate-soft-pulse rounded-full" />
        </div>

        <p className="animate-rise-in text-[11px] tracking-[0.55em] text-ink-500">
          未完成之城
        </p>

        <h1
          className="mt-6 animate-rise-in font-display text-hero leading-none tracking-[0.14em] text-ink-900 [text-indent:0.14em] sm:text-7xl"
          style={{ animationDelay: '80ms' }}
        >
          拾己
        </h1>

        <p
          className="mt-5 animate-rise-in text-[11px] tracking-[0.62em] text-ink-500"
          style={{ animationDelay: '140ms' }}
        >
          LIFE
        </p>

        <div
          className="my-9 h-px w-16 animate-rise-in bg-gradient-to-r from-transparent via-gold-400 to-transparent"
          style={{ animationDelay: '200ms' }}
        />

        <p
          className="animate-rise-in font-display text-lg text-ink-700"
          style={{ animationDelay: '260ms' }}
        >
          先生活，再认识自己。
        </p>

        <p
          className="mt-4 max-w-xs animate-rise-in text-center text-[13px] leading-6 text-ink-500"
          style={{ animationDelay: '320ms' }}
        >
          在这座还没建完的城市里，选择没有标准答案。你经历的每件小事，都会在某个时刻被温柔地回望。
        </p>

        <div
          className="mt-11 flex w-full max-w-[300px] animate-rise-in flex-col gap-3"
          style={{ animationDelay: '380ms' }}
        >
          <Link to="/prologue" className={`${buttonStyles('primary', 'lg')} w-full`}>
            开始新的旅程
          </Link>

          {hasSave ? (
            <Link to="/city" className={`${buttonStyles('secondary', 'lg')} w-full`}>
              继续旅程
            </Link>
          ) : (
            <Button variant="secondary" size="lg" className="w-full" disabled>
              继续旅程
            </Button>
          )}

          {!hasSave && (
            <p className="text-center text-[11px] text-ink-500">还没有存档</p>
          )}
        </div>
      </div>

      <footer className="relative z-10 px-6 pb-8 text-center text-[11px] leading-5 text-ink-500">
        这不是心理测评，也不会给你贴标签。
        <br />
        你随时可以拒绝回顾、删除经历，或关闭分析。
      </footer>
    </main>
  )
}
