import { useState } from 'react'
import { useGameStore } from '@/stores/useGameStore'

function ActionCard({
  action,
  onStatusChange,
  onDelete,
  onComplete,
  linkedInsight,
}: {
  action: {
    id: string
    title: string
    linkedInsightId: string | null
    frequency: 'once' | 'daily' | 'weekly' | 'custom'
    dueDate: string | null
    reminderTime: string | null
    status: 'todo' | 'in_progress' | 'done' | 'paused'
    completedAt: string | null
  }
  onStatusChange: (id: string, status: 'todo' | 'in_progress' | 'done' | 'paused') => void
  onDelete: (id: string) => void
  onComplete: (id: string) => void
  linkedInsight: { title: string; category: string } | null
}) {
  const freqLabels: Record<string, string> = {
    once: '一次性',
    daily: '每日',
    weekly: '每周',
    custom: '自定义',
  }
  const statusLabels: Record<string, string> = {
    todo: '待办',
    in_progress: '进行中',
    done: '已完成',
    paused: '暂停',
  }
  const statusColors: Record<string, string> = {
    todo: 'bg-ink-100 text-ink-700',
    in_progress: 'bg-sun-100 text-sun-700',
    done: 'bg-forest-100 text-forest-700',
    paused: 'bg-stone-100 text-stone-600',
  }

  return (
    <article
      className="group relative rounded-xl border border-ink-100 bg-white p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <header className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-ink-900">{action.title}</h3>
          {linkedInsight && (
            <p className="mt-1 text-xs text-ink-500">
              关联认知：「{linkedInsight.title}」（{linkedInsight.category}）
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 ${statusColors[action.status]}`}>
              {statusLabels[action.status]}
            </span>
            <span className="text-ink-400">·</span>
            <span className="text-ink-500">{freqLabels[action.frequency]}</span>
            {action.dueDate && (
              <>
                <span className="text-ink-400">·</span>
                <span className="text-ink-500">截止：{new Date(action.dueDate).toLocaleDateString('zh-CN')}</span>
              </>
            )}
            {action.reminderTime && (
              <>
                <span className="text-ink-400">·</span>
                <span className="text-ink-500">提醒：{action.reminderTime}</span>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {action.status !== 'done' && (
          <>
            <button
              type="button"
              onClick={() => onStatusChange(action.id, 'todo')}
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                action.status === 'todo'
                  ? 'bg-ink-900 text-white'
                  : 'bg-ink-50 text-ink-700 hover:bg-ink-100'
              }`}
            >
              待办
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(action.id, 'in_progress')}
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                action.status === 'in_progress'
                  ? 'bg-sun-600 text-white'
                  : 'bg-sun-50 text-sun-700 hover:bg-sun-100'
              }`}
            >
              开始
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(action.id, 'paused')}
              className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                action.status === 'paused'
                  ? 'bg-stone-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              暂停
            </button>
          </>
        )}
        {action.status === 'in_progress' && (
          <button
            type="button"
            onClick={() => onComplete(action.id)}
            className="inline-flex items-center rounded-lg bg-forest-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-forest-700"
          >
            完成并复盘
          </button>
        )}
        {action.status === 'done' && (
          <span className="inline-flex items-center rounded-lg bg-forest-50 px-3 py-1.5 text-sm font-medium text-forest-700">
            已完成
            {action.completedAt && (
              <span className="ml-2 text-xs text-forest-500">
                {new Date(action.completedAt).toLocaleString('zh-CN')}
              </span>
            )}
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('确定删除这条行动吗？')) onDelete(action.id)
          }}
          className="ml-auto inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-ink-500 transition-colors hover:bg-ink-50"
        >
          删除
        </button>
      </div>
    </article>
  )
}

function CreateActionDialog({
  onClose,
  onCreate,
  insights,
}: {
  onClose: () => void
  onCreate: (input: {
    title: string
    linkedInsightId: string | null
    frequency: 'once' | 'daily' | 'weekly' | 'custom'
    dueDate: string | null
    reminderTime: string | null
  }) => void
  insights: Array<{ id: string; title: string; category: string }>
}) {
  const [title, setTitle] = useState('')
  const [linkedInsightId, setLinkedInsightId] = useState<string | null>(null)
  const [frequency, setFrequency] = useState<'once' | 'daily' | 'weekly' | 'custom'>('once')
  const [dueDate, setDueDate] = useState('')
  const [reminderTime, setReminderTime] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
      linkedInsightId,
      frequency,
      dueDate: dueDate || null,
      reminderTime: reminderTime || null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <article className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">新建行动</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink-400 hover:bg-ink-100"
            aria-label="关闭"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="action-title" className="block text-sm font-medium text-ink-700">
              行动标题
            </label>
            <input
              id="action-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={60}
              placeholder="例如：每天睡前写 3 件开心的事"
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="action-insight" className="block text-sm font-medium text-ink-700">
              关联认知（可选）
            </label>
            <select
              id="action-insight"
              value={linkedInsightId || ''}
              onChange={(e) => setLinkedInsightId(e.target.value || null)}
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500"
            >
              <option value="">无（手动创建）</option>
              {insights.map((insight: typeof insights[0]) => (
                <option key={insight.id} value={insight.id}>
                  [{insight.category}] {insight.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="action-frequency" className="block text-sm font-medium text-ink-700">
              频率
            </label>
            <select
              id="action-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as 'once' | 'daily' | 'weekly' | 'custom')}
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500"
            >
              <option value="once">一次性</option>
              <option value="daily">每日</option>
              <option value="weekly">每周</option>
              <option value="custom">自定义</option>
            </select>
          </div>

          <div>
            <label htmlFor="action-due-date" className="block text-sm font-medium text-ink-700">
              截止日期（一次性行动可选）
            </label>
            <input
              id="action-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500"
            />
          </div>

          <div>
            <label htmlFor="action-reminder" className="block text-sm font-medium text-ink-700">
              提醒时间（可选，格式 HH:mm）
            </label>
            <input
              id="action-reminder"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-sun-600 px-4 py-2 text-sm font-medium text-white hover:bg-sun-700 disabled:opacity-50"
            >
              创建
            </button>
          </div>
        </form>
      </article>
    </div>
  )
}

function CompleteActionDialog({
  onClose,
  onComplete,
  actionTitle,
}: {
  onClose: () => void
  onComplete: (content: string) => void
  actionTitle: string
}) {
  const [content, setContent] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitted) return
    setSubmitted(true)
    onComplete(content.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <article className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">完成行动 · 复盘</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ink-400 hover:bg-ink-100"
            aria-label="关闭"
          >
            ✕
          </button>
        </header>

        <p className="mt-2 text-sm text-ink-600">行动：「{actionTitle}」</p>
        <p className="text-sm text-ink-500">这件事做完了吗？发生了什么？感受如何？符合预期吗？</p>

        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            maxLength={2000}
            placeholder="随便写写，不需要文采，只给自己看……"
            className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-sun-500 focus:outline-none focus:ring-1 focus:ring-sun-500 resize-none"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
            >
              稍后再说
            </button>
            <button
              type="submit"
              className="rounded-lg bg-forest-600 px-4 py-2 text-sm font-medium text-white hover:bg-forest-700"
            >
              保存复盘
            </button>
          </div>
        </form>
      </article>
    </div>
  )
}

export default function ActionsPage() {
  const save = useGameStore((state) => state.save)
  const { createAction, updateActionStatus, deleteAction, completeAction } = useGameStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [completingAction, setCompletingAction] = useState<{ id: string; title: string } | null>(null)

  const actions = save?.actions ?? []
  const insights = save?.insights ?? []
  const linkedInsights = insights.map((i: typeof insights[0]) => ({ id: i.id, title: i.title, category: i.category }))

  const handleStatusChange = (id: string, status: 'todo' | 'in_progress' | 'done' | 'paused') => {
    updateActionStatus({ actionId: id, status })
  }

  const handleComplete = (id: string) => {
    const action = actions.find((a: typeof actions[0]) => a.id === id)
    if (action) setCompletingAction({ id, title: action.title })
  }

  const handleCompleteConfirm = (content: string) => {
    if (completingAction) {
      completeAction({ actionId: completingAction.id, content })
      setCompletingAction(null)
    }
  }

  return (
    <div className="min-h-dvh bg-cream-50 pb-12 sm:pb-16">
      <header className="sticky top-0 z-10 border-b border-ink-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-5">
          <nav className="flex items-center gap-2 text-sm text-ink-500" aria-label="面包屑">
            <a href="#/city" className="hover:text-ink-700">城市</a>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-ink-900">我的行动</span>
          </nav>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">我的行动</h1>
          <p className="mt-1 text-sm text-ink-500">从认知出发，带一件小事回到现实。没完成也没关系，可以暂停，也可以放弃。</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        {actions.length === 0 ? (
          <section className="py-12 sm:py-16 text-center" aria-labelledby="empty-title">
            <h2 id="empty-title" className="text-lg font-medium text-ink-700">
              还没有行动
            </h2>
            <p className="mt-2 text-sm text-ink-500 max-w-xs mx-auto">
              去「人生档案」把一条确认过的认知「转化为行动」，或者直接新建一件想做的小事。
            </p>
            <button
              type="button"
              onClick={() => setShowCreateDialog(true)}
              className="mt-6 inline-flex items-center rounded-lg bg-sun-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sun-700"
            >
              新建第一个行动
            </button>
          </section>
        ) : (
          <>
            <div className="space-y-4" role="list" aria-label="行动列表">
              {actions.map((action: typeof actions[0]) => {
                const linkedInsight = insights.find((i: typeof insights[0]) => i.id === action.linkedInsightId) || null
                return (
                  <ActionCard
                    key={action.id}
                    action={action}
                    onStatusChange={handleStatusChange}
                    onDelete={deleteAction}
                    onComplete={handleComplete}
                    linkedInsight={linkedInsight ? { title: linkedInsight.title, category: linkedInsight.category } : null}
                  />
                )
              })}
            </div>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center rounded-lg border border-ink-200 bg-white px-5 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50"
              >
                + 新建行动
              </button>
            </div>
          </>
        )}
      </main>

      {showCreateDialog && (
        <CreateActionDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={createAction}
          insights={linkedInsights}
        />
      )}

      {completingAction && (
        <CompleteActionDialog
          onClose={() => setCompletingAction(null)}
          onComplete={handleCompleteConfirm}
          actionTitle={completingAction.title}
        />
      )}
    </div>
  )
}