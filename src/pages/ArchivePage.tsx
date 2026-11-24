import { useState, useMemo } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { StatusBar } from '@/components/layout/StatusBar'
import { Icon } from '@/components/ui/Icon'
import { SCENES } from '@/data/scenes'
import { TIME_SLOT_LABELS } from '@/game/saveSchema'
import { getVisibleExperiences } from '@/services/experienceService'
import {
  EXPERIENCE_TYPE_LABELS,
  INSIGHT_CATEGORIES,
  INSIGHT_CATEGORY_LABELS,
  type InsightCategory,
} from '@/types/game'
import { useGameStore } from '@/stores/useGameStore'
import type { ChapterSummary } from '@/game/saveSchema'

function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * 人生档案（M2 版本 + M5 阶段总结）
 *
 * 只展示三部分：玩家自己的经历、由本人确认过的认知、以及阶段总结。
 * 未确认的 AI 观察不会出现在这里——那是 M3 回顾页的事。
 */
export default function ArchivePage() {
  const save = useGameStore((state) => state.save)
  const setExperienceConsent = useGameStore((state) => state.setExperienceConsent)
  const deleteExperience = useGameStore((state) => state.deleteExperience)
  const deleteInsight = useGameStore((state) => state.deleteInsight)
  const upsertChapterSummary = useGameStore((state) => state.upsertChapterSummary)
  const deleteChapterSummary = useGameStore((state) => state.deleteChapterSummary)
  const navigate = useNavigate()

  /** 二次确认：第一次点「删除」只进入待确认状态 */
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [pendingInsightDeleteId, setPendingInsightDeleteId] = useState<string | null>(null)
  const [pendingSummaryDeleteId, setPendingSummaryDeleteId] = useState<string | null>(null)
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null)
  const [editSummaryContent, setEditSummaryContent] = useState('')
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [generatedSummary, setGeneratedSummary] = useState('')

  // 按章节汇总数据用于生成总结
  const chapterData = useMemo(() => {
    if (!save) return { experiences: [], insights: [], actions: [], journalEntries: [] }
    const experiences = getVisibleExperiences(save).sort(
      (a, b) => a.gameDay - b.gameDay || TIME_SLOT_LABELS[a.timeSlot].localeCompare(TIME_SLOT_LABELS[b.timeSlot]),
    )
    const insights = save.insights
    const actions = save.actions
    const journalEntries = save.journalEntries

    return {
      experiences,
      insights,
      actions,
      journalEntries,
    }
  }, [save])

  const experiences = save ? getVisibleExperiences(save).slice().reverse() : []

  if (!save) return <Navigate to="/" replace />

  return (
    <main className="min-h-dvh bg-cream-50 pb-20">
      <StatusBar save={save} title="人生档案" />

      <div className="mx-auto w-full max-w-3xl px-5 pt-8 lg:max-w-5xl lg:px-6">
        <p className="text-[11px] tracking-[0.4em] text-gold-600">档案</p>
        <h1 className="mt-3 font-display text-3xl tracking-[0.04em] text-ink-900">
          人生档案
        </h1>
        <p className="mt-3 max-w-xl text-[13px] leading-6 text-ink-500">
          这里存放你经历过的事，以及你亲口确认过的认识。
          未确认的猜测不会出现在这里。
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start lg:gap-12">
        <section>
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
            <ul className="mt-2 divide-y divide-sand-300/60 border-t border-sand-300/60">
              {experiences.map((experience) => {
                const sceneName = SCENES[experience.sceneId].name
                const confirming = pendingDeleteId === experience.id

                return (
                  <li
                    key={experience.id}
                    className="py-5"
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

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
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

          <div className="space-y-12">
        <section>
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
                    <ul className="mt-3 space-y-4">
                      {items.map((insight) => (
                        <li
                          key={insight.id}
                          className="border-l-2 border-sage-500/45 pl-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-display text-[15px] text-ink-900">
                              {insight.title}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/actions?insight=${insight.id}`)
                                }}
                                className="rounded-full bg-sun-100 px-3 py-1 text-[11px] font-medium text-sun-700 hover:bg-sun-200 transition-colors"
                              >
                                转化为行动
                              </button>
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

        {/* —— M5: 阶段总结 —— */}
        <section aria-labelledby="summary-title">
          <div className="flex items-baseline justify-between">
            <h2 id="summary-title" className="font-display text-lg text-ink-900">
              阶段总结
            </h2>
            <span className="text-[12px] text-ink-500">共 {save.chapterSummaries.length} 段</span>
          </div>

          {save.chapterSummaries.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-sand-300 bg-cream-100/50 px-5 py-8 text-center">
              <p className="text-[13px] leading-6 text-ink-500">
                还没有生成过阶段总结。
                <br />
                点击下方按钮，微光会帮你把这一章的经历、认知、行动、日记编织成一段叙事。
              </p>
              <button
                type="button"
                onClick={() => {
                  const summary = generateChapterSummary(chapterData)
                  setGeneratedSummary(summary)
                  setShowGenerateDialog(true)
                }}
                className="mt-4 inline-flex items-center rounded-lg bg-sun-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sun-800"
              >
                生成本章总结
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {save.chapterSummaries
                .slice()
                .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
                .map((summary) => (
                  <ChapterSummaryCard
                    key={summary.id}
                    summary={summary}
                    onDelete={() => {
                      if (pendingSummaryDeleteId === summary.id) {
                        deleteChapterSummary(summary.id)
                        setPendingSummaryDeleteId(null)
                      } else {
                        setPendingSummaryDeleteId(summary.id)
                      }
                    }}
                    onSaveEdit={(_id, content) => {
                      upsertChapterSummary({ chapter: summary.chapter, content })
                      setEditingSummaryId(null)
                    }}
                    pendingDeleteId={pendingSummaryDeleteId}
                    editingSummaryId={editingSummaryId}
                    setEditingSummaryId={setEditingSummaryId}
                    editSummaryContent={editSummaryContent}
                    setEditSummaryContent={setEditSummaryContent}
                  />
                ))}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    const summary = generateChapterSummary(chapterData)
                    setGeneratedSummary(summary)
                    setShowGenerateDialog(true)
                  }}
                  className="inline-flex items-center rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
                >
                  + 生成新的阶段总结
                </button>
              </div>
            </div>
          )}
        </section>
          </div>
        </div>
      </div>
    {showGenerateDialog && (
      <GenerateSummaryDialog
        onClose={() => {
          setShowGenerateDialog(false)
          setGeneratedSummary('')
        }}
        onSave={(content) => {
          upsertChapterSummary({ chapter: 'chapter_01', content })
          setShowGenerateDialog(false)
          setGeneratedSummary('')
        }}
        initialContent={generatedSummary}
      />
    )}
  </main>
  )
}

/** 根据当前章节数据生成阶段总结草稿 */
function generateChapterSummary(data: {
  experiences: ReturnType<typeof getVisibleExperiences>
  insights: { category: string; title: string; content: string; evidenceIds: string[] }[]
  actions: { title: string; status: string; linkedInsightId: string | null }[]
  journalEntries: { type: string; content: string; linkedActionId: string | null }[]
}): string {
  const { experiences, insights, actions, journalEntries } = data
  const now = new Date()
  const dateStr = `${now.getMonth() + 1} 月 ${now.getDate()} 日`

  let summary = `【第 1 章 · ${dateStr} 的阶段总结】\n\n`

  if (experiences.length > 0) {
    summary += `这段时间，你一共经历了 ${experiences.length} 件事：\n`
    experiences.forEach((exp, i) => {
      const sceneName = SCENES[exp.sceneId].name
      summary += `${i + 1}. ${sceneName} · ${exp.eventTitle}（选择：${exp.choiceText}）\n`
    })
    summary += '\n'
  }

  if (insights.length > 0) {
    summary += `你和微光一起回顾后，确认了 ${insights.length} 条关于自己的认识：\n`
    insights.forEach((insight) => {
      summary += `· [${INSIGHT_CATEGORY_LABELS[insight.category as InsightCategory]}] ${insight.title}：${insight.content}\n`
    })
    summary += '\n'
  }

  if (actions.length > 0) {
    const doneActions = actions.filter((a) => a.status === 'done')
    summary += `你建立了 ${actions.length} 个现实行动，其中 ${doneActions.length} 个已完成。\n`
    actions.forEach((a) => {
      const statusLabel =
        a.status === 'done' ? '完成' : a.status === 'in_progress' ? '进行中' : a.status === 'paused' ? '暂停' : '待办'
      summary += `${statusLabel} ${a.title}\n`
    })
    summary += '\n'
  }

  if (journalEntries.length > 0) {
    summary += `你写了 ${journalEntries.length} 条日记，记录了过程中的感受与思考。\n\n`
  }

  summary += `—— 这是微光为你梳理的草稿，你可以自由修改、补充，或重新生成。\n只有你确认保存的版本才会成为正式的阶段总结。`

  return summary
}

/** 阶段总结卡片 */
function ChapterSummaryCard({
  summary,
  onDelete,
  onSaveEdit,
  pendingDeleteId,
  editingSummaryId,
  setEditingSummaryId,
  editSummaryContent,
  setEditSummaryContent,
}: {
  summary: ChapterSummary
  onDelete: () => void
  onSaveEdit: (id: string, content: string) => void
  pendingDeleteId: string | null
  editingSummaryId: string | null
  setEditingSummaryId: (id: string | null) => void
  editSummaryContent: string
  setEditSummaryContent: (content: string) => void
}) {
  const isPendingDelete = pendingDeleteId === summary.id
  const isEditing = editingSummaryId === summary.id

  const handleSave = () => {
    onSaveEdit(summary.id, editSummaryContent.trim())
  }

  const handleCancel = () => {
    setEditSummaryContent(summary.content)
    setEditingSummaryId(null)
  }

  const chapterLabel = summary.chapter === 'chapter_01' ? '第 1 章' : summary.chapter

  return (
    <article className="border-l-2 border-gold-400/60 pl-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-[15px] text-ink-900">{chapterLabel}</h3>
          <p className="mt-0.5 text-[11px] text-ink-500">
            {summary.isEdited ? '已编辑 · ' : '微光生成 · '}
            {new Date(summary.generatedAt).toLocaleString('zh-CN')}
            {summary.editedAt && ` · 编辑于 ${new Date(summary.editedAt).toLocaleString('zh-CN')}`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setEditSummaryContent(summary.content)
              setEditingSummaryId(summary.id)
            }}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-600"
            aria-label={isEditing ? '取消编辑' : '编辑'}
          >
            {isEditing ? <Icon name="close" size={14} /> : <Icon name="edit" size={14} />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-rose-600"
            aria-label="删除"
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      </header>

      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={editSummaryContent}
            onChange={(e) => setEditSummaryContent(e.target.value)}
            rows={8}
            maxLength={5000}
            className="w-full rounded-lg border border-sun-300 bg-sun-50 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500 resize-none"
            aria-label="编辑阶段总结"
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-3 py-1.5 text-sm text-ink-600 hover:bg-ink-100"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!editSummaryContent.trim()}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors ${
                editSummaryContent.trim()
                  ? 'bg-sun-700 hover:bg-sun-800'
                  : 'bg-sun-300 cursor-not-allowed'
              }`}
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 prose prose-sm max-w-none text-ink-700 whitespace-pre-wrap">{summary.content}</div>
      )}

      {isPendingDelete && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-cream-50 hover:bg-ink-800"
          >
            再次点击确认删除
          </button>
        </div>
      )}
    </article>
  )
}

/** 生成总结对话框 */
function GenerateSummaryDialog({
  onClose,
  onSave,
  initialContent,
}: {
  onClose: () => void
  onSave: (content: string) => void
  initialContent: string
}) {
  const [content, setContent] = useState(initialContent)
  const [submitting, setSubmitting] = useState(false)

  const handleSave = () => {
    if (submitting) return
    const trimmed = content.trim()
    if (!trimmed) return
    setSubmitting(true)
    onSave(trimmed)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="generate-summary-dialog-title">
      <article className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <header className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b border-ink-100">
          <h2 id="generate-summary-dialog-title" className="text-lg font-semibold text-ink-900">生成阶段总结</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1 text-ink-500 hover:bg-ink-100 disabled:opacity-50"
            aria-label="关闭"
          >
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="mt-4">
          <p className="text-sm text-ink-600">
            微光根据你的经历、认知、行动与日记生成了以下草稿。你可以直接保存，也可以先修改再保存。
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            maxLength={5000}
            className="mt-3 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500 resize-none"
            aria-label="阶段总结内容"
            disabled={submitting}
          />
          <p className="mt-2 text-xs text-ink-500">你可以随意修改、补充或删减。只有点击「保存为正式总结」后，内容才会进入档案。</p>
        </div>

        <div className="mt-4 flex justify-end gap-2 pt-4 border-t border-ink-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-50"
          >
            放弃
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || !content.trim()}
            className="rounded-lg bg-sun-700 px-4 py-2 text-sm font-medium text-white hover:bg-sun-800 disabled:opacity-50"
          >
            保存为正式总结
          </button>
        </div>
      </article>
    </div>
  )
}
