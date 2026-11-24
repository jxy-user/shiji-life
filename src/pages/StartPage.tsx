import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { hasPlayableSave } from '@/services/savePeek'

export default function StartPage() {
  // 直接读存储层，不引入游戏 store：完整校验（zod）留在后续页面的代码块里，
  // 首屏只需要知道「有没有可继续的存档」——损坏的存档不能给出继续入口
  const [hasSave] = useState(() => hasPlayableSave())
  const location = useLocation()
  const saveBroken = Boolean(
    (location.state as { saveBroken?: boolean } | null)?.saveBroken,
  )
  // 存档已知读不出来时不再给继续入口，避免「点了又弹回」的死循环
  const canContinue = hasSave && !saveBroken

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-cream-50">
      {/* 纸面：极淡方格 + 暖光 + 颗粒，避免大面积平滑渐变 */}
      <div aria-hidden className="paper-grid absolute inset-0 opacity-25" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,var(--color-gold-200)_0%,transparent_58%)] opacity-70"
      />
      <div aria-hidden className="paper-grain absolute inset-0 opacity-70" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 lg:max-w-4xl lg:flex-row lg:items-center lg:gap-28 lg:px-12">
        {/* 左：刊头 */}
        <div className="flex flex-col items-center">
          <div aria-hidden className="relative mb-10 h-14 w-14">
            <div className="lumi-glow absolute inset-0 animate-soft-pulse rounded-full" />
          </div>

          <p className="animate-rise-in text-[10px] tracking-[0.6em] text-ink-500">
            未完成之城
          </p>

          <h1
            className="mt-7 animate-rise-in font-display text-[76px] leading-none tracking-[0.18em] text-ink-900 [text-indent:0.18em] sm:text-[88px] lg:text-[104px]"
            style={{ animationDelay: '70ms' }}
          >
            拾己
          </h1>

          <div
            className="mt-6 flex animate-rise-in items-center gap-3"
            style={{ animationDelay: '130ms' }}
          >
            <span className="h-px w-8 bg-sand-300" />
            <span className="text-[10px] tracking-[0.5em] text-ink-500">
              LIFE
            </span>
            <span className="h-px w-8 bg-sand-300" />
          </div>

          <p
            className="mt-8 animate-rise-in font-display text-lg tracking-[0.06em] text-ink-700"
            style={{ animationDelay: '190ms' }}
          >
            先生活，再认识自己。
          </p>
        </div>

        {/* 右：引言与入口 */}
        <div className="mt-12 flex w-full max-w-[340px] flex-col lg:mt-0 lg:max-w-[360px]">
          <div
            className="animate-rise-in border-l border-sand-300 pl-5"
            style={{ animationDelay: '250ms' }}
          >
            <p className="font-display text-[15px] leading-8 text-ink-700 lg:text-base">
              在这座还没建完的城市里，选择没有标准答案。
            </p>
            <p className="mt-3 text-[13px] leading-7 text-ink-500">
              你经历的每件小事，都会在某个时刻被温柔地回望。
            </p>
          </div>

          <div
            className="mt-10 flex w-full animate-rise-in flex-col gap-3"
            style={{ animationDelay: '310ms' }}
          >
            <Link to="/prologue" className={`${buttonStyles('primary', 'lg')} w-full`}>
              开始新的旅程
            </Link>

            {canContinue ? (
              <Link to="/city" className={`${buttonStyles('secondary', 'lg')} w-full`}>
                继续旅程
              </Link>
            ) : (
              <Button variant="secondary" size="lg" className="w-full" disabled>
                继续旅程
              </Button>
            )}

            {!hasSave && !saveBroken && (
              <p className="text-center text-[11px] text-ink-500">还没有存档</p>
            )}

            {saveBroken ? (
              <p
                role="status"
                className="mx-auto max-w-[300px] text-center text-[11px] leading-5 text-ink-700"
              >
                上一份存档读不出来，可能需要重新开始。
              </p>
            ) : null}

            <p className="text-center text-[11px] leading-5 text-ink-500 lg:text-left">
              你随时可以拒绝回顾、删除经历，或关闭分析。
            </p>
          </div>
        </div>
      </div>

      {/* 版权页式页脚 */}
      <footer className="relative z-10 flex flex-col items-center gap-1.5 border-t border-sand-300/60 px-6 py-5 text-[10px] leading-5 tracking-[0.15em] text-ink-500 sm:flex-row sm:justify-between lg:px-12">
        <span>拾己 · LIFE</span>
        <span>第一章 · 未完成之城</span>
        <span className="text-center sm:text-right">
          不是心理测评，也不会给你贴标签
        </span>
      </footer>
    </main>
  )
}
