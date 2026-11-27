import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Footprints, MessageCircle, NotebookPen, X } from 'lucide-react'
import { ArtImage } from '../../components/g/ArtImage'
import {
  chapterOneCity,
  chapterTwoOpen,
  lumiInvite,
  lumiNight,
  lumiPlaza,
  lumiReturn,
  type DialogueScript,
} from '../../data/dialogue'
import { chapterMeta } from '../../data/chapters'
import { scenes } from '../../data/scenes'
import { actionWindowLabels, actionStatusLabels } from '../../data/assets'
import { selectChapter2Eligible } from '../../domain/selectors'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { useCurtainStore } from '../../motion/curtainStore'
import { usePageMotion } from '../../motion/usePageMotion'
import { PaperButton, PaperSheet, Pin, Stamp } from '../../components/g/GPrimitives'
import { PageHeading } from '../../components/shell/Shell'
import CityMap from './CityMap'
import styles from './CityPage.module.css'

export default function CityPage() {
  const navigate = useNavigate()
  const save = useGameStore((state) => state.save)
  const dismissInvite = useGameStore((state) => state.dismissInvite)
  const markLumiMet = useGameStore((state) => state.markLumiMet)
  const markScriptPlayed = useGameStore((state) => state.markScriptPlayed)
  const unlockChapter2 = useGameStore((state) => state.unlockChapter2)
  const openDialogue = useUIStore((state) => state.openDialogue)
  const showToast = useUIStore((state) => state.showToast)
  const openCurtain = useCurtainStore((state) => state.openCurtain)
  const scopeRef = usePageMotion<HTMLDivElement>({ stagger: 0.08 })
  const activeActions = save.actions.filter((action) => action.status !== 'done').slice(0, 3)
  const exploredCount = save.progress.exploredSceneIds.length
  const inviteVisible = save.settings.invitationsEnabled && !save.city.inviteDismissedAt
  const chapter = chapterMeta(save.progress.chapter)

  const playScript = useCallback((script: DialogueScript) => {
    if (save.city.playedScriptIds.includes(script.id)) return
    markScriptPlayed(script.id)
    openDialogue({ lines: script.lines, onFinish: script.onFinish })
  }, [markScriptPlayed, openDialogue, save.city.playedScriptIds])

  useEffect(() => {
    if (selectChapter2Eligible(save)) {
      unlockChapter2()
      openCurtain({
        code: 'CHAPTER 02',
        title: '雨停之后',
        subtitle: '日光 · 熟路',
        theme: 'sun',
        onDone: () => openDialogue({ lines: chapterTwoOpen.lines }),
      })
      return
    }
    playScript(chapterOneCity)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function meetLumi() {
    markLumiMet()
    const hour = new Date().getHours()
    if (save.city.lumiMetAt && (hour >= 20 || hour < 5)) {
      openDialogue({ lines: lumiNight.lines })
      return
    }
    if (save.city.lumiMetAt && save.progress.exploredSceneIds.includes('plaza') && !save.city.playedScriptIds.includes(lumiPlaza.id)) {
      playScript(lumiPlaza)
      return
    }
    if (save.city.lumiMetAt) {
      openDialogue({ lines: lumiReturn.lines })
      return
    }
    playScript(lumiInvite)
  }

  return (
    <div ref={scopeRef} className={styles.cityPage}>
      <PageHeading
        code={chapter.code}
        title="未完成之城"
        description="地图不是答案，只是一张可以慢慢走的地方。选择一处，让今天发生一点变化。"
        action={<PaperButton onClick={() => navigate('/journal?new=1')}><NotebookPen size={18} aria-hidden="true" />写一篇日记</PaperButton>}
      />

      <div className={styles.cityGrid} data-motion>
        <div className={styles.mapColumn}>
          <CityMap exploredSceneIds={save.progress.exploredSceneIds} />
          <PaperSheet className={styles.index} aria-labelledby="scene-index-title">
            <header><div><span>地点索引</span><h2 id="scene-index-title">从哪一条路开始？</h2></div><Stamp tone="ink">已探索 {exploredCount} / {scenes.length}</Stamp></header>
            <ul>
              {scenes.map((scene) => {
                const explored = save.progress.exploredSceneIds.includes(scene.id)
                return (
                  <li key={scene.id}>
                    <button type="button" onClick={() => navigate(`/scene/${scene.id}`)}>
                      <span className={styles.sceneCode}>{scene.code}</span>
                      <span><strong>{scene.title}</strong><small>{scene.kicker}</small></span>
                      {explored ? <span className={styles.explored}><Check size={15} aria-hidden="true" />到过</span> : <ArrowRight size={18} aria-hidden="true" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </PaperSheet>
        </div>

        <aside className={styles.contextColumn} aria-label="城市语境栏">
          <PaperSheet className={styles.report} halftone>
            <header className={styles.reportHeader}><span>城市周报</span><strong>NO. 00{save.progress.chapter}</strong></header>
            <h2>{chapter.weeklyHeadline}</h2>
            <p>{chapter.weeklyBody}</p>
            <dl>
              <div><dt>天气</dt><dd>晴 / 18:40</dd></div>
              <div><dt>今日步调</dt><dd>缓慢</dd></div>
              <div><dt>已探索</dt><dd>{exploredCount} 个地点</dd></div>
            </dl>
            <div className={styles.reportRule} />
            <p className={styles.reportNote}>“先生活，再认识自己。”</p>
          </PaperSheet>

          <PaperSheet className={styles.queue} aria-labelledby="queue-title">
            <header><h2 id="queue-title">现实行动</h2><button type="button" onClick={() => navigate('/actions')}>全部</button></header>
            {activeActions.length ? (
              <ul>
                {activeActions.map((action) => (
                  <li key={action.id}>
                    <span className={`${styles.statusMark} ${styles[action.status]}`} aria-hidden="true" />
                    <div><strong>{action.title}</strong><small>{actionStatusLabels[action.status]} · {actionWindowLabels[action.when]}</small></div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.smallEmpty}><Footprints size={25} aria-hidden="true" /><p>还没有待办。<br />从一件很小的事开始。</p><button type="button" onClick={() => navigate('/actions?new=1')}>添加行动</button></div>
            )}
          </PaperSheet>

          <PaperSheet className={styles.invite} aria-labelledby="invite-title">
            <Pin tone="sun" />
            <div className={styles.lumiRow}>
              <ArtImage artKey="avatar-qingtai" alt="微光角色插画" width="72" height="72" sizes="72px" />
              <div><span>微光 / LUMI</span><h2 key={save.city.lumiMetAt ? 'met' : inviteVisible ? 'open' : 'closed'} id="invite-title" className={styles.inviteTitleSwap}>{save.city.lumiMetAt ? '随时可以回来' : inviteVisible ? '广场有人等你' : '微光暂时不邀请'}</h2></div>
            </div>
            <p>{save.city.lumiMetAt ? '这里不评价快慢，只留下你愿意记住的部分。' : inviteVisible ? '不急着给今天下结论。先坐下，听一会儿。' : '邀请开关已关闭，你可以在设置中重新开启。'}</p>
            {inviteVisible && <div className={styles.inviteActions}><PaperButton size="small" intent="secondary" onClick={meetLumi}><MessageCircle size={16} aria-hidden="true" />{save.city.lumiMetAt ? '再聊一会儿' : '和微光聊聊'}</PaperButton>{!save.city.lumiMetAt && <button type="button" onClick={() => { dismissInvite(); showToast('今天的邀请已收起。', 'info') }}><X size={16} aria-hidden="true" />今天不聊</button>}</div>}
          </PaperSheet>
        </aside>
      </div>
    </div>
  )
}
