import { useState, type FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, BookOpen, Check, MapPin, RotateCcw, ShieldCheck } from 'lucide-react'
import { ArtImage } from '../../components/g/ArtImage'
import { getEvent } from '../../data/events'
import { firstEvent } from '../../data/dialogue'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { ChoiceGroup, Field, SwitchRow } from '../../components/forms/FormPrimitives'
import { EmptyPaper, PaperButton, PaperSheet, Stamp } from '../../components/g/GPrimitives'
import { PageHeading } from '../../components/shell/Shell'
import { usePageMotion } from '../../motion/usePageMotion'
import EventResultTimeline from '../../motion/components/EventResultTimeline'
import { sfx } from '../../motion/sound/SfxEngine'
import styles from './EventPage.module.css'

export default function EventPage() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const event = getEvent(eventId)
  const navigate = useNavigate()
  const save = useGameStore((state) => state.save)
  const completeEvent = useGameStore((state) => state.completeEvent)
  const markScriptPlayed = useGameStore((state) => state.markScriptPlayed)
  const showToast = useUIStore((state) => state.showToast)
  const openDialogue = useUIStore((state) => state.openDialogue)
  const scopeRef = usePageMotion<HTMLDivElement>({ stagger: 0.1 })
  const completion = event ? save.events[event.id] : undefined
  const experience = completion ? save.experiences.find((item) => item.id === completion.experienceId) : undefined
  const [choiceId, setChoiceId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [consent, setConsent] = useState(save.settings.defaultExperienceConsent)
  // 只有本次提交触发的完成才播揭晓；刷新恢复完成态直接是终态
  const [justSubmitted, setJustSubmitted] = useState(false)

  if (!event) {
    return <EmptyPaper title="这次现场记录不存在" description="事件地址可能已经改变。回到城市，重新选择一处地点。" action={<PaperButton onClick={() => navigate('/city')}>回到城市</PaperButton>} />
  }

  const selectedChoice = event.choices.find((choice) => choice.id === (completion?.choiceId ?? choiceId))
  const fromScene = searchParams.get('from') || event.sceneId

  const activeEvent = event

  function submit(nextEvent: FormEvent<HTMLFormElement>) {
    nextEvent.preventDefault()
    if (!selectedChoice || completion) return
    completeEvent({
      eventId: activeEvent.id,
      sceneId: activeEvent.sceneId,
      choiceId: selectedChoice.id,
      title: activeEvent.title,
      body: `${selectedChoice.result}${reason.trim() ? `\n\n现场补充：${reason.trim()}` : ''}`,
      reason: reason.trim(),
      consent,
      artKey: activeEvent.artKey,
    })
    showToast('这次经历已保存。刷新页面也不会重复创建。')
    setJustSubmitted(true)
    sfx.play('whoosh')
    if (!save.city.playedScriptIds.includes(firstEvent.id)) {
      markScriptPlayed(firstEvent.id)
      openDialogue({ lines: firstEvent.lines })
    }
  }

  return (
    <div ref={scopeRef} className={styles.eventPage}>
      <PageHeading
        code={`${event.code} / ${event.kicker}`}
        title={event.title}
        description="选择你此刻真正想做的事。没有更好的答案，也不需要解释给所有人听。"
        action={<PaperButton intent="secondary" onClick={() => navigate(`/scene/${fromScene}`)}><MapPin size={18} aria-hidden="true" />回到{fromScene === 'plaza' ? '广场' : '现场'}</PaperButton>}
      />

      <div className={styles.eventGrid} data-motion>
        <figure className={styles.eventArt}>
          <ArtImage artKey={event.artKey} alt={`${event.title}现场速写`} width="900" height="760" sizes="(max-width: 960px) 100vw, 58vw" fetchPriority="high" />
          <span className={styles.artHalftone} aria-hidden="true" />
          <figcaption><span>现场 / PLAZA</span><span>18:40 / 风很轻</span></figcaption>
          <div className={styles.eventNumber}>004</div>
        </figure>

        {completion && selectedChoice ? (
          <EventResultTimeline play={justSubmitted}>
            <PaperSheet className={styles.result} aria-labelledby="result-title" data-reveal-sheet>
              <div className={styles.resultTop}><span data-reveal-stamp><Stamp tone="sun">已完成</Stamp></span><span>EVENT / {event.code}</span></div>
              <h2 id="result-title" data-reveal-row>这次相遇，已经留下。</h2>
              <p className={styles.choiceEcho} data-reveal-row>你的选择：{selectedChoice.label}</p>
              <blockquote data-reveal-row>{selectedChoice.result}</blockquote>
              {completion.reason && <div className={styles.reasonEcho} data-reveal-row><strong>现场补充</strong><p>{completion.reason}</p></div>}
              <div className={styles.consentEcho} data-reveal-row><ShieldCheck size={22} aria-hidden="true" /><div><strong>{experience?.consent ? '已授权用于阶段回顾' : '保留在本机，不进入回顾分析'}</strong><span>授权按这条经历单独保存，可在人生档案中修改。</span></div></div>
              <div className={styles.resultActions} data-reveal-row>
                <PaperButton intent="secondary" onClick={() => navigate(`/scene/${event.sceneId}`)}>回到广场</PaperButton>
                <PaperButton onClick={() => navigate(`/archive?experience=${completion.experienceId}`)}><BookOpen size={18} aria-hidden="true" />查看人生档案</PaperButton>
              </div>
              <p className={styles.idempotent} data-reveal-row><Check size={15} aria-hidden="true" />这次经历已经存进档案，刷新也不会多记一条。</p>
            </PaperSheet>
          </EventResultTimeline>
        ) : (
          <form onSubmit={submit}>
            <PaperSheet className={styles.eventForm}>
            <span className={styles.kicker}>现场记录 / CHOOSE ONE</span>
            <h2>{event.introduction}</h2>
            <ChoiceGroup
              legend="你想怎么做？"
              hint="只能选择一项。保存后，这次事件不会再次开放。"
              options={event.choices.map((choice) => ({ value: choice.id, label: choice.label, description: choice.description }))}
              value={choiceId ? [choiceId] : []}
              onChange={(value) => setChoiceId(value[0] ?? null)}
              multiple={false}
            />
            <Field id="event-reason" label="现场补充" hint={`最多 200 字。当前 ${reason.length} / 200`} optional>
              <textarea id="event-reason" value={reason} onChange={(changeEvent) => setReason(changeEvent.target.value)} maxLength={200} rows={3} placeholder="当时还想记住什么？" />
            </Field>
            <SwitchRow
              checked={consent}
              onChange={setConsent}
              label="把这次经历用于阶段回顾"
              description="只影响这条经历。关闭后仍会保存在本机档案，但不会成为认知分析依据。"
              stateLabel={['不授权', '授权']}
            />
            <div className={styles.formActions}>
              <PaperButton type="submit" disabled={!choiceId}><Check size={18} aria-hidden="true" />保存这次经历</PaperButton>
              {!choiceId && <span>先选择一个做法。</span>}
            </div>
            </PaperSheet>
          </form>
        )}
      </div>

      {!completion && (
        <div className={styles.bottomNote}><RotateCcw size={16} aria-hidden="true" />保存前可以重新选择；保存后仍可在档案里修改授权或软删除经历。<ArrowRight size={16} aria-hidden="true" /></div>
      )}
    </div>
  )
}
