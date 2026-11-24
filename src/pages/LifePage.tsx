import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { AuroraBand } from '@/components/effects/AuroraBand'
import { CinemaFrame } from '@/components/effects/CinemaFrame'
import ClickSpark, { type ClickSparkHandle } from '@/components/effects/ClickSpark'
import { LifeGlyph } from '@/components/life/LifeGlyph'
import { LifeTimeline } from '@/components/life/LifeTimeline'
import { Typewriter } from '@/components/life/Typewriter'
import { sfx, unlockAudio } from '@/services/sound'
import { LIFE_NODES, type LifeChoice, type LifeNode } from '@/data/lifeStory'
import { useLifeStore, type LifeChoiceRecord } from '@/stores/useLifeStore'

/**
 * 人生线：18 → 60 岁
 *
 * 节点以「动画播放」呈现：场景 → 问题 → 选项依次浮现，
 * 选择后结果也分段播放，再出现「继续」。
 * 动画期间选项不可点，避免误触；可随时跳过动画。
 */
export default function LifePage() {
  const navigate = useNavigate()
  const save = useLifeStore((state) => state.save)
  const start = useLifeStore((state) => state.start)
  const choose = useLifeStore((state) => state.choose)
  const clearPending = useLifeStore((state) => state.clearPending)
  const reset = useLifeStore((state) => state.reset)

  const sparkRef = useRef<ClickSparkHandle>(null)
  const pickTimer = useRef<number | null>(null)
  const [picking, setPicking] = useState<string | null>(null)
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
  )

  const pending = save?.pendingChoice ?? null
  const node = save ? LIFE_NODES[save.currentIndex] ?? null : null
  const stageKey = pending ? `result:${pending.nodeId}` : node?.id ?? 'none'

  useEffect(() => {
    if (pickTimer.current !== null) window.clearTimeout(pickTimer.current)
  }, [])

  if (!save) {
    return (
      <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-cream-50 text-ink-900">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,var(--color-gold-200)_0%,transparent_60%)] opacity-40"
        />
        <AuroraBand />

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
            onClick={() => {
              // 首次点击同时解锁音频
              unlockAudio()
              sfx.thud()
              start()
            }}
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
  if (!pending && save.finishedAt) {
    return <Navigate to="/life/replay" replace />
  }

  const progress = Math.min(save.choices.length, LIFE_NODES.length)
  const currentAge = pending?.age ?? node?.age ?? LIFE_NODES[0].age

  function handleChoose(choice: LifeChoice, event: ReactMouseEvent<HTMLButtonElement>) {
    if (picking) return
    unlockAudio()
    setPicking(choice.id)
    sfx.select()
    sparkRef.current?.spark(event.clientX, event.clientY)

    // 先让选项高亮一小段时间，再写入结果，避免页面瞬间跳走
    pickTimer.current = window.setTimeout(
      () => {
        choose(choice.id)
        setPicking(null)
      },
      reduced ? 0 : 320,
    )
  }

  function handleContinue() {
    sfx.whoosh()
    clearPending()
    if (useLifeStore.getState().save?.finishedAt) navigate('/life/replay')
  }

  function handleRestart() {
    if (!window.confirm('重新开始会清空这一段人生的选择，确定吗？')) return
    reset()
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-cream-50 text-ink-900">
      <CinemaFrame />
      <div
        aria-hidden
        className="absolute inset-0 animate-[kenburns_26s_ease-in-out_infinite_alternate] bg-[radial-gradient(ellipse_at_50%_-12%,var(--color-gold-200)_0%,transparent_58%)] opacity-30"
      />
      <AuroraBand />

      {/* 选项点击的金色火花 */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-30">
        <ClickSpark
          ref={sparkRef}
          sparkColor={['#e3b878', '#ffdca8', '#c9a25a']}
          sparkCount={12}
          sparkSize={9}
          sparkRadius={44}
          sparkWidth={1.4}
          duration={560}
          shape="line"
          glow={0.6}
        />
      </div>

      {/* 选中瞬间的暖光一闪 */}
      {picking ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[17] animate-[flash_320ms_ease-out_both] bg-gold-200/15"
        />
      ) : null}

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-6 pb-[8vh] pt-[8vh] lg:max-w-3xl">
        <header className="flex items-center justify-between text-[11px] tracking-[0.2em] text-ink-500">
          <Link to="/" className="transition-colors hover:text-ink-900">
            ← 首页
          </Link>
          <span>
            人生线 · {progress} / {LIFE_NODES.length}
          </span>
        </header>

        <div className="mt-6">
          <LifeTimeline currentAge={currentAge} />
        </div>

        <div className="mt-10 flex-1">
          <LifeStage
            key={stageKey}
            node={node}
            pending={pending}
            nodeIndex={save.currentIndex}
            reduced={reduced}
            picking={picking}
            finished={Boolean(save.finishedAt)}
            onChoose={handleChoose}
            onContinue={handleContinue}
          />
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

type LifeStageProps = {
  node: LifeNode | null
  pending: LifeChoiceRecord | null
  nodeIndex: number
  reduced: boolean
  picking: string | null
  finished: boolean
  onChoose: (choice: LifeChoice, event: ReactMouseEvent<HTMLButtonElement>) => void
  onContinue: () => void
}

/**
 * 单个节点/结果的分段动画。
 * 父组件用 key 强制重新挂载，因此初始阶段就是从头播放。
 */
function LifeStage({
  node,
  pending,
  nodeIndex,
  reduced,
  picking,
  finished,
  onChoose,
  onContinue,
}: LifeStageProps) {
  // 节点页：0 场景 → 1 问题 → 2 选项；结果页：0 选择 → 1 结果 → 2 继续
  const [stage, setStage] = useState(() => (reduced ? 2 : 0))
  const [resultStage, setResultStage] = useState(() => (reduced ? 2 : 0))

  // 进入新节点时先播放一张「年龄标题卡」
  const [showTitle, setShowTitle] = useState(
    () => !reduced && Boolean(node) && !pending,
  )

  useEffect(() => {
    if (!showTitle) return
    sfx.thud()
    const timer = window.setTimeout(() => setShowTitle(false), 1400)
    return () => window.clearTimeout(timer)
  }, [showTitle])

  useEffect(() => {
    if (reduced) return
    const timers: number[] = []

    if (pending) {
      timers.push(
        window.setTimeout(() => {
          setResultStage(1)
          sfx.chime()
        }, 420),
      )
      timers.push(window.setTimeout(() => setResultStage(2), 1250))
    } else if (node) {
      timers.push(window.setTimeout(() => setStage(1), 420))
      timers.push(
        window.setTimeout(() => {
          setStage(2)
          sfx.tick()
        }, 1250),
      )
    }

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [reduced, pending, node])

  const running = !reduced && (pending ? resultStage < 2 : stage < 2)

  function skipAnimation() {
    setStage(2)
    setResultStage(2)
  }

  return (
    <div className="relative">
      {/* 标题卡：全屏黑场上的年龄与节点名 */}
      {showTitle && node ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-20 flex animate-[title-card_1400ms_ease_both] flex-col items-center justify-center bg-[#050505]"
        >
          <span className="h-px w-14 origin-center animate-[title-line_1400ms_ease_both] bg-gold-500/70" />
          <p className="mt-7 animate-[title-zoom_1400ms_ease_both] font-display text-8xl tabular-nums text-gold-500">
            {node.age}
          </p>
          <p className="mt-5 text-[11px] tracking-[0.6em] text-ink-400">
            {node.title}
          </p>
          <p className="mt-12 text-[10px] tracking-[0.4em] text-ink-500/70">
            第 {nodeIndex + 1} 幕 · 共 {LIFE_NODES.length} 幕
          </p>
        </div>
      ) : null}

      {running ? (
        <button
          type="button"
          onClick={skipAnimation}
          className="absolute -top-7 right-0 text-[11px] tracking-[0.12em] text-ink-500 transition-colors hover:text-ink-900"
        >
          跳过动画
        </button>
      ) : null}

      {pending ? (
        <section className="animate-[cine-in_700ms_ease_both]" aria-live="polite">
          {/* 结果出现前的一小段黑场，像镜头切换 */}
          {!reduced && resultStage < 1 ? (
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 z-20 animate-[blackout_420ms_ease_both] bg-[#050505]"
            />
          ) : null}

          <div className="flex items-start justify-between gap-8">
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.35em] text-gold-500">
                {pending.age} 岁 · {pending.title}
              </p>
              <p className="mt-4 text-[12px] text-ink-500">你选择了</p>
              <h2 className="mt-1 font-display text-xl text-ink-900">{pending.label}</h2>

              <p
                className={[
                  'mt-6 font-display text-[16px] leading-8 text-ink-700 transition-all duration-500',
                  resultStage >= 1
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0',
                ].join(' ')}
              >
                {resultStage >= 1 ? (
                  <Typewriter
                    key={pending.nodeId}
                    text={pending.result}
                    speed={26}
                    instant={reduced}
                  />
                ) : (
                  <span className="invisible">{pending.result}</span>
                )}
              </p>
            </div>

            <LifeGlyph
              nodeId={pending.nodeId}
              size={104}
              className="hidden shrink-0 text-gold-500/50 sm:block"
            />
          </div>

          <button
            type="button"
            onClick={onContinue}
            className={[
              'mt-10 rounded-md bg-gold-500 px-6 py-3 text-[15px] font-semibold text-cream-50 transition-all duration-500 hover:bg-gold-400',
              resultStage >= 2
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-2 opacity-0',
            ].join(' ')}
          >
            {finished ? '看看这一生' : '继续'}
          </button>
        </section>
      ) : node ? (
        <section className="animate-[cine-in_700ms_ease_both]">
          <div className="flex items-start justify-between gap-8">
            <div className="min-w-0">
              <p className="text-[11px] tracking-[0.35em] text-gold-500">
                {node.age} 岁 · {node.title}
              </p>
              <p className="mt-4 font-display text-[15px] leading-8 text-ink-500">
                <Typewriter key={node.id} text={node.scene} speed={34} instant={reduced} />
              </p>
              <h2
                className={[
                  'mt-6 font-display text-2xl leading-9 text-ink-900 transition-all duration-500',
                  stage >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
                ].join(' ')}
              >
                {stage >= 1 ? (
                  <Typewriter
                    key={node.id}
                    text={node.prompt}
                    speed={30}
                    instant={reduced}
                  />
                ) : (
                  <span className="invisible">{node.prompt}</span>
                )}
              </h2>
            </div>

            <LifeGlyph
              nodeId={node.id}
              size={128}
              className="hidden shrink-0 text-gold-500/70 sm:block"
            />
          </div>

          <div
            className={[
              'mt-8 space-y-3 transition-opacity duration-500',
              stage >= 2 ? 'opacity-100' : 'pointer-events-none opacity-0',
            ].join(' ')}
            aria-hidden={stage < 2}
          >
            {node.choices.map((choice, index) => {
              const active = picking === choice.id
              const dimmed = picking !== null && !active
              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={picking !== null}
                  onClick={(event) => onChoose(choice, event)}
                  style={{ transitionDelay: stage >= 2 ? `${index * 80}ms` : '0ms' }}
                  className={[
                    'group flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-all duration-300',
                    active
                      ? 'scale-[1.01] border-gold-400 bg-gold-500/15'
                      : 'border-sand-300 bg-cream-100/70 hover:border-gold-400 hover:bg-gold-500/10',
                    dimmed ? 'opacity-30' : 'opacity-100',
                  ].join(' ')}
                >
                  <span className="text-[15px] text-ink-900">{choice.label}</span>
                  <span
                    aria-hidden
                    className={[
                      'text-gold-400 transition-transform duration-300',
                      active ? 'translate-x-1' : 'group-hover:translate-x-1',
                    ].join(' ')}
                  >
                    →
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      ) : null}
    </div>
  )
}
