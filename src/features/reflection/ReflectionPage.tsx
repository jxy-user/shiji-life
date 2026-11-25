import { useEffect } from 'react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, Eye, EyeOff, Lightbulb, Pencil, ShieldCheck, Sparkles, X } from 'lucide-react'
import { insightCatalog } from '../../data/insightCatalog'
import { getScene } from '../../data/scenes'
import { selectApprovedExperiences, selectInsightIsCurrent, selectReflectionStats } from '../../domain/selectors'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { ModalSheet } from '../../components/feedback/Feedback'
import { EmptyPaper, PaperButton, PaperSheet, Stamp } from '../../components/g/GPrimitives'
import { Field } from '../../components/forms/FormPrimitives'
import { PageHeading } from '../../components/shell/Shell'
import { usePageMotion } from '../../motion/usePageMotion'
import { reflectionUnlocked } from '../../data/dialogue'
import styles from './ReflectionPage.module.css'

const statusLabels = {
  guess: '这只是猜测',
  confirmed: '你说有点像我',
  rejected: '你说不太像我',
  rewritten: '换成你的说法',
} as const

export default function ReflectionPage() {
  const scopeRef = usePageMotion<HTMLDivElement>({ stagger: 0.08 })
  const save = useGameStore((state) => state.save)
  const setExperienceConsent = useGameStore((state) => state.setExperienceConsent)
  const ensureInsight = useGameStore((state) => state.ensureInsight)
  const judgeInsight = useGameStore((state) => state.judgeInsight)
  const showToast = useUIStore((state) => state.showToast)
  const openDialogue = useUIStore((state) => state.openDialogue)
  const markScriptPlayed = useGameStore((state) => state.markScriptPlayed)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const approved = selectApprovedExperiences(save)
  const stats = selectReflectionStats(save)
  const currentInsights = save.insights.filter((insight) => selectInsightIsCurrent(insight.id, save))
  const requestedId = searchParams.get('insight')
  const selected = currentInsights.find((insight) => insight.id === requestedId) ?? currentInsights[0]
  const staleInsight = save.insights.find((insight) => insight.id === requestedId && !selectInsightIsCurrent(insight.id, save))
  const [rewriteOpen, setRewriteOpen] = useState(false)
  const [rewriteText, setRewriteText] = useState('')
  const [endOpen, setEndOpen] = useState(false)

  useEffect(() => {
    if (!stats.eligible) return
    if (save.city.playedScriptIds.includes(reflectionUnlocked.id)) return
    markScriptPlayed(reflectionUnlocked.id)
    openDialogue({ lines: reflectionUnlocked.lines })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function createObservation() {
    if (!stats.eligible) return
    const sceneIds = new Set(approved.map((experience) => experience.sceneId))
    const candidate = [...insightCatalog].sort((a, b) =>
      b.scenes.filter((scene) => sceneIds.has(scene)).length - a.scenes.filter((scene) => sceneIds.has(scene)).length,
    )[0] ?? insightCatalog[0]
    if (!candidate) return
    const id = ensureInsight({ key: candidate.key, text: candidate.text, sourceExperienceIds: approved.map((experience) => experience.id) })
    setSearchParams({ insight: id }, { replace: true })
    showToast('微光留下了一个猜测。它不是答案，等你来判断。')
  }

  function beginRewrite() {
    setRewriteText(selected?.rewrittenText ?? selected?.text ?? '')
    setRewriteOpen(true)
  }

  function saveRewrite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected || !rewriteText.trim()) return
    judgeInsight(selected.id, 'rewritten', rewriteText)
    setRewriteOpen(false)
    showToast('这句话现在更接近你了。')
  }

  return (
    <div ref={scopeRef} className={styles.reflectionPage}>
      <PageHeading
        code="REVIEW / 002"
        title="阶段回顾"
        description="把散落的页摆在同一张桌上。只有你允许的经历，才会被一起看。"
        action={<PaperButton intent="secondary" onClick={() => setEndOpen(true)}>结束这次回顾</PaperButton>}
      />

      <div className={styles.thresholdBar} data-motion>
        <div><ShieldCheck size={24} aria-hidden="true" /><span>回顾门槛已固定</span></div>
        <p>至少 <strong>{save.settings.thresholdExperiences} 条</strong>经历，覆盖 <strong>{save.settings.thresholdCategories} 类</strong>地点。日记永远不会成为依据。</p>
        <div className={styles.progress} aria-label={`当前 ${stats.approvedCount} 条授权经历，覆盖 ${stats.categoryCount} 类地点`}><span>{stats.approvedCount} / {save.settings.thresholdExperiences} 条</span><span>{stats.categoryCount} / {save.settings.thresholdCategories} 类</span></div>
      </div>

      <div className={styles.reviewGrid}>
        <section className={styles.ledger} aria-labelledby="ledger-title">
          <div className={styles.sectionHead}><div><p className={styles.kicker}>CONSENT LEDGER</p><h2 id="ledger-title">授权账本</h2></div><Stamp tone="sun">{stats.eligible ? '可以回顾' : '等待更多页'}</Stamp></div>
          <p className={styles.ledgerIntro}>开关随时可改。关闭后，这条经历会立即退出分析。</p>
          {save.experiences.filter((experience) => experience.deletedAt === null).length === 0 ? (
            <EmptyPaper title="没有可以一起看的经历" description="先去城市留下一条真实经历，再回来决定是否授权。" action={<PaperButton onClick={() => navigate('/city')}>去城市<ArrowRight size={18} aria-hidden="true" /></PaperButton>} />
          ) : (
            <ul className={styles.ledgerList}>
              {save.experiences.filter((experience) => experience.deletedAt === null).map((experience) => (
                <li key={experience.id}>
                  <button type="button" role="switch" aria-checked={experience.consent} data-consent={experience.consent ? 'on' : 'off'} aria-label={`${experience.consent ? '撤销' : '允许'}回顾：${experience.title}`} className={styles.ledgerSwitch} onClick={() => { setExperienceConsent(experience.id, !experience.consent); showToast(experience.consent ? '已撤销授权，分析依据已更新。' : '已允许这条经历进入回顾。', experience.consent ? 'info' : 'success') }}>
                    <span className={styles.check} aria-hidden="true">{experience.consent && <Check size={17} />}</span>
                    <span className={styles.ledgerCopy}><strong>{experience.title}</strong><small>{getScene(experience.sceneId)?.title ?? experience.sceneId} · {new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric' }).format(new Date(experience.occurredAt))}</small></span>
                    <span className={styles.ledgerState}>{experience.consent ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}{experience.consent ? '参与' : '不参与'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.ledgerFoot}><span aria-hidden="true">LOCAL ONLY</span><p>授权记录保存在本机，不上传，也不读取你的日记。</p></div>
        </section>

        <section className={styles.observation} aria-labelledby="observation-title">
          <div className={styles.sectionHead}><div><p className={styles.kicker}>OBSERVATION PAPER</p><h2 id="observation-title">观察纸</h2></div><Lightbulb size={25} aria-hidden="true" /></div>
          {!stats.eligible ? (
            <EmptyPaper title="再等几页，也完全可以" description={`还需要 ${Math.max(0, save.settings.thresholdExperiences - stats.approvedCount)} 条授权经历、${Math.max(0, save.settings.thresholdCategories - stats.categoryCount)} 类地点。门槛不是为了催你，只是避免凭一条经历猜太多。`} />
          ) : !selected ? (
            <PaperSheet className={styles.invitePaper} torn>
              <Sparkles size={40} aria-hidden="true" />
              <p className={styles.kicker}>READY TO NOTICE</p>
              <h3>可以让微光试着看一眼了吗？</h3>
              <p>它会根据这些授权经历提出一个猜测，并把依据摊给你看。你可以说是，也可以说不是。</p>
              <PaperButton onClick={createObservation}>让微光留一个猜测<ArrowRight size={18} aria-hidden="true" /></PaperButton>
            </PaperSheet>
          ) : (
            <PaperSheet className={styles.observationPaper} torn>
              <div key={selected.status} className={styles.observationTop} data-status={selected.status}><Stamp tone={selected.status === 'guess' ? 'ink' : 'sun'}>{statusLabels[selected.status]}</Stamp><span>{selected.key}</span></div>
              <blockquote>{selected.status === 'rewritten' ? selected.rewrittenText : selected.text}</blockquote>
              <p className={styles.observationHint}>这不是关于你的定论，只是一张可以修改的便签。</p>
              <div className={styles.judgements} aria-label="判断这个观察">
                <PaperButton size="small" onClick={() => { judgeInsight(selected.id, 'confirmed'); showToast('你确认了这个猜测。它仍可以在档案里修改。') }}><Check size={17} aria-hidden="true" />有点像我</PaperButton>
                <PaperButton size="small" intent="secondary" onClick={() => { judgeInsight(selected.id, 'rejected'); showToast('已记下“不太像我”。这个猜测不会成为认知索引。', 'info') }}><X size={17} aria-hidden="true" />不太像我</PaperButton>
                <PaperButton size="small" intent="secondary" onClick={beginRewrite}><Pencil size={17} aria-hidden="true" />换成我的说法</PaperButton>
              </div>
              <div className={styles.sources}><h3>这条猜测的依据</h3><ol>{selected.sourceExperienceIds.map((id, index) => {
                const experience = save.experiences.find((item) => item.id === id)
                return experience ? <li key={id}><button type="button" onClick={() => navigate(`/archive?experience=${id}`)}><span>{String(index + 1).padStart(2, '0')}</span><span><strong>{experience.title}</strong><small>{getScene(experience.sceneId)?.title ?? experience.sceneId}</small></span><ArrowRight size={16} aria-hidden="true" /></button></li> : null
              })}</ol></div>
            </PaperSheet>
          )}
          {staleInsight && <div className={styles.staleNotice} role="status"><EyeOff size={20} aria-hidden="true" /><div><strong>这条观察的依据已经变化</strong><p>至少一条来源经历被撤销授权或收起，因此旧观察已退出当前分析。</p></div></div>}
        </section>
      </div>

      <ModalSheet open={rewriteOpen} onClose={() => setRewriteOpen(false)} title="换成更接近你的说法" description="不需要解释，也不需要写得完整。你愿意怎样说，就怎样写。">
        <form className={styles.rewriteForm} onSubmit={saveRewrite} noValidate>
          <Field id="rewrite-input" label="我的说法" hint={`${rewriteText.length} / 300`} required>
            <textarea id="rewrite-input" value={rewriteText} onChange={(event) => setRewriteText(event.target.value)} maxLength={300} rows={5} autoFocus placeholder="用你自己的话说说看。" />
          </Field>
          <div><span>{rewriteText.length} / 300</span><PaperButton type="submit" disabled={!rewriteText.trim()}>保存这句话</PaperButton></div>
        </form>
      </ModalSheet>
      <ModalSheet open={endOpen} onClose={() => setEndOpen(false)} title="这次回顾，先到这里" description="你可以随时回来，也可以改主意。">
        <p className={styles.endCopy}>这次一起看了 <strong>{stats.approvedCount} 条</strong>你允许的经历。微光没有找到答案，只是把一些页暂时摆在了同一张桌上。</p>
        <div className={styles.endActions}><PaperButton intent="secondary" onClick={() => setEndOpen(false)}>留在这一页</PaperButton><PaperButton onClick={() => navigate('/city')}>回到城市</PaperButton></div>
      </ModalSheet>
    </div>
  )
}
