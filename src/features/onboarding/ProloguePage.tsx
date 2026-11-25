import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, DoorOpen, Map, SkipForward } from 'lucide-react'
import { letterText, prologueBeats } from '../../data/prologue'
import { ArtImage } from '../../components/g/ArtImage'
import { useGameStore } from '../../store/gameStore'
import { ModalSheet } from '../../components/feedback/Feedback'
import { PaperButton, Stamp } from '../../components/g/GPrimitives'
import Typewriter from '../../motion/components/Typewriter'
import { useCurtainStore } from '../../motion/curtainStore'
import styles from './ProloguePage.module.css'

export default function ProloguePage() {
  const navigate = useNavigate()
  const step = useGameStore((state) => state.save.progress.prologueStep)
  const setPrologueStep = useGameStore((state) => state.setPrologueStep)
  const openCurtain = useCurtainStore((state) => state.openCurtain)
  const [letterOpen, setLetterOpen] = useState(false)
  const activeStep = Math.min(step, prologueBeats.length - 1)
  const beat = prologueBeats[activeStep]!

  const advance = useCallback(() => {
    if (activeStep >= prologueBeats.length - 1) {
      navigate('/create')
      openCurtain({
        code: 'CHAPTER 01',
        title: '初入未完成之城',
        subtitle: '门后是日光，和一条可以慢慢走的路。',
        theme: 'rain',
      })
      return
    }
    setPrologueStep(activeStep + 1)
  }, [activeStep, navigate, openCurtain, setPrologueStep])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space' || letterOpen) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest('button, a, input, textarea, select, dialog')) return
      event.preventDefault()
      advance()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [advance, letterOpen])

  return (
    <div className={styles.prologue}>
      <figure className={styles.scene}>
        <ArtImage artKey="night-room" alt="雨夜房间里亮着一盏灯的插画" width="900" height="1100" sizes="(max-width: 960px) 100vw, 52vw" fetchPriority="high" />
        <div className={styles.rain} aria-hidden="true" />
        <figcaption><span>00:17</span><span>雨 / 房间</span></figcaption>
        <div className={styles.windowGlow} aria-hidden="true" />
      </figure>

      <section className={styles.script} aria-labelledby="beat-title">
        <div className={styles.topLine}>
          <span>{beat.code}</span>
          <button type="button" onClick={() => navigate('/create')}><SkipForward size={17} aria-hidden="true" />跳过序章</button>
        </div>
        <div className={styles.progress} role="progressbar" aria-label="序章进度" aria-valuemin={1} aria-valuemax={prologueBeats.length} aria-valuenow={activeStep + 1} aria-valuetext={`第 ${activeStep + 1} 步，共 ${prologueBeats.length} 步`}>
          {prologueBeats.map((item, index) => <span key={item.code} className={index <= activeStep ? styles.progressActive : ''} />)}
        </div>
        <div className={styles.beat} key={beat.code} aria-live="polite">
          <Stamp tone="ink">序章</Stamp>
          <h1 id="beat-title">{beat.title}</h1>
          <Typewriter className={styles.beatText} text={beat.text} />
          <blockquote className={styles.beatNote}>{beat.note}</blockquote>
        </div>

        {activeStep === 1 ? (
          <div className={styles.choices} aria-label="信的处理方式">
            <PaperButton onClick={() => setLetterOpen(true)}><BookOpen size={18} aria-hidden="true" />把信读完</PaperButton>
            <PaperButton intent="secondary" onClick={advance}><ArrowRight size={18} aria-hidden="true" />先放下</PaperButton>
          </div>
        ) : activeStep === 4 ? (
          <PaperButton className={styles.next} onClick={advance}><DoorOpen size={19} aria-hidden="true" />推门，进入登记页</PaperButton>
        ) : (
          <PaperButton className={styles.next} onClick={advance}>{activeStep === 2 ? <Map size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}继续</PaperButton>
        )}

        <footer className={styles.footer}>
          <span><kbd>Space</kbd> 也可以继续</span>
          <span>{activeStep + 1} / {prologueBeats.length}</span>
        </footer>
      </section>

      <ModalSheet open={letterOpen} onClose={() => setLetterOpen(false)} title="桌上的信" description="一封没有署名的信。">
        <div className={styles.letter}>
          <span aria-hidden="true">TO: 旅人</span>
          <p>{letterText}</p>
          <small>—— 写于你来之前</small>
        </div>
        <div className={styles.letterActions}>
          <PaperButton intent="secondary" onClick={() => setLetterOpen(false)}>把信放回桌上</PaperButton>
          <PaperButton onClick={() => { setLetterOpen(false); advance() }}>折好，放进口袋</PaperButton>
        </div>
      </ModalSheet>
    </div>
  )
}
