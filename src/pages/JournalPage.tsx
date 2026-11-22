import { useState, useMemo } from 'react'
import { useGameStore } from '@/stores/useGameStore'
import { useShallow } from 'zustand/react/shallow'
import { TIME_SLOT_LABELS } from '@/game/saveSchema'
import { INSIGHT_CATEGORY_LABELS, type InsightCategory } from '@/types/game'

type JournalType = 'action_review' | 'free' | 'insight_link'

const TYPE_LABELS: Record<JournalType, string> = {
  action_review: '行动复盘',
  free: '自由记录',
  insight_link: '关联认知',
}

const TYPE_COLORS: Record<JournalType, string> = {
  action_review: 'bg-sun-100 text-sun-700',
  free: 'bg-ink-100 text-ink-700',
  insight_link: 'bg-purple-100 text-purple-700',
}

function JournalEntryCard({
  entry,
  onEdit,
  onDelete,
  linkedAction,
  linkedInsight,
  linkedExperiences,
}: {
  entry: {
    id: string
    type: JournalType
    content: string
    linkedActionId: string | null
    linkedInsightId: string | null
    linkedExperienceIds: string[]
    createdAt: string
    updatedAt: string
  }
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void
  linkedAction: { title: string } | null
  linkedInsight: { title: string; category: string } | null
  linkedExperiences: { eventTitle: string; sceneId: string; gameDay: number; timeSlot: string }[]
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(entry.content)
  const isUpdated = entry.updatedAt !== entry.createdAt

  const handleSave = () => {
    onEdit(entry.id, editContent.trim())
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(entry.content)
    setIsEditing(false)
  }

  return (
    <article className="relative rounded-xl border border-ink-100 bg-white p-4 sm:p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[entry.type]}`}>
            {TYPE_LABELS[entry.type]}
          </span>
          <time className="text-xs text-ink-400" dateTime={entry.createdAt}>
            {new Date(entry.createdAt).toLocaleString('zh-CN')}
          </time>
          {isUpdated && (
            <span className="text-xs text-ink-400" title={`更新于 ${new Date(entry.updatedAt).toLocaleString('zh-CN')}`}>
              · 已编辑
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600"
            aria-label={isEditing ? '取消编辑' : '编辑'}
          >
            {isEditing ? '✕' : '✎'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('确定删除这条日记吗？')) onDelete(entry.id)
            }}
            className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-rose-600"
            aria-label="删除"
          >
            🗑
          </button>
        </div>
      </header>

      {isEditing ? (
        <div className="mt-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full rounded-lg border border-sun-300 bg-sun-50 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500 resize-none"
            aria-label="编辑日记内容"
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
              disabled={!editContent.trim()}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors ${
                editContent.trim()
                  ? 'bg-sun-700 hover:bg-sun-800'
                  : 'bg-sun-300 cursor-not-allowed'
              }`}
            >
              保存
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 prose prose-sm max-w-none text-ink-700 whitespace-pre-wrap">{entry.content}</div>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink-500">
        {linkedAction && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sun-50 px-2 py-0.5 text-sun-700">
            行动：「{linkedAction.title}」
          </span>
        )}
        {linkedInsight && (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-purple-700">
            认知：[{INSIGHT_CATEGORY_LABELS[linkedInsight.category as InsightCategory]}] {linkedInsight.title}
          </span>
        )}
        {linkedExperiences.length > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2 py-0.5">
            关联 {linkedExperiences.length} 条经历
          </span>
        )}
      </footer>
    </article>
  )
}

function CreateJournalDialog({
  onClose,
  onCreate,
  actions,
  insights,
  experiences,
}: {
  onClose: () => void
  onCreate: (input: {
    type: JournalType
    content: string
    linkedActionId: string | null
    linkedInsightId: string | null
    linkedExperienceIds: string[]
  }) => void
  actions: { id: string; title: string }[]
  insights: { id: string; title: string; category: string }[]
  experiences: { id: string; eventTitle: string; sceneId: string; gameDay: number; timeSlot: string }[]
}) {
  const [type, setType] = useState<JournalType>('free')
  const [content, setContent] = useState('')
  const [linkedActionId, setLinkedActionId] = useState<string | null>(null)
  const [linkedInsightId, setLinkedInsightId] = useState<string | null>(null)
  const [linkedExperienceIds, setLinkedExperienceIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const trimmed = content.trim()
    if (!trimmed) return
    setSubmitting(true)
    onCreate({
      type,
      content: trimmed,
      linkedActionId,
      linkedInsightId,
      linkedExperienceIds,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="create-journal-dialog-title">
      <article className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <header className="flex items-center justify-between sticky top-0 bg-white pb-4 border-b border-ink-100">
          <h2 id="create-journal-dialog-title" className="text-lg font-semibold text-ink-900">新建日记</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1 text-ink-400 hover:bg-ink-100 disabled:opacity-50"
            aria-label="关闭"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 pb-4">
          <div>
            <label className="block text-sm font-medium text-ink-700">类型</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['free', 'action_review', 'insight_link'] as JournalType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  disabled={submitting}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-medium text-center transition-all ${
                    type === t
                      ? 'border-sun-500 bg-sun-50 text-sun-700'
                      : 'border-ink-200 text-ink-600 hover:border-ink-300 disabled:opacity-50'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {type === 'action_review' && actions.length > 0 && (
            <div>
              <label htmlFor="journal-action" className="block text-sm font-medium text-ink-700">
                关联行动
              </label>
              <select
                id="journal-action"
                value={linkedActionId || ''}
                onChange={(e) => setLinkedActionId(e.target.value || null)}
                className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500"
                disabled={submitting}
              >
                <option value="">选择一个行动</option>
                {actions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'insight_link' && insights.length > 0 && (
            <div>
              <label htmlFor="journal-insight" className="block text-sm font-medium text-ink-700">
                关联认知
              </label>
              <select
                id="journal-insight"
                value={linkedInsightId || ''}
                onChange={(e) => setLinkedInsightId(e.target.value || null)}
                className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500"
                disabled={submitting}
              >
                <option value="">选择一个认知</option>
                {insights.map((i) => (
                  <option key={i.id} value={i.id}>
                    [{INSIGHT_CATEGORY_LABELS[i.category as InsightCategory]}] {i.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'free' && experiences.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-ink-700">
                关联经历（可多选）
              </label>
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {experiences.map((exp) => (
                  <label key={exp.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-ink-50">
                    <input
                      type="checkbox"
                      checked={linkedExperienceIds.includes(exp.id)}
                      onChange={(e) =>
                        setLinkedExperienceIds((prev) =>
                          e.target.checked ? [...prev, exp.id] : prev.filter((id) => id !== exp.id)
                        )
                      }
                      className="rounded border-ink-300 text-sun-600 focus:ring-sun-500"
                      disabled={submitting}
                    />
                    <span className="text-sm text-ink-700">
                      {exp.eventTitle}（{exp.sceneId}，第 {exp.gameDay} 天 {TIME_SLOT_LABELS[exp.timeSlot as keyof typeof TIME_SLOT_LABELS]}）
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="journal-content" className="block text-sm font-medium text-ink-700">
              内容
            </label>
            <textarea
              id="journal-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              maxLength={2000}
              placeholder="随便写写，不需要文采，只给自己看……"
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500 resize-none"
              required
              autoFocus
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-ink-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="rounded-lg bg-sun-700 px-4 py-2 text-sm font-medium text-white hover:bg-sun-800 disabled:opacity-50"
            >
              保存
            </button>
          </div>
        </form>
      </article>
    </div>
  )
}

export default function JournalPage() {
  const journalEntries = useGameStore(useShallow((state) => state.save?.journalEntries ?? []))
  const actions = useGameStore(useShallow((state) => state.save?.actions ?? []))
  const insights = useGameStore(useShallow((state) => state.save?.insights ?? []))
  const experiences = useGameStore(useShallow((state) => state.save?.experiences ?? []))
  const { addJournalEntry, updateJournalEntry, deleteJournalEntry } = useGameStore()
  const [filterType, setFilterType] = useState<JournalType | 'all'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const filteredEntries = useMemo(() => {
    if (filterType === 'all') return journalEntries
    return journalEntries.filter((e: typeof journalEntries[0]) => e.type === filterType)
  }, [journalEntries, filterType])

  // 准备关联数据
  const entryWithRelations = filteredEntries.map((entry: typeof filteredEntries[0]) => ({
    ...entry,
    linkedAction: entry.linkedActionId ? actions.find((a: typeof actions[0]) => a.id === entry.linkedActionId) || null : null,
    linkedInsight: entry.linkedInsightId ? insights.find((i: typeof insights[0]) => i.id === entry.linkedInsightId) || null : null,
    linkedExperiences: entry.linkedExperienceIds
      .map((id: string) => experiences.find((e: typeof experiences[0]) => e.id === id))
      .filter((e): e is typeof experiences[0] => e !== undefined),
  }))

  return (
    <div className="min-h-dvh bg-cream-50 pb-12 sm:pb-16">
      <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-5">
          <nav className="flex items-center gap-2 text-sm text-ink-500" aria-label="面包屑">
            <a href="#/city" className="hover:text-ink-700">城市</a>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-ink-900">日记</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">日记</h1>
          <p className="mt-1 text-sm text-ink-500">默认不进入任何分析。你写下的内容属于你，随时可以修改或删除。</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center gap-2" role="group" aria-label="筛选类型">
          {(['all', 'free', 'action_review', 'insight_link'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filterType === t
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-700 hover:bg-ink-50 border border-ink-200'
              }`}
            >
              {t === 'all' ? '全部' : TYPE_LABELS[t as JournalType]}
            </button>
          ))}
        </div>

        {entryWithRelations.length === 0 ? (
          <section className="py-12 sm:py-16 text-center" aria-labelledby="empty-title">
            <h2 id="empty-title" className="text-lg font-medium text-ink-700">
              {filterType === 'all' ? '还没有日记' : `没有「${TYPE_LABELS[filterType as JournalType]}」类型的日记`}
            </h2>
            <p className="mt-2 text-sm text-ink-500 max-w-xs mx-auto">
              记下此刻的想法，或是为某个行动做复盘，或者把一条认知展开说说。
            </p>
            <button
              type="button"
              onClick={() => setShowCreateDialog(true)}
              className="mt-6 inline-flex items-center rounded-lg bg-sun-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sun-800"
            >
              写下第一条日记
            </button>
          </section>
        ) : (
          <div className="space-y-4" role="list" aria-label="日记列表">
            {entryWithRelations.map((entry: typeof entryWithRelations[0]) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={updateJournalEntry}
                onDelete={deleteJournalEntry}
                linkedAction={entry.linkedAction}
                linkedInsight={entry.linkedInsight}
                linkedExperiences={entry.linkedExperiences}
              />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShowCreateDialog(true)}
            className="inline-flex items-center rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            + 新建日记
          </button>
        </div>
      </main>

      {showCreateDialog && (
        <CreateJournalDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={addJournalEntry}
          actions={actions.map((a: typeof actions[0]) => ({ id: a.id, title: a.title }))}
          insights={insights.map((i: typeof insights[0]) => ({ id: i.id, title: i.title, category: i.category }))}
          experiences={experiences.map((e: typeof experiences[0]) => ({
            id: e.id,
            eventTitle: e.eventTitle,
            sceneId: e.sceneId,
            gameDay: e.gameDay,
            timeSlot: e.timeSlot,
          }))}
        />
      )}
    </div>
  )
}