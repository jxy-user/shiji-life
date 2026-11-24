import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { buttonStyles } from '@/components/ui/buttonStyles'
import { hasPlayableSave } from '@/services/savePeek'
import { useLifeStore } from '@/stores/useLifeStore'

export default function StartPage() {
  // 直接读存储层，不引入游戏 store：完整校验（zod）留在后续页面的代码块里，
  // 首屏只需要知道「有没有可继续的存档」——损坏的存档不能给出继续入口
  const [hasSave] = useState(() => hasPlayableSave())
  const lifeSave = useLifeStore((state) => state.save)
  const location = useLocation()
  const saveBroken = Boolean(
    (location.state as { saveBroken?: boolean } | null)?.saveBroken,
  )
  // 存档已知读不出来时不再给继续入口，避免「点了又弹回」的死循环
  const canContinue = hasSave && !saveBroken

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-cream-50 text-ink-900">
      {/* 霓虹海滨：网格地面、扫描线、粉/青光晕 */}
      <div aria-hidden className="neon-grid absolute inset-0 opacity-60" />
      <div aria-hidden className="scanlines absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="absolute -top-44 left-1/2 h-[440px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,79,163,0.30),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 right-0 h-[340px] w-[460px] rounded-full bg-[radial-gradient(ellipse,rgba(62,230,196,0.20),transparent_70%)] blur-2xl"
      />
      <div aria-hidden className="paper-grain absolute inset-0 opacity-40" />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 lg:max-w-4xl lg:flex-row lg:items-center lg:gap-24 lg:px-12">
        {/* 左：霓虹刊头 */}
        <div className="flex flex-col items-center">
          <div aria-hidden className="relative mb-8 h-16 w-16">
            <div className="lumi-glow absolute inset-0 animate-soft-pulse rounded-full" />
          </div>

          <p className="animate-rise-in text-[10px] tracking-[0.55em] text-sage-500">
            未完成之城
          </p>

          <h1
            className="neon-text mt-5 animate-rise-in font-display text-[84px] font-black italic leading-none tracking-[0.03em] text-ink-900 sm:text-[96px] lg:text-[120px]"
            style={{ animationDelay: '70ms' }}
          >
            拾己
          </h1>

          <div
            className="mt-5 flex animate-rise-in items-center gap-3"
            style={{ animationDelay: '130ms' }}
          >
            <span className="h-px w-10 bg-gold-500/70" />
            <span className="text-[11px] tracking-[0.55em] text-gold-400">
              LIFE
            </span>
            <span className="h-px w-10 bg-gold-500/70" />
          </div>

          <p
            className="mt-8 animate-rise-in font-display text-lg font-bold tracking-[0.04em] text-ink-700"
            style={{ animationDelay: '190ms' }}
          >
            先生活，再认识自己。
          </p>
        </div>

        {/* 右：引言与入口 */}
        <div className="mt-12 flex w-full max-w-[340px] flex-col lg:mt-0 lg:max-w-[360px]">
          <div
            className="animate-rise-in border-l-2 border-gold-500/70 pl-5"
            style={{ animationDelay: '250ms' }}
          >
            <p className="font-display text-[15px] font-bold leading-8 text-ink-700 lg:text-base">
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
            <Link
              to={lifeSave?.finishedAt ? '/life/replay' : '/life'}
              className={`${buttonStyles('primary', 'lg')} w-full`}
            >
              {lifeSave?.finishedAt
                ? '查看上次的回放'
                : lifeSave
                  ? '继续上次的人生'
                  : '开始人生 · 18 → 60'}
            </Link>

            {!lifeSave ? (
              <Button variant="secondary" size="lg" className="w-full" disabled>
                继续上次的人生
              </Button>
            ) : null}

            <p className="text-center text-[11px] leading-5 text-ink-500 lg:text-left">
              每选一项，就往前走一段。没有标准答案，也不会有人给你打分。
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-ink-500 lg:justify-start">
              <Link
                to={canContinue ? '/city' : '/prologue'}
                className="underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
              >
                进入未完成之城（旧版）
              </Link>
              {saveBroken ? (
                <span role="status" className="text-ink-700">
                  上一份存档读不出来
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="relative z-10 flex flex-col items-center gap-1.5 border-t border-sand-300 px-6 py-5 text-[10px] leading-5 tracking-[0.15em] text-ink-500 sm:flex-row sm:justify-between lg:px-12">
        <span>拾己 · LIFE</span>
        <span className="text-sage-500/80">NEON COAST · 第一章</span>
        <span className="text-center sm:text-right">
          不是心理测评，也不会给你贴标签
        </span>
      </footer>
    </main>
  )
}
