import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Archive, ArrowRight, BookOpen, Check, Eye, EyeOff, MapPin, Pencil, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react'
import { avatarOptions } from '../../data/assets'
import { ArtImage } from '../../components/g/ArtImage'
import { experienceKindLabels } from '../../data/experienceCatalog'
import { getScene } from '../../data/scenes'
import { selectActiveExperiences, selectInsightIsCurrent } from '../../domain/selectors'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { ConfirmDialog, ModalSheet } from '../../components/feedback/Feedback'
import { EmptyPaper, PaperButton, PaperSheet, PaperTag, Stamp } from '../../components/g/GPrimitives'
import { Field } from '../../components/forms/FormPrimitives'
import { PageHeading } from '../../components/shell/Shell'
import { usePageMotion } from '../../motion/usePageMotion'
import { useFlip } from '../../motion/useFlip'
import styles from './ArchivePage.module.css'

export default function ArchivePage() {
  const scopeRef = usePageMotion<HTMLDivElement>({ stagger: 0.08 })
  const save = useGameStore((state) => state.save)
  const setExperienceConsent = useGameStore((state) => state.setExperienceConsent)
  const deleteExperience = useGameStore((state) => state.deleteExperience)
  const restoreExperience = useGameStore((state) => state.restoreExperience)
  const updateSummary = useGameStore((state) => state.updateSummary)
  const showToast = useUIStore((state) => state.showToast)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeExperiences = selectActiveExperiences(save)
  const deletedExperiences = save.experiences.filter((experience) => experience.deletedAt !== null)
  const flipRef = useFlip<HTMLOListElement>([activeExperiences.map((experience) => experience.id).join('|')])
  const requestedId = searchParams.get('experience')
  const selected = activeExperiences.find((experience) => experience.id === requestedId) ?? activeExperiences[0]
  const currentInsights = save.insights.filter((insight) => selectInsightIsCurrent(insight.id, save) && (insight.status === 'confirmed' || insight.status === 'rewritten'))
  const avatar = avatarOptions.find((option) => option.id === save.profile.avatarId) ?? avatarOptions[0]
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [strikingId, setStrikingId] = useState<string | null>(null)
  const [deletedOpen, setDeletedOpen] = useState(false)
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [summaryTitle, setSummaryTitle] = useState(save.summary?.title ?? '')
  const [summaryText, setSummaryText] = useState(save.summary?.text ?? '')

  function selectExperience(id: string) {
    setSearchParams({ experience: id }, { replace: true })
  }

  // 先划线 0.45s 再落库移出，让「收起」有可感知的动作；无动画环境（jsdom / reduced）立即删
  function confirmDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    setDeleteTarget(null)
    const animated = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: no-preference)').matches
    if (!animated) {
      deleteExperience(target)
      showToast('经历已收起，可以从时间线下方恢复。', 'info')
      return
    }
    setStrikingId(target)
    window.setTimeout(() => {
      deleteExperience(target)
      setStrikingId(null)
      showToast('经历已收起，可以从时间线下方恢复。', 'info')
    }, 450)
  }

  function openSummary() {
    setSummaryTitle(save.summary?.title ?? `第 ${save.progress.chapter} 章 · 未完成之城`)
    setSummaryText(save.summary?.text ?? '仍有许多路线未抵达。但已经走了很远。')
    setSummaryOpen(true)
  }

  function saveSummary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!summaryTitle.trim() || !summaryText.trim()) return
    updateSummary(summaryTitle, summaryText)
    setSummaryOpen(false)
    showToast('阶段总结已装进档案夹。')
  }

  return (
    <div ref={scopeRef} className={styles.archivePage}>
      <PageHeading
        code="ARCHIVE / 001"
        title="人生档案"
        description="把真正发生过的事留在纸上。授权与否，都由你决定。"
        action={<PaperButton onClick={openSummary}><Pencil size={18} aria-hidden="true" />写阶段总结</PaperButton>}
      />

      <PaperSheet className={styles.profileStrip} as="header" data-motion>
        <ArtImage artKey={avatar?.artKey ?? 'avatar-chenguang'} alt={`${save.profile.name}的头像`} width="88" height="88" sizes="88px" />
        <div className={styles.identity}><span>城市居民 / CITY RESIDENT</span><h2>{save.profile.name}</h2><p>{save.profile.lifeStages.length ? save.profile.lifeStages.join(' · ') : '还在决定要以什么方式生活'}</p></div>
        <dl className={styles.profileStats}>
          <div><dt>已走过</dt><dd>{save.progress.exploredSceneIds.length}<small>处地点</small></dd></div>
          <div><dt>留下</dt><dd>{activeExperiences.length}<small>条经历</small></dd></div>
          <div><dt>允许回顾</dt><dd>{activeExperiences.filter((item) => item.consent).length}<small>条经历</small></dd></div>
        </dl>
        <Stamp tone="sun">CHAPTER {String(save.progress.chapter).padStart(2, '0')}</Stamp>
      </PaperSheet>

      <div className={styles.archiveGrid}>
        <section className={styles.timeline} aria-labelledby="timeline-title">
          <div className={styles.sectionHead}><div><p className={styles.kicker}>EXPERIENCE LOG</p><h2 id="timeline-title">经历时间线</h2></div><span>{String(activeExperiences.length).padStart(3, '0')} 页</span></div>
          {activeExperiences.length === 0 ? (
            <EmptyPaper title="档案夹还是空的" description="城市里没有替你准备假经历。去一个地点，留下你自己的第一页。" action={<PaperButton onClick={() => navigate('/city')}>去城市走走<ArrowRight size={18} aria-hidden="true" /></PaperButton>} />
          ) : (
            <ol ref={flipRef} className={styles.entries}>
              {activeExperiences.map((experience, index) => (
                <li key={experience.id} data-flip-key={experience.id} data-striking={strikingId === experience.id ? 'true' : undefined} className={[styles.entry, selected?.id === experience.id ? styles.entryActive : ''].filter(Boolean).join(' ')}>
                  <button className={styles.entryButton} type="button" onClick={() => selectExperience(experience.id)} aria-pressed={selected?.id === experience.id}>
                    <span className={styles.entryNumber} aria-hidden="true">{String(activeExperiences.length - index).padStart(3, '0')}</span>
                    <span className={styles.entryCopy}><span>{experienceKindLabels[experience.kind]} · {getScene(experience.sceneId)?.area ?? experience.sceneId}</span><strong>{experience.title}</strong><small>{new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(experience.occurredAt))}</small></span>
                    <ArtImage artKey={experience.artKey} alt="" width="112" height="84" sizes="112px" loading="lazy" decoding="async" />
                    <span className={styles.entryState}>{experience.consent ? <><Eye size={15} aria-hidden="true" />可回顾</> : <><EyeOff size={15} aria-hidden="true" />仅本机</>}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}
          {deletedExperiences.length > 0 && (
            <div className={styles.recycleArea}>
              <button type="button" className={styles.recycleToggle} onClick={() => setDeletedOpen((open) => !open)} aria-expanded={deletedOpen}><RotateCcw size={17} aria-hidden="true" />已收起 {deletedExperiences.length} 条经历<ArrowRight size={17} aria-hidden="true" /></button>
              {deletedOpen && <ul>{deletedExperiences.map((experience) => <li key={experience.id}><span>{experience.title}</span><PaperButton size="small" intent="secondary" onClick={() => { restoreExperience(experience.id); showToast('这条经历已回到时间线。') }}>恢复</PaperButton></li>)}</ul>}
            </div>
          )}
        </section>

        <aside className={styles.context} aria-label="档案详情与认知索引">
          {selected ? (
            <PaperSheet key={selected.id} className={styles.detail} as="article">
              <div className={styles.detailTop}><Stamp>{experienceKindLabels[selected.kind]}</Stamp><MapPin size={18} aria-hidden="true" /><span>{getScene(selected.sceneId)?.title ?? selected.sceneId}</span></div>
              <h2>{selected.title}</h2>
              <p className={styles.detailBody}>{selected.body}</p>
              <div className={styles.permissionBox}>
                <ShieldCheck size={23} aria-hidden="true" />
                <div><strong>{selected.consent ? '这条经历可以进入回顾' : '这条经历只留在这里'}</strong><p>{selected.consent ? '撤销后会立即退出阶段回顾的依据，日记仍不受影响。' : '打开授权后，它才可能成为阶段回顾的依据。'}</p></div>
                <button type="button" role="switch" aria-checked={selected.consent} aria-label="允许这条经历进入阶段回顾" className={styles.switch} onClick={() => { setExperienceConsent(selected.id, !selected.consent); showToast(selected.consent ? '已撤销授权，这条经历不再进入回顾。' : '已允许这条经历进入阶段回顾。', selected.consent ? 'info' : 'success') }}><span /></button>
              </div>
              <div className={styles.detailActions}>
                <PaperButton size="small" intent="secondary" onClick={() => navigate(`/scene/${selected.sceneId}`)}><MapPin size={16} aria-hidden="true" />回到现场</PaperButton>
                <PaperButton size="small" intent="quiet" onClick={() => setDeleteTarget(selected.id)}><Trash2 size={16} aria-hidden="true" />收起经历</PaperButton>
              </div>
            </PaperSheet>
          ) : (
            <PaperSheet className={styles.detail}><Archive size={32} aria-hidden="true" /><h2>等第一页故事</h2><p>选择一条经历后，可以在这里查看正文、授权或收起。</p></PaperSheet>
          )}

          <PaperSheet className={styles.cognition} as="section">
            <p className={styles.kicker}>COGNITIVE INDEX</p><h2>认知索引</h2>
            {currentInsights.length === 0 ? <p className={styles.cognitionEmpty}>还没有被你确认的观察。猜测只有经过你的判断，才会成为索引。</p> : <ul>{currentInsights.map((insight) => <li key={insight.id}><PaperTag>{insight.key}</PaperTag><p>{insight.status === 'rewritten' ? insight.rewrittenText : insight.text}</p><PaperButton size="small" intent="quiet" onClick={() => navigate(`/reflection?insight=${insight.id}`)}>查看依据<ArrowRight size={16} aria-hidden="true" /></PaperButton></li>)}</ul>}
          </PaperSheet>
        </aside>
      </div>

      <section className={styles.summaryCover} aria-labelledby="summary-title">
        <div className={styles.coverLeft}><p className={styles.coverCode}>CITY ARCHIVE / CHAPTER {String(save.progress.chapter).padStart(2, '0')}</p><h2 id="summary-title">{save.summary?.title ?? `第 ${save.progress.chapter} 章 · 进行中`}</h2><p>{save.summary?.text ?? '仍有许多路线未抵达。但已经走了很远。'}</p></div>
        <div className={styles.coverArt} aria-hidden="true"><svg viewBox="0 0 240 150"><path d="M12 125h216M35 125V65h43v60M93 125V35h55v90M164 125V78h42v47" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M48 79h17v16H48zm58-30h17v17h-17zm58 47h17v14h-17z" fill="var(--g-sun)" stroke="currentColor" strokeWidth="2" /><circle cx="192" cy="34" r="17" fill="var(--g-sky)" stroke="currentColor" strokeWidth="2" /></svg></div>
        <div className={styles.coverBottom}><span><BookOpen size={17} aria-hidden="true" />第 1 天 / 城市进行中</span><button type="button" onClick={openSummary}>{save.summary ? '编辑这一章' : '为这一章写几句话'}<Pencil size={16} aria-hidden="true" /></button></div>
      </section>

      {save.pastSummaries.length > 0 && (
        <section aria-label="往届章节">
          {save.pastSummaries.map((item, index) => (
            <PaperSheet key={`${item.updatedAt}-${index}`} className={styles.pastChapter}>
              <span className={styles.coverCode}>PAST / {String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </PaperSheet>
          ))}
        </section>
      )}

      <ConfirmDialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="把这条经历收起？" description="它会退出时间线和阶段回顾依据，但不会永久删除。你可以随时从“已收起”中恢复。" confirmLabel="收起经历" />
      <ModalSheet open={summaryOpen} onClose={() => setSummaryOpen(false)} title="写阶段总结" description="不是给故事下结论，只是记住这一章正在往哪里走。">
        <form className={styles.summaryForm} onSubmit={saveSummary} noValidate>
          <Field id="summary-title-input" label="这一章的名字" hint={`${summaryTitle.length} / 60`} required>
            <input id="summary-title-input" value={summaryTitle} onChange={(event) => setSummaryTitle(event.target.value)} maxLength={60} placeholder="给这一章一个名字" />
          </Field>
          <Field id="summary-text-input" label="此刻想留下的话" hint={`${summaryText.length} / 1200`} required>
            <textarea id="summary-text-input" value={summaryText} onChange={(event) => setSummaryText(event.target.value)} maxLength={1200} rows={6} placeholder="不是结论，只是现在想说的。" />
          </Field>
          <div><span>{summaryText.length} / 1200</span><PaperButton type="submit" disabled={!summaryTitle.trim() || !summaryText.trim()}><Check size={18} aria-hidden="true" />保存总结</PaperButton></div>
        </form>
      </ModalSheet>
    </div>
  )
}
