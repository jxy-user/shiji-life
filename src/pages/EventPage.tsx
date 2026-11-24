import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { StatusBar } from '@/components/layout/StatusBar'
import { SceneBackdrop } from '@/components/scene/SceneBackdrop'
import { findEvent } from '@/data/events'
import { SCENES } from '@/data/scenes'
import type { EventChoice } from '@/game/eventSchema'
import { useGameStore } from '@/stores/useGameStore'

type Outcome = { choice: EventChoice; experienceId: string | null }

/** 结果区在页面顶部，选择后回到顶部；不用 smooth，避免和读屏焦点争夺 */
function scrollToTop() {
  document.documentElement.scrollTop = 0
}

/**
 * 事件页：叙事 → 选择 → 结果
 *
 * 选择的结果由事件数据里写死的 result 文案决定；
 * 效果、已读标记与经历记录通过 completeEvent 一次写盘，
 * 中途失败不会留下「事件已读但没有经历」的半完成存档。
 */
export default function EventPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const save = useGameStore((state) => state.save)
  const completeEvent = useGameStore((state) => state.completeEvent)
  const setExperienceConsent = useGameStore((state) => state.setExperienceConsent)
  const setExperienceReason = useGameStore((state) => state.setExperienceReason)

  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [reasonDraft, setReasonDraft] = useState('')

  const event = findEvent(eventId)

  if (!save) return <Navigate to="/" replace />
  if (!event) return <Navigate to="/city" replace />

  const alreadySeen = save.seenEventIds.includes(event.id) && outcome === null
  const experience = outcome?.experienceId
    ? save.experiences.find((item) => item.id === outcome.experienceId)
    : undefined

  function choose(choice: EventChoice) {
    if (!save || !event || outcome) return

    // 幂等由 store 保证：已完成的事件不会再次应用效果
    const result = completeEvent({
      eventId: event.id,
      eventTitle: event.title,
      sceneId: event.sceneId,
      experienceType: event.experienceType,
      choiceId: choice.id,
      choiceText: choice.text,
      choiceTags: choice.tags,
      outcome: choice.result,
      effects: choice.effects,
      markExplored: event.sceneId !== 'plaza',
    })

    // 双击时第二次幂等调用也能拿到同一条经历，不覆盖已渲染的结果
    setOutcome((previous) => previous ?? { choice, experienceId: result.experienceId })
    scrollToTop()
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-cream-50">
      <SceneBackdrop scene={event.sceneId} />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <StatusBar save={save} title={SCENES[event.sceneId].name} />

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10 lg:max-w-3xl">
          <section className="rounded-2xl border border-sand-300 bg-cream-50/95 p-6 shadow-[0_18px_40px_-32px_rgba(43,38,33,0.32)] backdrop-blur-md sm:p-8">
            <p className="text-[11px] tracking-[0.4em] text-gold-600">
              {SCENES[event.sceneId].name}
            </p>
            <h1 className="mt-3 font-display text-2xl tracking-[0.04em] text-ink-900">
              {event.title}
            </h1>

            {alreadySeen ? (
              <div className="mt-6">
                <p className="font-display text-[15px] leading-7 text-ink-700">
                  这件事已经过去了。
                </p>
                <Link
                  to="/city"
                  className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-2.5 text-[13px] text-cream-50 transition-colors hover:bg-ink-700"
                >
                  回到城市
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-4 space-y-2">
                  {event.narrative.map((line) => (
                    <p
                      key={line}
                      className="font-display text-[15px] leading-8 text-ink-700"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/*
                  直播区域常驻：先有容器、后填内容，读屏软件才会播报首次结果。
                  若容器与内容一起挂载，多数读屏软件不会朗读。
                */}
                <div aria-live="polite" aria-atomic="true">
                  {outcome ? (
                    <div className="mt-6">
                      <div className="rounded-2xl border border-gold-300/60 bg-cream-100/70 px-4 py-4">
                        <p className="text-[11px] tracking-[0.3em] text-gold-600">
                          选择之后
                        </p>
                        <div className="mt-2 space-y-1.5">
                          {outcome.choice.result.map((line) => (
                            <p
                              key={line}
                              className="font-display text-[15px] leading-8 text-ink-900"
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>

                      {experience ? (
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-300 bg-cream-50 px-4 py-3">
                          <div>
                            <p className="text-[12px] text-ink-700">
                              已记入「{SCENES[event.sceneId].name}」的经历
                            </p>
                            <p className="mt-0.5 text-[11px] text-ink-500">
                              授权只影响「之后是否用于回顾」，不影响已经发生的记录
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={experience.analysisConsent}
                            onClick={() =>
                              setExperienceConsent(
                                experience.id,
                                !experience.analysisConsent,
                              )
                            }
                            className={[
                              'rounded-full border px-4 py-2 text-[12px] transition-colors',
                              experience.analysisConsent
                                ? 'border-sage-500/60 bg-sage-300/30 text-sage-700'
                                : 'border-sand-300 bg-cream-100 text-ink-500',
                            ].join(' ')}
                          >
                            {experience.analysisConsent ? '可用于回顾' : '不用于回顾'}
                          </button>
                        </div>
                      ) : null}

                      {experience && event.memory.askReason ? (
                        <div className="mt-4 rounded-2xl border border-sand-300 bg-cream-50 px-4 py-4">
                          <label htmlFor="reason" className="text-[12px] text-ink-700">
                            当时是怎么想的？
                            <span className="ml-2 text-[11px] text-ink-500">可以不写</span>
                          </label>
                          <textarea
                            id="reason"
                            value={reasonDraft}
                            onChange={(inputEvent) =>
                              setReasonDraft(inputEvent.target.value)
                            }
                            maxLength={200}
                            rows={2}
                            placeholder="写给自己看，也可以直接跳过。"
                            className="mt-2 w-full resize-none rounded-xl border border-sand-300 bg-cream-100/50 px-3 py-2 font-display text-[14px] leading-6 text-ink-900 outline-none transition-colors focus:border-gold-400"
                          />
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] text-ink-500">
                              {experience.playerReason
                                ? '已保存你写下的内容'
                                : '只保存你主动写下的内容，空白不记录'}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setExperienceReason(experience.id, reasonDraft)
                              }
                              disabled={!reasonDraft.trim() && !experience.playerReason}
                              className="rounded-full border border-sand-300 px-4 py-1.5 text-[12px] text-ink-700 transition-colors hover:border-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              保存
                            </button>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          to="/city"
                          className="rounded-full bg-ink-900 px-5 py-2.5 text-[13px] text-cream-50 transition-colors hover:bg-ink-700"
                        >
                          回到城市
                        </Link>
                        <Link
                          to="/archive"
                          className="rounded-full border border-sand-300 px-5 py-2.5 text-[13px] text-ink-700 transition-colors hover:border-gold-400"
                        >
                          去人生档案看看
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>

                {!outcome ? (
                  <div className="mt-6 space-y-2.5">
                    {event.choices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => choose(choice)}
                        className="group flex w-full items-center justify-between gap-4 rounded-2xl border border-sand-300 bg-cream-50 px-4 py-3.5 text-left transition-colors hover:border-gold-400 hover:bg-cream-100/70"
                      >
                        <span className="font-display text-[15px] text-ink-900">
                          {choice.text}
                        </span>
                        <span
                          aria-hidden
                          className="text-ink-500 transition-transform group-hover:translate-x-0.5"
                        >
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </>
            )}
          </section>

          <p className="mt-4 text-center text-[11px] text-ink-500">
            选择没有标准答案，也不会有对错提示。
          </p>
        </div>
      </div>
    </main>
  )
}
