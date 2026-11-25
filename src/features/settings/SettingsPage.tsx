import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Database, Eye, HardDrive, LockKeyhole, RotateCcw, ShieldCheck, Sun } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { SwitchRow } from '../../components/forms/FormPrimitives'
import { ConfirmDialog } from '../../components/feedback/Feedback'
import { PaperButton, PaperSheet, Stamp } from '../../components/g/GPrimitives'
import { PageHeading } from '../../components/shell/Shell'
import { usePageMotion } from '../../motion/usePageMotion'
import styles from './SettingsPage.module.css'

export default function SettingsPage() {
  const save = useGameStore((state) => state.save)
  const storageStatus = useGameStore((state) => state.storageStatus)
  const updateSettings = useGameStore((state) => state.updateSettings)
  const resetProgress = useGameStore((state) => state.resetProgress)
  const showToast = useUIStore((state) => state.showToast)
  const navigate = useNavigate()
  const scopeRef = usePageMotion<HTMLDivElement>({ stagger: 0.08 })
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <div ref={scopeRef} className={styles.settingsPage}>
      <PageHeading code="SETTING / 005" title="设置" description="把边界写清楚。哪些可以看、哪些留在本机，都由你决定。" />
      <div className={styles.settingsGrid}>
        <div className={styles.mainSettings}>
          <PaperSheet className={styles.permissionPaper} as="section" data-motion>
            <div className={styles.paperHead}><div><p className={styles.kicker}>PERMISSION REGISTER</p><h2>权限登记纸</h2></div><Stamp tone="sun">LOCAL FIRST</Stamp></div>
            <SwitchRow checked={save.settings.defaultExperienceConsent} onChange={(defaultExperienceConsent) => { updateSettings({ defaultExperienceConsent }); showToast('默认授权已更新，只影响之后的新经历。') }} label="新经历默认授权" description="只影响之后生成的经历。已有经历可在人生档案里逐条修改。" stateLabel={['默认关闭', '默认开启']} />
            <SwitchRow checked={save.settings.invitationsEnabled} onChange={(invitationsEnabled) => { updateSettings({ invitationsEnabled }); showToast(invitationsEnabled ? '微光邀请已开启。' : '微光邀请已关闭，已有对话不受影响。') }} label="接收微光邀请" description="控制城市页是否出现微光对话邀请。不会影响你自己打开的对话。" stateLabel={['关闭', '开启']} />
            <div className={styles.localPromise}><LockKeyhole size={20} aria-hidden="true" /><p>经历、日记、行动和设置都保存在当前浏览器。没有账号，没有上传，也不会读取旧版存档。</p></div>
          </PaperSheet>

          <PaperSheet className={styles.thresholdPaper} as="section" data-motion>
            <div className={styles.paperHead}><div><p className={styles.kicker}>FIXED THRESHOLD</p><h2>阶段回顾门槛</h2></div><ShieldCheck size={26} aria-hidden="true" /></div>
            <p className={styles.thresholdIntro}>门槛固定为 <strong>3 条授权经历 / 2 类地点</strong>，避免仅凭一条经历推测太多。</p>
            <div className={styles.ruler} aria-label="固定门槛：3 条经历，2 类地点">
              {[1, 2, 3].map((number) => <div key={number}><span>{number}</span><strong>{number === 3 ? '可以回顾' : '再等等'}</strong></div>)}
            </div>
            <div className={styles.categoryRuler}><span>1 类地点</span><i aria-hidden="true" /><span>2 类地点</span><strong>满足</strong></div>
            <p className={styles.thresholdFoot}>这是只读规则，不能调低。私人日记永远不会进入分析依据。</p>
          </PaperSheet>
        </div>

        <aside className={styles.dataColumn} aria-label="数据与重置">
          <PaperSheet className={styles.dataPaper} as="section" data-motion>
            <p className={styles.kicker}>LOCAL DATA</p><h2>这台设备上的数据</h2>
            <dl className={styles.dataStats}>
              <div><dt><Database size={17} aria-hidden="true" />经历</dt><dd>{save.experiences.length}</dd></div>
              <div><dt><Eye size={17} aria-hidden="true" />授权经历</dt><dd>{save.experiences.filter((item) => item.deletedAt === null && item.consent).length}</dd></div>
              <div><dt><Sun size={17} aria-hidden="true" />观察</dt><dd>{save.insights.length}</dd></div>
              <div><dt><RotateCcw size={17} aria-hidden="true" />行动</dt><dd>{save.actions.length}</dd></div>
              <div><dt><HardDrive size={17} aria-hidden="true" />日记</dt><dd>{save.journals.length}</dd></div>
            </dl>
            <div className={styles.storageStatus}><span className={storageStatus === 'ready' ? styles.ready : styles.warning} aria-hidden="true" /><div><strong>{storageStatus === 'ready' ? '本地存档正常' : storageStatus === 'broken' ? '存档需要处理' : '当前不可写入'}</strong><small title="保存键 shiji.life.v2">这次的新存档 · 仅本机</small></div></div>
          </PaperSheet>

          <PaperSheet className={styles.resetPaper} as="section" data-motion>
            <p className={styles.kicker}>NEW JOURNEY</p><h2>清空并重新开始</h2>
            <p>会清除这次旅程的经历、观察、行动、日记、设置与角色资料。此操作不可恢复。</p>
            <p className={styles.v1Notice}>旧版存档不会被读取、迁移或改写。</p>
            <PaperButton intent="ink" onClick={() => setResetOpen(true)}>清空本机数据</PaperButton>
          </PaperSheet>
          <button type="button" className={styles.backHome} onClick={() => navigate('/')}>回到开始页<ArrowRight size={17} aria-hidden="true" /></button>
        </aside>
      </div>
      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={() => { resetProgress(); showToast('本机旅程数据已清空。旧版存档未被改动。', 'warn'); navigate('/') }} title="确认清空这台设备上的旅程数据？" description="所有角色资料、经历、观察、行动与日记都会清除，且无法恢复。旧版存档不会被改动。" confirmLabel="确认清空" />
    </div>
  )
}
