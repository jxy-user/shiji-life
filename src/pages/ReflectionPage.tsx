import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'

import { StatusBar } from '@/components/layout/StatusBar'
import { LumiSprite } from '@/components/lumi/LumiSprite'
import { getActiveReflection } from '@/game/reflection'
import type { CandidateInsight, LifeExperience } from '@/game/saveSchema'
import { getEligibleExperiences, getVisibleExperiences } from '@/services/experienceService'
import { useGameStore } from '@/stores/useGameStore'
import {
  EXPERIENCE_TYPE_LABELS,
  INSIGHT_CATEGORY_LABELS,
} from '@/types/game'

/**
 * 阶段回顾
 *
 * 顺序：授权 → 一起看经历 → 微光提出带证据的猜测 → 玩家确认 / 否认 / 改写。
 * 只有玩家确认的内容会变成认知卡片；否认不会留下任何评判。
 */
export default function ReflectionPage() {
  const save = useGameStore((state) => state.save)
  const respondReflection = useGameStore((state) => state.respondReflection)
  const setExperienceConsent = useGameStore((state) => state.setExperienceConsent)
  const generateCandidates = useGameStore((state) => state.generateCandidates)
  const confirmCandidate = useGameStore((state) => state.confirmCandidate)
  const rejectCandidate = useGameStore((state) => state.rejectCandidate)
  const completeReflection = useGameStore((state) => state.completeReflection)

  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)

  if (!save) return <Navigate to="/" replace />

  // 会话一旦完成就不再有「进行中」的会话，必须先处理完成态再判断重定向
  if (finished) return <DoneScreen save={save} />

  const session = getActiveReflection(save)
  if (!session) return <Navigate to="/city" replace />

  // 收窄后的引用：函数声明里拿不到上面的类型收窄
  const sessionId = session.id

  const visible = getVisibleExperiences(save).slice().reverse()
  const eligible = getEligibleExperiences(save)
  const eligibleTypes = new Set(eligible.map((experience) => experience.experienceType)).size
  const threshold = save.settings.reflectionThreshold
  const minTypes = save.settings.minExperienceTypes
  const enough = eligible.length >= threshold && eligibleTypes >= minTypes

  const candidates = save.candidateInsights.filter(
    (candidate) => candidate.reflectionId === session.id,
  )
  const pending = candidates.filter((candidate) => candidate.status === 'pending')

  function finish() {
    completeReflection(sessionId)
    setFinished(true)
  }

  if (session.status === 'invited') {
    return (
      <main className="relative min-h-dvh bg-cream-50">
        <StatusBar save={save} title="回顾邀请" />
        <div className="mx-auto flex min-h-[70dvh] w-full max-w-lg flex-col justify-center px-5">
          <section className="rounded-3xl border border-gold-300/70 bg-gradient-to-b from-cream-100 to-cream-50 p-6">
            <LumiSprite size={64} talking />
            <p className="mt-4 font-display text-[16px] leading-8 text-ink-900">
              最近我们一起经历了不少事。我有一些小发现，但不确定是不是我理解的那样。你愿意聊聊吗？
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => respondReflection(session.id, 'accept')}
                className="rounded-full bg-ink-900 px-5 py-2 text-[13px] text-cream-50 transition-colors hover:bg-ink-700"
              >
                现在聊聊
              </button>
              <button
                type="button"
                onClick={() => respondReflection(session.id, 'postpone')}
                className="rounded-full border border-sand-300 px-5 py-2 text-[13px] text-ink-700 transition-colors hover:border-gold-400"
              >
                稍后
              </button>
              <button
                type="button"
                onClick={() => respondReflection(session.id, 'decline')}
                className="rounded-full px-4 py-2 text-[13px] text-ink-500 transition-colors hover:text-ink-900"
              >
                这次不聊
              </button>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-cream-50 pb-20">
      <StatusBar save={save} title="回顾" />

      <div className="mx-auto w-full max-w-2xl px-5 pt-8 lg:max-w-3xl">
        <p className="text-[11px] tracking-[0.4em] text-gold-600">回顾</p>
        <h1 className="mt-3 font-display text-2xl text-ink-900">
          先看看哪些事可以一起看
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-ink-500">
          只有你允许的经历，才会被拿来看。你可以随时改主意，改完立刻生效。
        </p>

        {started ? (
          <button
            type="button"
            onClick={() => setStarted(false)}
            className="mt-4 rounded-full border border-sand-300 px-4 py-1.5 text-[12px] text-ink-700 transition-colors hover:border-gold-400"
          >
            调整可以一起看的经历
          </button>
        ) : (
          <>
        <section className="mt-6 space-y-2">
          {visible.map((experience) => (
            <button
              key={experience.id}
              type="button"
              role="switch"
              aria-checked={experience.analysisConsent}
              onClick={() =>
                setExperienceConsent(experience.id, !experience.analysisConsent)
              }
              className={[
                'flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-colors',
                experience.analysisConsent
                  ? 'border-gold-300 bg-gold-200/20'
                  : 'border-sand-300 bg-cream-50 hover:border-gold-300',
              ].join(' ')}
            >
              <span>
                <span className="block text-[11px] tracking-[0.08em] text-ink-500">
                  {EXPERIENCE_TYPE_LABELS[experience.experienceType]} · 第{' '}
                  {experience.gameDay} 天
                </span>
                <span className="mt-1 block font-display text-[14px] text-ink-900">
                  {experience.eventTitle} · {experience.choiceText}
                </span>
              </span>
              <span className="shrink-0 text-[11px] text-ink-500">
                {experience.analysisConsent ? '可以一起看' : '不参与'}
              </span>
            </button>
          ))}
        </section>

        <p className="mt-4 text-[12px] text-ink-500" aria-live="polite">
          已允许 {eligible.length} 条，覆盖 {eligibleTypes} 类；至少需要 {threshold} 条、
          {minTypes} 类。
        </p>

        <button
          type="button"
          disabled={!enough}
          onClick={() => {
            // 没有候选时也进入回顾视图，由页面说明「证据不足」
            generateCandidates(session.id)
            setStarted(true)
          }}
          className="mt-5 w-full rounded-full bg-ink-900 px-5 py-3 text-[13px] text-cream-50 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          开始回顾
        </button>
          </>
        )}

        {/*
          常驻直播区域：开始回顾后候选是动态生成的，
          容器必须先存在，读屏软件才会播报第一次结果。
        */}
        <p className="sr-only" role="status" aria-live="polite">
          {started
            ? `微光注意到 ${candidates.length} 条观察，其中 ${pending.length} 条待处理。`
            : ''}
        </p>

        {started ? (
          <>
            <section className="mt-8">
              <h2 className="font-display text-lg text-ink-900">这些事</h2>
              <ul className="mt-3 space-y-2">
                {eligible.map((experience) => (
                  <li
                    key={experience.id}
                    className="rounded-2xl border border-sand-300/70 bg-cream-100/50 px-4 py-3"
                  >
                    <p className="text-[11px] text-ink-500">
                      第 {experience.gameDay} 天 ·{' '}
                      {EXPERIENCE_TYPE_LABELS[experience.experienceType]}
                    </p>
                    <p className="mt-1 font-display text-[14px] text-ink-900">
                      {experience.eventTitle} · {experience.choiceText}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-lg text-ink-900">微光注意到</h2>

              {candidates.length === 0 ? (
                <div className="mt-3 rounded-2xl border border-dashed border-sand-300 bg-cream-100/50 px-5 py-6">
                  <p className="text-[13px] leading-6 text-ink-500">
                    这次没有找到足够证据下的观察。不是你的问题，也不需要现在有什么结论。
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      experiences={save.experiences}
                      onConfirm={(edited) => confirmCandidate(candidate.id, edited)}
                      onReject={() => rejectCandidate(candidate.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {pending.length === 0 ? (
              <button
                type="button"
                onClick={finish}
                className="mt-8 w-full rounded-full bg-ink-900 px-5 py-3 text-[13px] text-cream-50 transition-colors hover:bg-ink-700"
              >
                结束这次回顾
              </button>
            ) : (
              <p className="mt-6 text-center text-[11px] text-ink-500">
                每条都可以确认、否认，或者按你的说法改写。
              </p>
            )}
          </>
        ) : null}
      </div>
    </main>
  )
}

type CandidateCardProps = {
  candidate: CandidateInsight
  experiences: LifeExperience[]
  onConfirm: (edited?: { title?: string; content?: string }) => void
  onReject: () => void
}

function CandidateCard({
  candidate,
  experiences,
  onConfirm,
  onReject,
}: CandidateCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(
    [candidate.description, candidate.hypothesis].filter(Boolean).join('\n\n'),
  )

  const evidence = candidate.evidenceIds
    .map((id) => experiences.find((experience) => experience.id === id))
    .filter((experience): experience is LifeExperience => Boolean(experience))

  const handled = candidate.status !== 'pending'

  return (
    <article
      className={[
        'rounded-2xl border p-4 sm:p-5',
        handled
          ? 'border-sage-500/40 bg-sage-300/10'
          : 'border-gold-300/60 bg-cream-50',
      ].join(' ')}
    >
      <p className="text-[11px] tracking-[0.2em] text-gold-600">
        {INSIGHT_CATEGORY_LABELS[candidate.category]}
      </p>
      <h3 className="mt-1.5 font-display text-[16px] text-ink-900">{candidate.title}</h3>
      <p className="mt-2 text-[13px] leading-6 text-ink-700">{candidate.description}</p>
      <p className="mt-2 text-[13px] leading-6 text-ink-500">{candidate.hypothesis}</p>

      <p className="mt-2 text-[11px] text-ink-500">
        <span className="rounded-full bg-cream-200 px-2 py-0.5">这只是猜测</span>{' '}
        {candidate.uncertainty}
      </p>

      <div className="mt-3 rounded-xl border border-sand-300/70 bg-cream-100/40 px-3 py-2">
        <p className="text-[10px] tracking-[0.2em] text-ink-500">依据</p>
        <ul className="mt-1 space-y-1">
          {evidence.map((experience) => (
            <li key={experience.id} className="text-[12px] text-ink-700">
              《{experience.eventTitle}》 · 「{experience.choiceText}」
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-3 font-display text-[13px] text-ink-900">
        微光问：{candidate.questionForPlayer}
      </p>

      {handled ? (
        <p className="mt-3 text-[11px] text-ink-500">
          {candidate.status === 'confirmed'
            ? '你已经确认过这条。它已经进入人生档案。'
            : '你说过不太像。微光不会把它记下来。'}
        </p>
      ) : editing ? (
        <div className="mt-3">
          <label htmlFor={`edit-${candidate.id}`} className="text-[11px] text-ink-500">
            按你的说法写下来
          </label>
          <textarea
            id={`edit-${candidate.id}`}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            maxLength={300}
            className="mt-1 w-full resize-none rounded-xl border border-sand-300 bg-cream-50 px-3 py-2 font-display text-[13px] leading-6 text-ink-900 outline-none focus:border-gold-400"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => onConfirm({ content: draft })}
              disabled={!draft.trim()}
              className="rounded-full bg-ink-900 px-4 py-1.5 text-[12px] text-cream-50 disabled:opacity-40"
            >
              保存为我的想法
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full px-3 py-1.5 text-[12px] text-ink-500"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onConfirm()}
            className="rounded-full bg-ink-900 px-4 py-1.5 text-[12px] text-cream-50 transition-colors hover:bg-ink-700"
          >
            是的，像我
          </button>
          <button
            type="button"
            onClick={onReject}
            className="rounded-full border border-sand-300 px-4 py-1.5 text-[12px] text-ink-700 transition-colors hover:border-gold-400"
          >
            不太像
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-full px-3 py-1.5 text-[12px] text-ink-500 transition-colors hover:text-ink-900"
          >
            改一下
          </button>
        </div>
      )}
    </article>
  )
}

function DoneScreen({ save }: { save: NonNullable<ReturnType<typeof useGameStore.getState>['save']> }) {
  return (
    <main className="min-h-dvh bg-cream-50">
      <StatusBar save={save} title="回顾" />
      <div className="mx-auto flex min-h-[70dvh] w-full max-w-lg flex-col justify-center px-5">
        <section className="rounded-3xl border border-sand-300 bg-cream-50 p-6">
          <LumiSprite size={56} />
          <h1 className="mt-4 font-display text-xl text-ink-900">这次就到这里。</h1>
          <p className="mt-2 text-[13px] leading-6 text-ink-500">
            你确认的内容已经放进人生档案；没有确认的，不会被记住。
            什么时候想再聊，都可以。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/archive"
              className="rounded-full bg-ink-900 px-5 py-2 text-[13px] text-cream-50 transition-colors hover:bg-ink-700"
            >
              看看人生档案
            </Link>
            <Link
              to="/city"
              className="rounded-full border border-sand-300 px-5 py-2 text-[13px] text-ink-700 transition-colors hover:border-gold-400"
            >
              回到城市
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
