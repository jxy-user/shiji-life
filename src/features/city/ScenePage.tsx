import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Eye, Footprints, Map, MessageCircle, NotebookPen } from 'lucide-react'
import { ArtImage } from '../../components/g/ArtImage'
import { getScene, sceneNarrationAgain } from '../../data/scenes'
import { sceneFirstVisit } from '../../data/dialogue'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { EmptyPaper, PaperButton, PaperSheet, Stamp } from '../../components/g/GPrimitives'
import { PageHeading } from '../../components/shell/Shell'
import Typewriter from '../../motion/components/Typewriter'
import { usePageMotion } from '../../motion/usePageMotion'
import styles from './ScenePage.module.css'

export default function ScenePage() {
  const { sceneId } = useParams()
  const scene = getScene(sceneId)
  const navigate = useNavigate()
  const recordSceneVisit = useGameStore((state) => state.recordSceneVisit)
  const markScriptPlayed = useGameStore((state) => state.markScriptPlayed)
  const openDialogue = useUIStore((state) => state.openDialogue)
  const save = useGameStore((state) => state.save)
  const explored = useGameStore((state) => state.save.progress.exploredSceneIds.includes(sceneId ?? ''))
  const scopeRef = usePageMotion<HTMLDivElement>({ stagger: 0.1 })

  useEffect(() => {
    if (!scene) return
    recordSceneVisit(scene.id)
    const script = sceneFirstVisit[scene.id]
    if (script && !save.city.playedScriptIds.includes(script.id)) {
      markScriptPlayed(script.id)
      openDialogue({ lines: script.lines })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.id])

  if (!scene) {
    return <EmptyPaper title="这个地点还没有画进地图" description="场景地址可能不存在。回到城市，选择一处已命名的地方。" action={<PaperButton onClick={() => navigate('/city')}>回到城市</PaperButton>} />
  }

  const activeScene = scene
  const chapter = save.progress.chapter
  const alreadyExplored = save.progress.exploredSceneIds.includes(scene.id)
  const lede = chapter >= 2 && alreadyExplored
    ? sceneNarrationAgain[scene.id] ?? scene.lede
    : scene.lede

  function chooseAction(kind: string, eventId?: string) {
    if (kind === 'record') {
      navigate(`/journal?new=1&scene=${activeScene.id}&title=${encodeURIComponent(activeScene.actions[0]?.title ?? '')}`)
      return
    }
    if (kind === 'action') {
      navigate(`/actions?new=1&scene=${activeScene.id}&title=${encodeURIComponent(activeScene.actions[1]?.title ?? '')}`)
      return
    }
    if (kind === 'event' && eventId) {
      navigate(`/event/${eventId}?from=${activeScene.id}`)
      return
    }
    navigate('/city')
  }

  return (
    <div ref={scopeRef} className={styles.scenePage}>
      <PageHeading code={`${scene.code} / ${scene.area}`} title={scene.title} description={scene.kicker} action={<PaperButton intent="secondary" onClick={() => navigate('/city')}><Map size={18} aria-hidden="true" />返回城市</PaperButton>} />

      <div className={styles.sceneGrid} data-motion>
        <figure className={styles.illustration}>
          <ArtImage artKey={scene.artKey} alt={`${scene.title}内容插画`} width="900" height="1000" sizes="(max-width: 960px) 100vw, 55vw" fetchPriority="high" style={{ objectPosition: scene.objectPosition }} />
          <span className={styles.halftone} aria-hidden="true" />
          <figcaption><span>{scene.bar}</span><span>{scene.code} / {scene.area}</span></figcaption>
          <div className={styles.sceneStamp}><Stamp tone="sun">已抵达</Stamp></div>
        </figure>

        <div className={styles.scenePaperColumn} data-motion>
          <PaperSheet className={styles.scenePaper}>
            <span className={styles.kicker}>现场 / FIELD NOTE</span>
            <Typewriter as="h2" text={lede} speed={scene.id === 'far' ? 40 : 24} />
            <p className={styles.visited} role="status">{explored ? `已把“${scene.title}”记入本机探索记录。` : `正在抵达“${scene.title}”。`}</p>
            <div className={styles.actionList} aria-label="在这里可以做的事">
              {scene.actions.map((action) => (
                <button key={action.id} type="button" onClick={() => chooseAction(action.kind, action.eventId)}>
                  <span className={styles.actionIcon} aria-hidden="true">
                    {action.kind === 'record' ? <NotebookPen size={21} /> : action.kind === 'action' ? <Footprints size={21} /> : action.kind === 'event' ? <Eye size={21} /> : <Map size={21} />}
                  </span>
                  <span><strong>{action.title}</strong><small>{action.description}</small></span>
                  {action.kind === 'event' ? <MessageCircle size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
                </button>
              ))}
            </div>
            <footer>记录不是任务。你可以只来这里坐一会儿。</footer>
          </PaperSheet>

          {scene.id === 'plaza' && (
            <PaperSheet className={styles.eventNote}>
              <ArtImage artKey="sketch-oldman" alt="长椅上的老人速写" width="180" height="140" sizes="180px" loading="lazy" />
              <div><span>现场记录 004</span><h3>长椅上的老人</h3><p>长椅的另一端空着。要不要过去，由你决定。</p><button type="button" onClick={() => navigate('/event/bench?from=plaza')}>查看这次相遇<ArrowRight size={16} aria-hidden="true" /></button></div>
            </PaperSheet>
          )}
        </div>
      </div>
    </div>
  )
}
