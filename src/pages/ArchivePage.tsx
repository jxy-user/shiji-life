import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { StatusBar } from '@/components/layout/StatusBar'
import { SCENES } from '@/data/scenes'
import { TIME_SLOT_LABELS } from '@/game/saveSchema'
import { getVisibleExperiences } from '@/services/experienceService'
import {
  EXPERIENCE_TYPE_LABELS,
  INSIGHT_CATEGORIES,
  INSIGHT_CATEGORY_LABELS,
} from '@/types/game'
import { useGameStore } from '@/stores/useGameStore'

function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * 人生档案（M2 版本）
 *
 * 只展示两部分：玩家自己的经历，以及由本人确认过的认知。
 * 未确认的 AI 观察不会出现在这里——那是 M3 回顾页的事。
 */
export default function ArchivePage() {
  const save = useGameStore((state) => state.save)
  const setExperienceConsent = useGameStore((state) => state.setExperienceConsent)
  const deleteExperience = useGameStore((state) => state.deleteExperience)
  const deleteInsight = useGameStore((state) => state.deleteInsight)

  /** 二次确认：第一次点「删除」只进入待确认状态 */
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingInsightDeleteId, setPendingInsightDeleteId] = useState<string | null>(null)

  if (!save) return <Navigate to="/" replace />

  const experiences = getVisibleExperiences(save).slice().reverse()

  return (
    <main className="min-h-dvh bg-cream-50 pb-20">
      <StatusBar save={save} title="人生档案" />

      <div className="mx-auto w-full max-w-3xl px-5 pt-8">
        <p className="text-[11px] tracking-[0.4em] text-gold-600">档案</p>
        <h1 className="mt-3 font-display text-3xl tracking-[0.04em] text-ink-900">
          人生档案
        </h1>
        <p className="mt-3 max-w-xl text-[13px] leading-6 text-ink-500">
          这里存放你经历过的事，以及你亲口确认过的认识。
          未确认的猜测不会出现在这里。
        </p>

        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg text-ink-900">经历</h2>
            <span className="text-[12px] text-ink-500">共 {experiences.length} 条</span>
          </div>

          {experiences.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-sand-300 bg-cream-100/50 px-5 py-8 text-center">
              <p className="text-[13px] leading-6 text-ink-500">
                还没有记录。
                <br />
                去城市里走走，或者和谁聊一会儿。
              </p>
              <Link
                to="/city"
                className="mt-4 inline-flex rounded-full border border-sand-300 px-4 py-2 text-[12px] text-ink-700 transition-colors hover:border-gold-400"
              >
                回到城市
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {experiences.map((experience) => {
                const sceneName = SCENES[experience.sceneId].name
                const confirming = pendingDeleteId === experience.id

                return (
                  <li
                    key={experience.id}
                    className="rounded-2xl border border-sand-300 bg-cream-50 p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-gold-200/50 px-3 py-1 text-[11px] tracking-[0.08em] text-gold-600">
                        {EXPERIENCE_TYPE_LABELS[experience.experienceType]}
                      </span>
                      <span className="text-[11px] text-ink-500">
                        {sceneName} · 第 {experience.gameDay} 天{' '}
                        {TIME_SLOT_LABELS[experience.timeSlot]} ·{' '}
                        {formatTime(experience.createdAt)}
                      </span>
                    </div>

                    <p className="mt-3 font-display text-[15px] text-ink-900">
                      {experience.choiceText}
                    </p>
                    <p className="mt-1.5 text-[13px] leading-6 text-ink-700">
                      {experience.outcome[0]}
                    </p>

                    {experience.playerReason ? (
                      <p className="mt-2 border-l-2 border-gold-300 pl-3 text-[12px] leading-6 text-ink-500">
                        你当时写的：{experience.playerReason}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sand-300/60 pt-3">
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
                          'rounded-full border px-3.5 py-1.5 text-[11px] transition-colors',
                          experience.analysisConsent
                            ? 'border-sage-500/60 bg-sage-300/30 text-sage-700'
                            : 'border-sand-300 bg-cream-100 text-ink-500',
                        ].join(' ')}
                      >
                        {experience.analysisConsent ? '可用于回顾' : '已撤回授权'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirming) {
                            deleteExperience(experience.id)
                            setPendingDeleteId(null)
                          } else {
                            setPendingDeleteId(experience.id)
                          }
                        }}
                        onBlur={() => setPendingDeleteId(null)}
                        className={[
                          'rounded-full px-3 py-1.5 text-[11px] transition-colors',
                          confirming
                            ? 'bg-ink-900 text-cream-50'
                            : 'text-ink-500 hover:text-ink-900',
                        ].join(' ')}
                      >
                        {confirming ? '再次点击确认删除' : '删除'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          <p className="mt-3 text-[11px] leading-5 text-ink-500">
            撤回授权后，这条经历不会进入之后任何一次回顾分析；删除后也不会再出现在这里。
          </p>
        </section>

        <section className="mt-12">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg text-ink-900">关于自己的认识</h2>
            <span className="text-[12px] text-ink-500">共 {save.insights.length} 条</span>
          </div>

          {save.insights.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-sand-300 bg-cream-100/50 px-5 py-8 text-center">
              <p className="text-[13px] leading-6 text-ink-500">
                还没有确认过的认知。
                <br />
                等你和微光一起回顾之后，这里才会出现内容——而且只出现你亲自确认过的那些。
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {INSIGHT_CATEGORIES.map((category) => {
                const items = save.insights.filter(
                  (insight) => insight.category === category,
                )
                if (items.length === 0) return null

                return (
                  <div key={category}>
                    <h3 className="text-[11px] tracking-[0.25em] text-gold-600">
                      {INSIGHT_CATEGORY_LABELS[category]}
                    </h3>
                    <ul className="mt-2 space-y-2.5">
                      {items.map((insight) => (
                        <li
                          key={insight.id}
                          className="rounded-2xl border border-sand-300 bg-cream-50 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-display text-[15px] text-ink-900">
                              {insight.title}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (pendingInsightDeleteId === insight.id) {
                                  deleteInsight(insight.id)
                                  setPendingInsightDeleteId(null)
                                } else {
                                  setPendingInsightDeleteId(insight.id)
                                }
                              }}
                              onBlur={() => setPendingInsightDeleteId(null)}
                              className={[
                                'shrink-0 rounded-full px-3 py-1 text-[11px] transition-colors',
                                pendingInsightDeleteId === insight.id
                                  ? 'bg-ink-900 text-cream-50'
                                  : 'text-ink-500 hover:text-ink-900',
                              ].join(' ')}
                            >
                              {pendingInsightDeleteId === insight.id
                                ? '再次点击确认删除'
                                : '删除'}
                            </button>
                          </div>
                          <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-ink-700">
                            {insight.content}
                          </p>
                          <p className="mt-2 text-[11px] text-ink-500">
                            依据 {insight.evidenceIds.length} 条经历 · 你确认于{' '}
                            {formatTime(insight.createdAt)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
