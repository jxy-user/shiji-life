import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { DoorScene } from '@/components/start/DoorScene'
import { LIFE_NODES } from '@/data/lifeStory'
import { hasPlayableSave } from '@/services/savePeek'
import { useLifeStore } from '@/stores/useLifeStore'

type Phase = 'approach' | 'arrived' | 'opening'

const APPROACH_MS = 2600
const OPEN_MS = 700

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  )
}

/**
 * 门厅首屏
 *
 * 打开页面时镜头由远及近走向旧城门，抵达后标题与「轻触门扉」渐显；
 * 推门即进入当前的人生线（已走完则进入回放）。不再提供开始/继续的选择。
 * 旧版城市保留为页脚的小入口。
 */
export default function StartPage() {
  const [hasSave] = useState(() => hasPlayableSave())
  const lifeSave = useLifeStore((state) => state.save)
  const location = useLocation()
  const navigate = useNavigate()
  const saveBroken = Boolean(
    (location.state as { saveBroken?: boolean } | null)?.saveBroken,
  )
  const canContinue = hasSave && !saveBroken

  const [reduced] = useState(prefersReducedMotion)
  const [phase, setPhase] = useState<Phase>(() => (reduced ? 'arrived' : 'approach'))
  const doorRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (phase !== 'approach') return
    const timer = window.setTimeout(() => setPhase('arrived'), APPROACH_MS)
    return () => window.clearTimeout(timer)
  }, [phase])

  // 抵达后把焦点交给唯一的操作，键盘用户不需要再找入口
  useEffect(() => {
    if (phase !== 'arrived') return
    doorRef.current?.focus({ preventScroll: true })
  }, [phase])

  const target = lifeSave?.finishedAt ? '/life/replay' : '/life'
  const age = lifeSave
    ? LIFE_NODES[Math.min(lifeSave.currentIndex, LIFE_NODES.length - 1)]?.age
    : null
  const kicker = lifeSave?.finishedAt
    ? '这一生 · 未完成之城'
    : age
      ? `${age} 岁 · 未完成之城`
      : '未完成之城'

  const arrived = phase === 'arrived'
  const opening = phase === 'opening'

  function openDoor() {
    if (phase !== 'arrived') return
    setPhase('opening')
    window.setTimeout(() => navigate(target), reduced ? 0 : OPEN_MS)
  }

  return (
    <main
      className="relative isolate min-h-dvh select-none overflow-hidden bg-[#05070f] text-ink-900"
      onClick={arrived ? openDoor : undefined}
    >
      {/* 镜头：由远及近，推门时继续向前压近 */}
      <div
        aria-hidden
        className={[
          'absolute inset-0 origin-[50%_58%] will-change-transform',
          reduced ? '' : opening ? 'door-opening' : 'door-approach',
        ].join(' ')}
      >
        <DoorScene />
      </div>

      {/* 暗角与顶部/底部渐变，保证文字始终可读 */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_58%,transparent_18%,rgba(5,7,15,0.28)_62%,rgba(5,7,15,0.82)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[38vh] bg-gradient-to-b from-[#05070f]/85 via-[#05070f]/25 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[30vh] bg-gradient-to-t from-[#05070f]/90 via-[#05070f]/30 to-transparent"
      />
      <div aria-hidden className="paper-grain absolute inset-0 opacity-30" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-6 lg:px-12">
        <p
          className={[
            'text-[11px] tracking-[0.4em] text-ink-500 transition-opacity duration-1000',
            arrived ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          {kicker}
        </p>
        {phase === 'approach' ? (
          <button
            type="button"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation()
              setPhase('arrived')
            }}
            className="rounded-full border border-ink-900/25 px-4 py-1.5 text-[11px] tracking-[0.2em] text-ink-500 transition-colors hover:border-ink-900/60 hover:text-ink-900"
          >
            跳过
          </button>
        ) : null}
      </header>

      {/* 标题：抵达门前才渐显 */}
      <div className="pointer-events-none absolute inset-x-0 top-[7vh] z-10 flex flex-col items-center text-center">
        <h1
          className={[
            'font-display text-[64px] font-black italic leading-none tracking-[0.04em] text-ink-900 drop-shadow-[0_0_28px_rgba(255,199,120,0.30)] transition-all duration-1000 ease-out lg:text-[88px]',
            arrived ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
          ].join(' ')}
        >
          拾己
        </h1>
        <div
          className={[
            'mt-4 flex items-center gap-3 transition-opacity delay-300 duration-1000',
            arrived ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          <span className="h-px w-10 bg-ink-900/40" />
          <span className="text-[11px] tracking-[0.55em] text-ink-500">LIFE</span>
          <span className="h-px w-10 bg-ink-900/40" />
        </div>
      </div>

      {/* 门扉提示 */}
      <div className="absolute inset-x-0 bottom-[12vh] z-10 flex flex-col items-center gap-3">
        <button
          ref={doorRef}
          type="button"
          onClick={openDoor}
          disabled={!arrived}
          aria-label="轻触门扉，推门进入"
          className={[
            'door-invite rounded-full border px-7 py-2.5 text-[12px] tracking-[0.35em] transition-all duration-700',
            arrived
              ? 'border-ink-900/30 bg-[#0b1026]/45 text-ink-900 opacity-100 backdrop-blur-sm hover:border-ink-900/70 hover:bg-[#0b1026]/65'
              : 'pointer-events-none border-transparent text-transparent opacity-0',
          ].join(' ')}
        >
          轻触门扉
        </button>
        <p
          className={[
            'text-[10px] tracking-[0.3em] text-ink-500 transition-opacity delay-500 duration-1000',
            arrived ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          推门，回到那一段还没走完的人生
        </p>
      </div>

      <footer className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1.5 px-6 py-5 text-[10px] leading-5 tracking-[0.15em] text-ink-500/80 sm:flex-row sm:justify-between lg:px-12">
        <span>拾己 · LIFE</span>
        <span className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            to={canContinue ? '/city' : '/prologue'}
            onClick={(clickEvent) => clickEvent.stopPropagation()}
            className="underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
          >
            进入未完成之城（旧版）
          </Link>
          {saveBroken ? (
            <span role="status" className="text-ink-700">
              上一份存档读不出来
            </span>
          ) : null}
        </span>
        <span className="text-center sm:text-right">不是心理测评，也不会给你贴标签</span>
      </footer>

      {/* 推门后的淡出 */}
      <div
        aria-hidden
        className={[
          'pointer-events-none absolute inset-0 z-30 bg-[#05070f] transition-opacity',
          opening ? 'opacity-100 duration-700 ease-in' : 'opacity-0 duration-150',
        ].join(' ')}
      />
    </main>
  )
}
