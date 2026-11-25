import { Suspense, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowLeft, BatteryMedium, Sun } from 'lucide-react'
import { primaryNavigation, routeMeta } from '../../data/navigation'
import { useGameStore } from '../../store/gameStore'
import { StorageNotice } from '../feedback/Feedback'
import { PlayerDock } from '../../features/player/PlayerDock'
import styles from './Shell.module.css'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={[styles.brand, compact ? styles.brandCompact : ''].filter(Boolean).join(' ')}>
      <svg className={styles.brandMark} viewBox="0 0 40 40" aria-hidden="true">
        <path d="M5 5h13v30H5zM22 5h13v13H22zM22 22h13v13H22z" fill="currentColor" />
        <path d="M9 5v30M22 11h13M22 28h13" stroke="#f2b705" strokeWidth="4" />
      </svg>
      <span className={styles.brandCopy}><strong>拾己</strong><small>LIFE / CITY</small></span>
    </span>
  )
}

export function PrimaryNav() {
  const storageStatus = useGameStore((state) => state.storageStatus)
  return (
    <nav className={styles.primaryNav} aria-label="主导航">
      <ul>
        {primaryNavigation.map(({ to, label, code, icon: Icon }) => (
          <li key={to}>
            <NavLink to={to} aria-label={label} title={label} className={({ isActive }) => [styles.navLink, isActive ? styles.navLinkActive : ''].filter(Boolean).join(' ')}>
              <Icon size={21} strokeWidth={2.2} aria-hidden="true" />
              <span className={styles.navLabel}><span>{label}</span><small>{code}</small></span>
            </NavLink>
          </li>
        ))}
      </ul>
      <p className={styles.storageStatus}><span className={storageStatus === 'ready' ? styles.ready : styles.warning} aria-hidden="true" />{storageStatus === 'ready' ? '本地存档正常' : '存档需要处理'}</p>
    </nav>
  )
}

function backLabel(to: string) {
  if (to === '/city') return '返回城市'
  if (to === '/archive') return '返回人生档案'
  if (to === '/') return '返回开始页'
  if (to === '/prologue') return '返回序章'
  return '返回'
}

export function StatusStrip() {
  const progress = useGameStore((state) => state.save.progress)
  return (
    <div className={styles.statusStrip} aria-label={`第 ${progress.day} 天，${progress.period}，精力 ${progress.energy}`}>
      <span><Sun size={18} aria-hidden="true" /><span className="mono">第 {progress.day} 天</span><span className={styles.periodLabel}> · {progress.period}</span></span>
      <span><BatteryMedium size={18} aria-hidden="true" /><span className="mono">精力 {progress.energy}</span></span>
    </div>
  )
}

export function ArchiveBar() {
  const location = useLocation()
  const meta = routeMeta(location.pathname)
  const cityHome = location.pathname === '/city'
  return (
    <header className={styles.archiveBar}>
      <div className={styles.archiveBack}>
        {meta.backTo ? <Link className={styles.backLink} to={meta.backTo} aria-label={backLabel(meta.backTo)}><ArrowLeft size={20} aria-hidden="true" /><span>返回</span></Link> : <span className={styles.archiveRule} aria-hidden="true" />}
      </div>
      {cityHome ? <span aria-hidden="true" /> : <div className={styles.archiveTitle}><span>{meta.code}</span><strong>{meta.title}</strong></div>}
      <StatusStrip />
    </header>
  )
}

function PageLoading() {
  return (
    <div className={styles.pageLoading} role="status" aria-live="polite">
      <p className="boot-code">OPENING PAGE</p>
      <p>正在铺这一页纸。</p>
    </div>
  )
}

export function JourneyLayout() {
  const storageStatus = useGameStore((state) => state.storageStatus)
  const storageMessage = useGameStore((state) => state.storageMessage)
  const location = useLocation()
  return (
    <>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <div className={styles.journey}>
        <aside className={styles.sidebar}><BrandMark /><PrimaryNav /></aside>
        <div className={styles.journeyMain}>
          <ArchiveBar />
          <main id="main-content" className={styles.journeyContent} tabIndex={-1}>
            <div key={location.pathname} className={`${styles.contentFrame} page-enter`}>
              <StorageNotice status={storageStatus} message={storageMessage} />
              <Suspense fallback={<PageLoading />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
      <PlayerDock />
    </>
  )
}

export function OnboardingLayout() {
  const storageStatus = useGameStore((state) => state.storageStatus)
  const storageMessage = useGameStore((state) => state.storageMessage)
  return (
    <>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <header className={styles.onboardingHeader}>
        <Link to="/" aria-label="拾己 LIFE 开始页"><BrandMark /></Link>
        <div className={styles.onboardingMeta}><span>本地保存 · 不上传</span><Link to="/settings">设置</Link></div>
      </header>
      <main id="main-content" className={styles.onboardingContent} tabIndex={-1}>
        <StorageNotice status={storageStatus} message={storageMessage} />
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
    </>
  )
}

export function PageHeading({ code, title, description, action }: { code: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className={styles.pageHeading} data-motion>
      <div>
        <p className={styles.pageCode}>{code}</p>
        <h1>{title}</h1>
        {description && <p className={styles.pageDescription}>{description}</p>}
      </div>
      {action && <div className={styles.pageAction}>{action}</div>}
    </header>
  )
}
