import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Play, Settings, ShieldCheck } from 'lucide-react'
import { avatarOptions } from '../../data/assets'
import { ArtImage } from '../../components/g/ArtImage'
import { useGameStore } from '../../store/gameStore'
import { ConfirmDialog } from '../../components/feedback/Feedback'
import { PaperButton, Pin, Stamp } from '../../components/g/GPrimitives'
import { usePageMotion } from '../../motion/usePageMotion'
import { useMotionStore } from '../../motion/motionStore'
import styles from './StartPage.module.css'

export default function StartPage() {
  const navigate = useNavigate()
  const save = useGameStore((state) => state.save)
  const startNewJourney = useGameStore((state) => state.startNewJourney)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const hasSave = save.profile.createdAt !== null
  const avatar = avatarOptions.find((option) => option.id === save.profile.avatarId) ?? avatarOptions[0]!
  const scopeRef = usePageMotion<HTMLDivElement>({ stagger: 0.1 })
  // 复访（看过开屏）时给刊头一记盖章短签名，代替重复播放完整开屏
  const revisit = useMotionStore((state) => Boolean(state.prefs.introSeenAt))

  function beginJourney() {
    startNewJourney()
    navigate('/prologue')
  }

  return (
    <div ref={scopeRef} className={styles.cover}>
      <section className={styles.heroCopy} aria-labelledby="cover-title">
        <div className={styles.issueLine} data-motion><Stamp tone="ink" className={revisit ? styles.revisitStamp : undefined}>城市周刊 001</Stamp><span>本地生活实验</span></div>
        <h1 id="cover-title" data-motion><span>拾己</span><strong>LIFE</strong></h1>
        <p className={styles.tagline} data-motion>先生活，再认识自己。</p>
        <p className={styles.intro} data-motion>在没有标准答案的城市里，留下经历、写下一小步，慢慢拼出属于自己的生活。</p>
        <div className={styles.actions} data-motion>
          <PaperButton onClick={() => hasSave ? setConfirmOpen(true) : beginJourney()}>
            <Play size={18} fill="currentColor" aria-hidden="true" />开始新的旅程<ArrowRight size={18} aria-hidden="true" />
          </PaperButton>
          <PaperButton intent="secondary" disabled={!hasSave} onClick={() => navigate('/city')}>继续旅程</PaperButton>
          <Link className={styles.settingsLink} to="/settings"><Settings size={18} aria-hidden="true" />设置</Link>
        </div>
        <div className={styles.saveNote}>
          <ShieldCheck size={22} aria-hidden="true" />
          <div>
            <strong>{hasSave ? `本地存档 · 第 ${save.progress.day} 天 · ${save.profile.name}` : '还没有本地存档'}</strong>
            <span>{hasSave ? '记录只保存在这台设备，不会上传。' : '新旅程从空白档案开始，不包含演示记录。'}</span>
          </div>
        </div>
      </section>

      <section className={styles.collage} aria-label="拾己城市拼贴封面">
        <div className={styles.sun} aria-hidden="true" data-motion />
        <div className={styles.cityCard} data-motion>
          <span className={styles.cardCode}>CITY MAP / NOT FINISHED</span>
          <strong>未完成之城</strong>
          <svg viewBox="0 0 460 250" role="img" aria-label="城市街区示意地图">
            <path d="M20 198C82 164 88 110 150 124S238 213 310 171 352 69 437 78" fill="none" stroke="#141414" strokeWidth="7" strokeDasharray="11 9" />
            <path d="M49 32H151V86H49zM176 29H280V91H176zM304 106H430V180H304zM83 145H206V224H83z" fill="#a9c9d8" stroke="#141414" strokeWidth="3" />
            <circle cx="150" cy="124" r="12" fill="#d6422b" stroke="#141414" strokeWidth="3" />
            <circle cx="310" cy="171" r="9" fill="#f2b705" stroke="#141414" strokeWidth="3" />
            <text x="18" y="24" fill="#141414" fontSize="13" fontFamily="monospace">SUNSET / ROUTE 01</text>
            <text x="326" y="237" fill="#141414" fontSize="12" fontFamily="monospace">YOU ARE HERE</text>
          </svg>
          <span className={styles.mapLegend}><i aria-hidden="true" />起点仍未命名</span>
          <Pin />
        </div>

        <figure className={styles.avatarCard} data-motion>
          <ArtImage artKey={avatar.artKey} alt={`${avatar.name}角色插画`} width="320" height="420" sizes="(max-width: 720px) 70vw, 320px" fetchPriority="high" />
          <figcaption><span>居民 001</span><strong>{save.profile.createdAt ? save.profile.name : avatar.name}</strong></figcaption>
          <Pin tone="signal" />
        </figure>

        <figure className={styles.plazaCard} data-motion>
          <ArtImage artKey="plaza" alt="日光下的城市广场插画" width="420" height="260" sizes="(max-width: 720px) 100vw, 420px" fetchPriority="high" />
          <figcaption>广场 / 18:40</figcaption>
          <span className={styles.tape} aria-hidden="true" />
        </figure>

        <svg className={styles.palms} viewBox="0 0 180 260" aria-hidden="true">
          <path d="M96 254C90 186 102 124 83 52M84 60C55 32 24 38 7 63M83 58C113 24 151 31 171 58M85 65C57 69 37 91 31 119M88 62C119 66 140 86 148 114" fill="none" stroke="#141414" strokeWidth="10" strokeLinecap="square" />
        </svg>
        <span className={styles.verticalType} aria-hidden="true">LOS SANTOS / AFTERNOON</span>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={beginJourney}
        title="开始新的旅程？"
        description="这次的本机记录会被清空，旧版存档不会被读取或改写。已经导出的内容不会受影响。"
        confirmLabel="清空并重新开始"
      />
    </div>
  )
}
