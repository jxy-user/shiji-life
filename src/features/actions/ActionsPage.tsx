import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, CirclePause, Footprints, Link2, Pause, Play, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { actionStatusLabels, actionWindowLabels } from '../../data/assets'
import { ArtImage } from '../../components/g/ArtImage'
import { actionInputSchema } from '../../domain/schema'
import { selectInsightIsCurrent } from '../../domain/selectors'
import type { ActionStatus, ActionWindow } from '../../domain/types'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { Field, ChoiceGroup } from '../../components/forms/FormPrimitives'
import { ConfirmDialog, ModalSheet } from '../../components/feedback/Feedback'
import { EmptyPaper, PaperButton, PaperSheet, PaperTag, Stamp } from '../../components/g/GPrimitives'
import { PageHeading } from '../../components/shell/Shell'
import { usePageMotion } from '../../motion/usePageMotion'
import { useFlip } from '../../motion/useFlip'
import { firstActionDone } from '../../data/dialogue'
import { sfx } from '../../motion/sound/SfxEngine'
import styles from './ActionsPage.module.css'

const filters: { value: ActionStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'todo', label: '待办' },
  { value: 'doing', label: '进行中' },
  { value: 'paused', label: '暂停' },
  { value: 'done', label: '已完成' },
]
const windows = Object.entries(actionWindowLabels) as [ActionWindow, string][]

export default function ActionsPage() {
  const scopeRef = usePageMotion<HTMLDivElement>({ stagger: 0.08 })
  const save = useGameStore((state) => state.save)
  const createAction = useGameStore((state) => state.createAction)
  const changeActionStatus = useGameStore((state) => state.changeActionStatus)
  const completeAction = useGameStore((state) => state.completeAction)
  const repeatAction = useGameStore((state) => state.repeatAction)
  const deleteAction = useGameStore((state) => state.deleteAction)
  const showToast = useUIStore((state) => state.showToast)
  const openDialogue = useUIStore((state) => state.openDialogue)
  const markScriptPlayed = useGameStore((state) => state.markScriptPlayed)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<ActionStatus | 'all'>('all')
  const actions = save.actions.filter((action) => filter === 'all' || action.status === filter)
  const flipRef = useFlip<HTMLOListElement>([filter, actions.map((action) => `${action.id}:${action.status}`).join('|')])
  const requestedId = searchParams.get('id')
  const selected = actions.find((action) => action.id === requestedId) ?? actions[0]
  const [editorOpen, setEditorOpen] = useState(searchParams.get('new') === '1')
  const [title, setTitle] = useState(searchParams.get('title') ?? '')
  const [when, setWhen] = useState<ActionWindow>('today-week')
  const [insightId, setInsightId] = useState<string | null>(searchParams.get('insight'))
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const currentInsights = save.insights.filter((insight) => selectInsightIsCurrent(insight.id, save) && insight.status !== 'rejected')

  function openNew() {
    setTitle(searchParams.get('title') ?? '')
    setWhen('today-week')
    setInsightId(searchParams.get('insight'))
    setError('')
    setEditorOpen(true)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const sourceInsight = save.insights.find((insight) => insight.id === insightId)
    const parsed = actionInputSchema.safeParse({ title, when, sourceInsightId: insightId, sourceLabel: sourceInsight?.key ?? '自己的选择', artKey: 'sketch-plane' })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '请检查这项行动。')
      return
    }
    const id = createAction(parsed.data)
    setFilter('all')
    setSearchParams({ id }, { replace: true })
    setEditorOpen(false)
    showToast('行动已放进账本。从很小的一步开始。')
  }

  function changeFilter(nextFilter: ActionStatus | 'all') {
    setFilter(nextFilter)
    setSearchParams({}, { replace: true })
  }

  return (
    <div ref={scopeRef} className={styles.actionsPage}>
      <PageHeading code="ACTION / 004" title="现实行动" description="不是任务清单，是照顾自己的一种方式。没完成也没关系。" action={<PaperButton onClick={openNew}><Plus size={18} aria-hidden="true" />新建行动</PaperButton>} />
      <div className={styles.topbar} data-motion>
        <div className={styles.filters} aria-label="行动状态筛选">{filters.map((item) => <PaperTag key={item.value} active={filter === item.value} pressed={filter === item.value} onClick={() => changeFilter(item.value)}>{item.label}<span>{item.value === 'all' ? save.actions.length : save.actions.filter((action) => action.status === item.value).length}</span></PaperTag>)}</div>
        <span className={styles.ledgerCode}>AR / {String(save.actions.length).padStart(3, '0')}</span>
      </div>

      <div className={styles.actionsGrid}>
        <section className={styles.actionIndex} aria-labelledby="action-index-title">
          <div className={styles.sectionHead}><h2 id="action-index-title">行动账本</h2><span>{String(actions.length).padStart(2, '0')} 项</span></div>
          {actions.length === 0 ? (
            <EmptyPaper title={filter === 'all' ? '从一件小事开始' : '这个状态还没有行动'} description="小得不容易失败的事，也值得被记下来。" action={<PaperButton size="small" intent="secondary" onClick={openNew}>新建第一项行动</PaperButton>} />
          ) : (
            <ol ref={flipRef} className={styles.actionList}>{actions.map((action) => (
              <li key={action.id} data-flip-key={action.id}>
                <button type="button" className={styles.actionItem} onClick={() => setSearchParams({ id: action.id }, { replace: true })} aria-pressed={selected?.id === action.id}>
                  <span className={styles.statusMark} data-status={action.status} aria-hidden="true">{action.status === 'done' ? <Check size={18} /> : action.status === 'paused' ? <Pause size={17} /> : <span />}</span>
                  <span className={styles.actionCopy}><strong>{action.title}</strong><small>{actionWindowLabels[action.when]} · {actionStatusLabels[action.status]}</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </li>
            ))}</ol>
          )}
        </section>

        <section className={styles.actionDetail} aria-labelledby="action-detail-title">
          {selected ? (
            <PaperSheet className={styles.detailPaper} as="article">
              <div key={`${selected.id}:${selected.status}`} className={styles.detailTop} data-status={selected.status}><Stamp tone={selected.status === 'done' ? 'sun' : 'ink'}>{actionStatusLabels[selected.status]}</Stamp><span>{actionWindowLabels[selected.when]}</span></div>
              <h2 id="action-detail-title">{selected.title}</h2>
              <p className={styles.source}>{selected.sourceInsightId ? <Link2 size={17} aria-hidden="true" /> : <Footprints size={17} aria-hidden="true" />}{selected.sourceLabel}</p>
              <div className={styles.actionFigure}><ArtImage artKey={selected.artKey} alt="" width="520" height="250" sizes="(max-width: 720px) calc(100vw - 48px), 520px" loading="lazy" decoding="async" /><span aria-hidden="true">ONE SMALL STEP</span></div>
              <div className={styles.statusRoute} aria-label="行动状态路线">{filters.filter((item) => item.value !== 'all').map((item, index) => <span key={item.value} className={selected.status === item.value ? styles.routeActive : ''}><i aria-hidden="true">{index + 1}</i>{item.label}</span>)}</div>
              <div className={styles.primaryActions}>
                {selected.status === 'todo' && <PaperButton onClick={() => { changeActionStatus(selected.id, 'doing'); showToast(`已开始：${selected.title}`) }}><Play size={18} aria-hidden="true" />开始这件事</PaperButton>}
                {selected.status === 'doing' && <PaperButton onClick={() => { completeAction(selected.id); showToast('行动完成，已自动生成一篇复盘。'); sfx.play('impact'); sfx.play('complete'); if (!save.city.playedScriptIds.includes(firstActionDone.id)) { markScriptPlayed(firstActionDone.id); openDialogue({ lines: firstActionDone.lines }) } }}><Check size={18} aria-hidden="true" />完成并复盘</PaperButton>}
                {selected.status === 'paused' && <PaperButton onClick={() => { changeActionStatus(selected.id, 'doing'); showToast(`已继续：${selected.title}`) }}><Play size={18} aria-hidden="true" />继续这件事</PaperButton>}
                {selected.status === 'done' && <PaperButton onClick={() => { repeatAction(selected.id); showToast('行动已回到待办，可以再试一次。') }}><RotateCcw size={18} aria-hidden="true" />再做一次</PaperButton>}
                {(selected.status === 'todo' || selected.status === 'doing') && <PaperButton intent="secondary" onClick={() => { changeActionStatus(selected.id, 'paused'); showToast(`已暂停：${selected.title}`) }}><CirclePause size={18} aria-hidden="true" />先暂停</PaperButton>}
                <PaperButton intent="quiet" onClick={() => setDeleteTarget(selected.id)}><Trash2 size={17} aria-hidden="true" />删除行动</PaperButton>
              </div>
              {selected.status === 'done' && selected.autoReviewJournalId && <button type="button" className={styles.reviewLink} onClick={() => navigate(`/journal?id=${selected.autoReviewJournalId}`)}><span><strong>这篇行动已经自动留下复盘</strong><small>可以继续修改，也可以删除复盘。</small></span><ArrowRight size={20} aria-hidden="true" /></button>}
              {selected.status === 'paused' && <p className={styles.pauseNote}>暂停不是失败。等你有力气时，再回到这里。</p>}
            </PaperSheet>
          ) : (
            <PaperSheet className={styles.emptyDetail}><Footprints size={42} aria-hidden="true" /><h2 id="action-detail-title">先选一件小事</h2><p>从账本里选一项行动，开始、暂停或完成。</p></PaperSheet>
          )}
        </section>
      </div>

      <ModalSheet open={editorOpen} onClose={() => setEditorOpen(false)} title="新建一项现实行动" description="把它写成你随时能认出的一件小事。">
        <form className={styles.actionForm} onSubmit={submit}>
          <Field id="action-title" label="想做什么" hint="不超过 40 字。具体一点，但不用很大。" error={error} required><input id="action-title" value={title} onChange={(event) => { setTitle(event.target.value); setError('') }} maxLength={40} autoFocus placeholder="例如：今天下楼走十分钟" /></Field>
          <ChoiceGroup legend="什么时候做？" options={windows.map(([value, label]) => ({ value, label }))} value={[when]} onChange={(value) => setWhen(value[0] as ActionWindow)} multiple={false} />
          <Field id="action-insight" label="来自哪个观察" hint="只关联仍然有效、且你没有否认的观察。" optional><select id="action-insight" value={insightId ?? ''} onChange={(event) => setInsightId(event.target.value || null)}><option value="">自己的选择</option>{currentInsights.map((insight) => <option key={insight.id} value={insight.id}>{insight.key}</option>)}</select></Field>
          <div className={styles.formActions}><PaperButton type="button" intent="secondary" onClick={() => setEditorOpen(false)}>取消</PaperButton><PaperButton type="submit" disabled={!title.trim()}>放进行动账本</PaperButton></div>
        </form>
      </ModalSheet>
      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteAction(deleteTarget); showToast('行动已删除，关联的私人日记仍会保留。', 'info') }} title="删除这项行动？" description="行动会从账本移除。已经生成的私人日记不会删除，只会解除与行动的关联。" confirmLabel="删除行动" />
    </div>
  )
}
