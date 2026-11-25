import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, Link2, LockKeyhole, Pencil, Plus, Trash2 } from 'lucide-react'
import { journalTypeLabels } from '../../data/assets'
import { getScene } from '../../data/scenes'
import { journalInputSchema } from '../../domain/schema'
import { selectJournals } from '../../domain/selectors'
import type { Journal, JournalInput, JournalType, Period } from '../../domain/types'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { Field, ChoiceGroup } from '../../components/forms/FormPrimitives'
import { ConfirmDialog, ModalSheet } from '../../components/feedback/Feedback'
import { EmptyPaper, PaperButton, PaperSheet, PaperTag, Stamp } from '../../components/g/GPrimitives'
import { PageHeading } from '../../components/shell/Shell'
import { usePageMotion } from '../../motion/usePageMotion'
import { firstJournal } from '../../data/dialogue'
import { sfx } from '../../motion/sound/SfxEngine'
import styles from './JournalPage.module.css'

const filters: { value: JournalType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'free', label: '自由记录' },
  { value: 'action', label: '行动复盘' },
  { value: 'insight', label: '关联认知' },
]
const periods: Period[] = ['早上', '下午', '傍晚', '夜里']

export default function JournalPage() {
  const scopeRef = usePageMotion<HTMLDivElement>({ stagger: 0.08 })
  const save = useGameStore((state) => state.save)
  const createJournal = useGameStore((state) => state.createJournal)
  const updateJournal = useGameStore((state) => state.updateJournal)
  const deleteJournal = useGameStore((state) => state.deleteJournal)
  const showToast = useUIStore((state) => state.showToast)
  const openDialogue = useUIStore((state) => state.openDialogue)
  const markScriptPlayed = useGameStore((state) => state.markScriptPlayed)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<JournalType | 'all'>('all')
  const journals = selectJournals(save, filter)
  const requestedId = searchParams.get('id')
  const selected = journals.find((journal) => journal.id === requestedId) ?? journals[0]
  const [editorOpen, setEditorOpen] = useState(searchParams.get('new') === '1')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [type, setType] = useState<JournalType>('free')
  const [text, setText] = useState('')
  const [period, setPeriod] = useState<Period>(save.progress.period)
  const [sceneId, setSceneId] = useState<string | null>(searchParams.get('scene'))
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  function openNew() {
    setEditingId(null)
    setType('free')
    setText('')
    setPeriod(save.progress.period)
    setSceneId(searchParams.get('scene'))
    setError('')
    setEditorOpen(true)
  }

  function openEdit(journal: Journal) {
    setEditingId(journal.id)
    setType(journal.type)
    setText(journal.text)
    setPeriod(journal.period)
    setSceneId(journal.sceneId)
    setError('')
    setEditorOpen(true)
  }

  function closeEditor() {
    setEditorOpen(false)
    if (searchParams.has('new')) {
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const input: JournalInput = {
      type,
      text,
      period,
      sceneId,
      linkLabel: sceneId ? `关联地点：${getScene(sceneId)?.title ?? sceneId}` : null,
      artKey: type === 'action' ? 'sketch-plane' : type === 'insight' ? 'sketch-map' : 'sketch-desk',
    }
    const parsed = journalInputSchema.safeParse(input)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '请检查这篇日记。')
      return
    }
    const id = editingId ?? createJournal(parsed.data)
    if (editingId) updateJournal(editingId, parsed.data)
    setEditorOpen(false)
    setSearchParams({ id }, { replace: true })
    showToast(editingId ? '日记已更新，仍然只保存在本机。' : '这一页已经收进私人日记。')
    sfx.play('paper-drop')
    if (!editingId && !save.city.playedScriptIds.includes(firstJournal.id)) {
      markScriptPlayed(firstJournal.id)
      openDialogue({ lines: firstJournal.lines })
    }
  }

  function changeFilter(nextFilter: JournalType | 'all') {
    setFilter(nextFilter)
    setSearchParams({}, { replace: true })
  }

  return (
    <div ref={scopeRef} className={styles.journalPage}>
      <PageHeading code="PRIVATE / 003" title="日记" description="这里没有评分，也没有读者。写下来的东西只保存在这台设备上。" action={<PaperButton onClick={openNew}><Plus size={18} aria-hidden="true" />写一页</PaperButton>} />
      <div className={styles.privacyLine} data-motion><LockKeyhole size={18} aria-hidden="true" /><span>私人记录</span><p>日记不会进入阶段回顾，也不会被当作猜测的依据。</p></div>

      <div className={styles.journalGrid} data-motion>
        <section className={styles.index} aria-labelledby="journal-index-title">
          <div className={styles.indexHead}><h2 id="journal-index-title">日期与类型</h2><span>{String(journals.length).padStart(2, '0')}</span></div>
          <div className={styles.filters} aria-label="日记类型筛选">{filters.map((item) => <PaperTag key={item.value} active={filter === item.value} pressed={filter === item.value} onClick={() => changeFilter(item.value)}>{item.label}</PaperTag>)}</div>
          {journals.length === 0 ? (
            <EmptyPaper title={filter === 'all' ? '还没有写过一页' : '这个分类还是空的'} description="不必等到想清楚再写。一句今天记住的小事，也算数。" action={<PaperButton size="small" intent="secondary" onClick={openNew}>写第一页</PaperButton>} />
          ) : (
            <ol key={filter} className={styles.journalList}>{journals.map((journal) => (
              <li key={journal.id} data-flip-key={journal.id}>
                <button type="button" className={styles.journalItem} onClick={() => setSearchParams({ id: journal.id }, { replace: true })} aria-pressed={selected?.id === journal.id}>
                  <span className={styles.itemDate}>{new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date(journal.createdAt)).replace('/', '.')}<small>{journal.period}</small></span>
                  <span className={styles.itemCopy}><strong>{journal.linkLabel ?? journalTypeLabels[journal.type]}</strong><p>{journal.text}</p><small>{journalTypeLabels[journal.type]}</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </li>
            ))}</ol>
          )}
        </section>

        <section className={styles.reader} aria-labelledby="reader-title">
          {selected ? (
            <PaperSheet className={styles.paper} as="article">
              <div className={styles.paperTop}><Stamp tone="sun">{journalTypeLabels[selected.type]}</Stamp><span>{new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(selected.createdAt))} · {selected.period}</span></div>
              <h2 id="reader-title">{selected.linkLabel ?? '今天留下的一页'}</h2>
              <div className={styles.privateWatermark} aria-hidden="true">PRIVATE</div>
              <p className={styles.journalText}>{selected.text}</p>
              {selected.actionId && <button type="button" className={styles.actionLink} onClick={() => navigate(`/actions?id=${selected.actionId}`)}><Link2 size={16} aria-hidden="true" />查看关联行动<ArrowRight size={16} aria-hidden="true" /></button>}
              <footer className={styles.paperFooter}><span><Check size={15} aria-hidden="true" />仅保存在本机</span><div><PaperButton size="small" intent="secondary" onClick={() => openEdit(selected)}><Pencil size={16} aria-hidden="true" />编辑</PaperButton><PaperButton size="small" intent="quiet" onClick={() => setDeleteTarget(selected.id)}><Trash2 size={16} aria-hidden="true" />删除</PaperButton></div></footer>
            </PaperSheet>
          ) : (
            <PaperSheet className={styles.emptyReader}><BookOpen size={40} aria-hidden="true" /><h2 id="reader-title">等一篇今天的日记</h2><p>选一页来读，或者从空白开始写。</p><PaperButton intent="secondary" onClick={openNew}>写一页</PaperButton></PaperSheet>
          )}
          <div className={styles.readerNote}><span aria-hidden="true">随手写，不必完整。</span><p>删除前会再次确认。行动复盘会自动出现在这里，也可以继续修改。</p></div>
        </section>
      </div>

      <ModalSheet open={editorOpen} onClose={closeEditor} title={editingId ? '编辑这一页' : '写一页日记'} description="只记录你愿意留给自己的内容。">
        <form className={styles.editorForm} onSubmit={submit}>
          <ChoiceGroup legend="这页是什么类型？" options={filters.filter((item) => item.value !== 'all').map((item) => ({ value: item.value, label: item.label }))} value={[type]} onChange={(value) => setType(value[0] as JournalType)} multiple={false} />
          <Field id="journal-period" label="记录时段"><select id="journal-period" value={period} onChange={(event) => setPeriod(event.target.value as Period)}>{periods.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field id="journal-text" label="想留下什么" hint={`${text.length} / 2000`} error={error} required><textarea id="journal-text" value={text} onChange={(event) => { setText(event.target.value); setError('') }} maxLength={2000} rows={9} autoFocus placeholder="今天有什么让你停了一下？" /></Field>
          <Field id="journal-scene" label="关联地点" hint="只用于回到现场，不会改变日记隐私。" optional><select id="journal-scene" value={sceneId ?? ''} onChange={(event) => setSceneId(event.target.value || null)}><option value="">不关联地点</option>{save.progress.exploredSceneIds.map((id) => <option key={id} value={id}>{getScene(id)?.title ?? id}</option>)}</select></Field>
          <div className={styles.editorActions}><PaperButton type="button" intent="secondary" onClick={closeEditor}>先不写</PaperButton><PaperButton type="submit" disabled={!text.trim()}><Check size={18} aria-hidden="true" />{editingId ? '保存修改' : '收进日记'}</PaperButton></div>
        </form>
      </ModalSheet>
      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deleteJournal(deleteTarget); showToast('这页日记已删除。', 'info') }} title="删除这篇日记？" description="删除后无法恢复。如果它是行动复盘，行动本身仍会保留，只是不再有关联日记。" confirmLabel="确认删除" />
    </div>
  )
}
