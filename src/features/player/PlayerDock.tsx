import { useCallback, useEffect, useId, useRef } from 'react'
import { ChevronDown, ListMusic, Music2, Pause, Play, Repeat, Repeat1, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { ArtImage } from '../../components/g/ArtImage'
import { Stamp } from '../../components/g/GPrimitives'
import { useMotionStore } from '../../motion/motionStore'
import { useReducedMotion } from '../../motion/useReducedMotion'
import { useUIStore } from '../../store/uiStore'
import { audioEngine } from './audioEngine'
import { formatTime, usePlayerStore, type RepeatMode } from './playerStore'
import { tracks } from './tracks'
import styles from './PlayerDock.module.css'

const REPEAT_LABEL: Record<RepeatMode, string> = {
  off: '循环：关闭',
  all: '循环：列表',
  one: '循环：单曲',
}

/** 每次页面加载只自动播放一次，跨路由重挂载不重播。 */
let autoPlayAttempted = false

function nextRepeat(mode: RepeatMode): RepeatMode {
  if (mode === 'off') return 'all'
  if (mode === 'all') return 'one'
  return 'off'
}

export function PlayerDock() {
  const trackIndex = usePlayerStore((state) => state.trackIndex)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const currentTime = usePlayerStore((state) => state.currentTime)
  const duration = usePlayerStore((state) => state.duration)
  const volume = usePlayerStore((state) => state.volume)
  const muted = usePlayerStore((state) => state.muted)
  const repeat = usePlayerStore((state) => state.repeat)
  const expanded = usePlayerStore((state) => state.expanded)
  const status = usePlayerStore((state) => state.status)
  const setTrackIndex = usePlayerStore((state) => state.setTrackIndex)
  const setVolume = usePlayerStore((state) => state.setVolume)
  const setMuted = usePlayerStore((state) => state.setMuted)
  const setRepeat = usePlayerStore((state) => state.setRepeat)
  const setPlaying = usePlayerStore((state) => state.setPlaying)
  const setProgress = usePlayerStore((state) => state.setProgress)
  const setStatus = usePlayerStore((state) => state.setStatus)
  const setExpanded = usePlayerStore((state) => state.setExpanded)

  const dialogue = useUIStore((state) => state.dialogue)
  const introSeenAt = useMotionStore((state) => state.prefs.introSeenAt)
  const reduced = useReducedMotion()
  const introActive = !reduced && !introSeenAt
  const panelId = useId()
  const track = tracks[trackIndex] ?? null
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // 音频引擎事件 → store（只挂一次；组件常驻不卸载）
  useEffect(() => {
    audioEngine.setHandlers({
      onPlay: () => setPlaying(true),
      onPause: () => setPlaying(false),
      onEnd: () => {
        setPlaying(false)
        const state = usePlayerStore.getState()
        if (state.repeat === 'one') {
          audioEngine.play(tracks[state.trackIndex]?.id ?? '', state.volume, state.muted)
          return
        }
        if (state.repeat === 'all') {
          const nextIndex = (state.trackIndex + 1) % tracks.length
          setTrackIndex(nextIndex)
          audioEngine.play(tracks[nextIndex]?.id ?? '', state.volume, state.muted)
          return
        }
        const lastIndex = tracks.length - 1
        if (state.trackIndex < lastIndex) {
          const nextIndex = state.trackIndex + 1
          setTrackIndex(nextIndex)
          audioEngine.play(tracks[nextIndex]?.id ?? '', state.volume, state.muted)
        } else {
          setProgress(0, state.duration)
        }
      },
      onLoad: (loadedDuration) => {
        setStatus('ready')
        setProgress(0, loadedDuration)
      },
      onProgress: (time, total) => setProgress(time, total),
      onError: () => setStatus('error'),
    })
    return () => audioEngine.setHandlers(null)
  }, [setPlaying, setProgress, setStatus, setTrackIndex])

  // 音量/静音实时同步到引擎
  useEffect(() => {
    audioEngine.setVolume(volume, muted)
  }, [volume, muted])

  // 对话打开时自动收起展开面板
  useEffect(() => {
    if (dialogue) setExpanded(false)
  }, [dialogue, setExpanded])

  // 用户手势解锁 howler（与全局 sfx.resume 并行，不重复）
  useEffect(() => {
    const warm = () => audioEngine.warmup()
    window.addEventListener('pointerdown', warm, { once: true, capture: true })
    return () => window.removeEventListener('pointerdown', warm, { capture: true })
  }, [])

  // 进入旅程页自动播放第一首；浏览器拦截有声自动播放时，等首次交互后补播
  useEffect(() => {
    if (introActive || autoPlayAttempted || tracks.length === 0) return
    autoPlayAttempted = true
    let cancelled = false

    const startBlocked = () => {
      const state = usePlayerStore.getState()
      const target = tracks[state.trackIndex]
      if (!target) return
      state.setStatus('loading')
      void audioEngine.startFromAutoplay(target.id, state.volume, state.muted).then((started) => {
        if (cancelled || started) return
        const retry = () => {
          const next = usePlayerStore.getState()
          const retryTrack = tracks[next.trackIndex]
          if (!retryTrack) return
          void audioEngine.resumeAndPlay(retryTrack.id, next.volume, next.muted)
        }
        window.addEventListener('pointerdown', retry, { once: true, capture: true })
        window.addEventListener('keydown', retry, { once: true, capture: true })
      })
    }

    // 等一拍，避开首屏路由挂载与页面入场动画
    const timer = window.setTimeout(startBlocked, 600)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [introActive])

  const playTrack = useCallback((index: number) => {
    const target = tracks[index]
    if (!target) return
    setStatus('loading')
    void audioEngine.play(target.id, volume, muted)
  }, [setStatus, volume, muted])

  const handleToggle = useCallback(() => {
    if (!track) return
    if (isPlaying) {
      audioEngine.pause()
      return
    }
    playTrack(trackIndex)
  }, [track, isPlaying, trackIndex, playTrack])

  const handlePrev = useCallback(() => {
    if (tracks.length === 0) return
    const nextIndex = (trackIndex - 1 + tracks.length) % tracks.length
    setTrackIndex(nextIndex)
    playTrack(nextIndex)
  }, [trackIndex, setTrackIndex, playTrack])

  const handleNext = useCallback(() => {
    if (tracks.length === 0) return
    const nextIndex = (trackIndex + 1) % tracks.length
    setTrackIndex(nextIndex)
    playTrack(nextIndex)
  }, [trackIndex, setTrackIndex, playTrack])

  const handleSeek = useCallback((value: number) => {
    audioEngine.seek(value)
    setProgress(value, duration)
  }, [duration, setProgress])

  const handleExpand = useCallback(() => {
    if (!expanded) {
      setExpanded(true)
      // 展开后把焦点移入面板，方便键盘操作
      window.requestAnimationFrame(() => panelRef.current?.focus())
      return
    }
    setExpanded(false)
    toggleRef.current?.focus()
  }, [expanded, setExpanded])

  const onPanelKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      setExpanded(false)
      toggleRef.current?.focus()
    }
  }, [setExpanded])

  if (!track || introActive) return null

  const progressMax = duration > 0 ? duration : track.duration
  const progressValue = Math.min(currentTime, progressMax)
  const progressPercent = progressMax > 0 ? (progressValue / progressMax) * 100 : 0
  const volumePercent = muted ? 0 : Math.round(volume * 100)
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat
  const statusText = status === 'error'
    ? '音轨暂不可用'
    : status === 'loading'
      ? '缓冲中…'
      : isPlaying
        ? '正在播放'
        : '轻音乐'

  return (
    <div className={styles.dock} data-expanded={expanded ? 'true' : 'false'} data-dialogue={dialogue ? 'true' : 'false'} role="region" aria-label="治愈音乐播放器">
      {/* 折叠徽标：常驻，展开时收起在面板下方 */}
      <button
        ref={toggleRef}
        type="button"
        className={styles.badge}
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-label={expanded ? '收起音乐播放器' : '展开音乐播放器'}
        onClick={handleExpand}
      >
        <span className={styles.disc} data-playing={isPlaying ? 'true' : 'false'} aria-hidden="true">
          <Music2 size={20} strokeWidth={2.4} />
        </span>
      </button>

      {/* 展开面板：常驻 DOM，折叠时 hidden 保证 aria-controls 的 idref 有效 */}
      <div
        ref={panelRef}
        id={panelId}
        className={styles.panel}
        hidden={!expanded}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
      >
        <header className={styles.panelHead}>
          <span className={styles.panelCode}>MUSIC / 治愈频道</span>
          <Stamp tone="sun">轻音乐</Stamp>
          <button type="button" className={styles.collapse} onClick={handleExpand} aria-label="收起播放面板">
            <ChevronDown size={20} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.nowPlaying}>
          <span className={styles.cover}>
            {expanded && <ArtImage artKey={track.artKey} alt="" width="76" height="76" sizes="76px" />}
          </span>
          <div className={styles.meta}>
            <strong>{track.title}</strong>
            <small>{track.artist}</small>
            <span className={styles.statusLine} data-status={status} aria-live="polite">{statusText}</span>
          </div>
        </div>

        <div className={styles.progressRow}>
          <input
            className={styles.range}
            type="range"
            min={0}
            max={Math.max(progressMax, 1)}
            step={1}
            value={progressValue}
            onChange={(event) => handleSeek(Number(event.target.value))}
            aria-label="播放进度"
            aria-valuetext={`${formatTime(progressValue)} / ${formatTime(progressMax)}`}
            style={{ ['--fill' as string]: `${progressPercent}%` }}
          />
          <div className={styles.timeRow}>
            <span>{formatTime(progressValue)}</span>
            <span>{formatTime(progressMax)}</span>
          </div>
        </div>

        <div className={styles.controls}>
          <button type="button" className={styles.ctrl} onClick={() => setRepeat(nextRepeat(repeat))} aria-label={REPEAT_LABEL[repeat]} data-active={repeat !== 'off' ? 'true' : 'false'}>
            <RepeatIcon size={20} aria-hidden="true" />
          </button>
          <button type="button" className={styles.ctrl} onClick={handlePrev} aria-label="上一首">
            <SkipBack size={22} aria-hidden="true" />
          </button>
          <button type="button" className={styles.playBtn} onClick={handleToggle} aria-label={isPlaying ? '暂停' : '播放'} data-playing={isPlaying ? 'true' : 'false'}>
            {isPlaying ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
          </button>
          <button type="button" className={styles.ctrl} onClick={handleNext} aria-label="下一首">
            <SkipForward size={22} aria-hidden="true" />
          </button>
          <button type="button" className={styles.ctrl} onClick={() => setMuted(!muted)} aria-label={muted ? '取消静音' : '静音'} data-active={muted ? 'true' : 'false'}>
            {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
          </button>
        </div>

        <div className={styles.volumeRow}>
          <VolumeX size={16} aria-hidden="true" />
          <input
            className={styles.range}
            type="range"
            min={0}
            max={100}
            step={1}
            value={volumePercent}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            aria-label="音量"
            aria-valuetext={`${volumePercent}%`}
            style={{ ['--fill' as string]: `${volumePercent}%` }}
          />
          <span className={styles.volumeValue}>{volumePercent}%</span>
        </div>

        <div className={styles.playlist}>
          <p className={styles.playlistHead}><ListMusic size={16} aria-hidden="true" />播放列表</p>
          <ol>
            {tracks.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.trackItem}
                  aria-current={index === trackIndex ? 'true' : undefined}
                  onClick={() => {
                    setTrackIndex(index)
                    playTrack(index)
                  }}
                >
                  <span className={styles.trackCode}>{String(index + 1).padStart(2, '0')}</span>
                  <span className={styles.trackName}>{item.title}</span>
                  <span className={styles.trackDuration}>{formatTime(item.duration)}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
