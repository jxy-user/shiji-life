import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import ClickSpark, { type ClickSparkHandle } from '@/components/effects/ClickSpark'
import { DoorScene } from '@/components/start/DoorScene'
import { LIFE_NODES } from '@/data/lifeStory'
import { useLifeStore } from '@/stores/useLifeStore'

type Phase = 'approach' | 'arrived' | 'opening' | 'curtain'

const APPROACH_MS = 2600
const OPEN_MS = 1500
const CURTAIN_LINE_MS = 2600

const CURTAIN_LINES = [
  '先生活，再认识自己。',
  '在这座还没建完的城市里，选择没有标准答案。',
  '你经历的每件小事，都会在某个时刻被温柔地回望。',
]

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
  const lifeSave = useLifeStore((state) => state.save)
  const navigate = useNavigate()

  const [reduced] = useState(prefersReducedMotion)
  const [phase, setPhase] = useState<Phase>(() => (reduced ? 'arrived' : 'approach'))
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const doorRef = useRef<HTMLButtonElement>(null)
  const sparkRef = useRef<ClickSparkHandle>(null)

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

  // 门开完，换到白幕与文字
  useEffect(() => {
    if (phase !== 'opening') return
    const timer = window.setTimeout(() => setPhase('curtain'), reduced ? 0 : OPEN_MS)
    return () => window.clearTimeout(timer)
  }, [phase, reduced])

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

  function finish() {
    navigate(target, { state: { fromCurtain: true } })
  }

  // 白幕字幕：一句淡入、停留、淡出，再换下一句；最后一句淡出后进入游戏
  useEffect(() => {
    if (phase !== 'curtain') return
    const timer = window.setTimeout(() => {
      if (sentenceIndex < CURTAIN_LINES.length - 1) {
        setSentenceIndex((index) => index + 1)
      } else {
        navigate(target, { state: { fromCurtain: true } })
      }
    }, CURTAIN_LINE_MS)
    return () => window.clearTimeout(timer)
  }, [phase, sentenceIndex, target, navigate])

  function openDoor(clickEvent?: ReactMouseEvent<HTMLElement>) {
    if (phase !== 'arrived') return
    const point =
      clickEvent && (clickEvent.clientX || clickEvent.clientY)
        ? { x: clickEvent.clientX, y: clickEvent.clientY }
        : { x: window.innerWidth / 2, y: window.innerHeight * 0.62 }
    sparkRef.current?.spark(point.x, point.y)
    setPhase('opening')
  }

  return (
    <main
      className="relative isolate min-h-dvh select-none overflow-hidden bg-[#05070f] text-ink-900"
      onClick={arrived ? openDoor : undefined}
    >
      {/* 镜头：由远及近，推门时继续向前压近 */}
      <div
        aria-hidden
        data-door-stage
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

      {/* 推门时的金色火花；只由 openDoor 手动触发，不拦截页面点击 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20">
        <ClickSpark
          ref={sparkRef}
          sparkColor={['#e3b878', '#ffdca8', '#c9a25a']}
          sparkCount={10}
          sparkSize={10}
          sparkRadius={46}
          sparkWidth={1.5}
          duration={620}
          shape="line"
          glow={0.6}
        />
      </div>

      {/* 走入门内时，门缝的暖光逐渐涨满画面 */}
      <div
        aria-hidden
        data-door-bloom
        className={[
          'pointer-events-none absolute inset-0 z-[25] origin-[50%_56%]',
          opening ? 'door-bloom' : 'opacity-0',
        ].join(' ')}
        style={{
          background:
            'radial-gradient(circle at 50% 56%, rgba(255,244,214,0.95) 0%, rgba(255,205,135,0.55) 28%, rgba(255,170,80,0) 60%)',
        }}
      />

      <header
        className={[
          'absolute inset-x-0 top-0 z-20 flex items-start justify-between px-6 py-6 transition-opacity duration-300 lg:px-12',
          opening ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
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
      <div
        className={[
          'pointer-events-none absolute inset-x-0 top-[7vh] z-10 flex flex-col items-center text-center transition-opacity duration-300',
          opening ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <h1
          className={[
            'font-roman pl-[0.12em] text-[64px] font-normal leading-none tracking-[0.12em] text-gold-400/90 transition-all duration-1000 ease-out lg:text-[88px]',
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
          <span className="h-px w-10 bg-gold-500/50" />
          <span className="font-roman pl-[0.6em] text-[12px] tracking-[0.6em] text-gold-400/90">
            LIFE
          </span>
          <span className="h-px w-10 bg-gold-500/50" />
        </div>
      </div>

      {/* 门扉提示 */}
      <div
        className={[
          'absolute inset-x-0 bottom-[12vh] z-10 flex flex-col items-center gap-3 transition-opacity duration-300',
          opening ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <button
          ref={doorRef}
          type="button"
          onClick={(clickEvent) => {
            clickEvent.stopPropagation()
            openDoor(clickEvent)
          }}
          disabled={!arrived}
          aria-label="轻触门扉，推门进入"
          className={[
            'door-invite rounded-full border px-7 py-2.5 text-[12px] tracking-[0.35em] transition-all duration-700',
            arrived
              ? 'border-ink-900/30 bg-[#0b1026]/45 text-ink-900 opacity-100 backdrop-blur-sm hover:border-ink-900/70 hover:bg-[#0b1026]/65'
              : 'pointer-events-none border-transparent text-transparent opacity-0',
          ].join(' ')}
        >
          <span className="inline-block pl-[0.35em]">轻触门扉</span>
        </button>
        <p
          className={[
            'pl-[0.3em] text-[10px] tracking-[0.3em] text-ink-500 transition-opacity delay-500 duration-1000',
            arrived ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          推门，回到那一段还没走完的人生
        </p>
      </div>

      <footer
        className={[
          'absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-1.5 px-6 py-5 text-[10px] leading-5 tracking-[0.15em] text-ink-500/80 transition-opacity duration-300 sm:flex-row sm:justify-between lg:px-12',
          opening ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
      >
        <span>拾己 · LIFE</span>
        <span className="text-center sm:text-right">不是心理测评，也不会给你贴标签</span>
      </footer>

      {/* 走进门内后，暖光继续涨满，最后融进白幕 */}
      <div
        aria-hidden
        data-door-fade
        className={[
          'pointer-events-none absolute inset-0 z-30 bg-white transition-opacity',
          opening || phase === 'curtain'
            ? 'opacity-100 delay-700 duration-700 ease-in'
            : 'opacity-0 delay-0 duration-150',
        ].join(' ')}
      />

      {/* 白幕字幕：只保留一句居中的字幕，播完淡出后换下一句 */}
      {phase === 'curtain' ? (
        <div
          data-door-curtain
          onClick={finish}
          className="absolute inset-0 z-40 cursor-default bg-white"
        >
          <button
            type="button"
            onClick={(clickEvent) => {
              clickEvent.stopPropagation()
              finish()
            }}
            className="sr-only"
          >
            跳过字幕，进入游戏
          </button>

          <div className="absolute inset-0 flex items-center justify-center px-10">
            <p
              key={sentenceIndex}
              className="curtain-line mx-auto max-w-2xl text-center font-display text-[24px] leading-relaxed tracking-[0.04em] text-[#2b2620] sm:text-[27px]"
            >
              {CURTAIN_LINES[sentenceIndex]}
            </p>
          </div>

          <p className="sr-only" aria-live="polite">
            {CURTAIN_LINES[sentenceIndex]}
          </p>
        </div>
      ) : null}
    </main>
  )
}
