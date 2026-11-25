import { useCallback, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '../useReducedMotion'
import { useMotionStore } from '../motionStore'
import { createIntroTimeline } from '../films/introSting'
import { sfx } from '../sound/SfxEngine'
import { art } from '../../data/assets'

/**
 * 首访开屏 sting：全屏覆盖层，播完或点「跳过」后标记 introSeenAt 并让位。
 * reduced-motion 或已看过时不渲染任何内容。
 */
export default function IntroGate() {
  const rootRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const [skipVisible, setSkipVisible] = useState(false)
  const reduced = useReducedMotion()
  const introSeenAt = useMotionStore((state) => state.prefs.introSeenAt)
  const markIntroSeen = useMotionStore((state) => state.markIntroSeen)

  const shouldPlay = !reduced && !introSeenAt

  const dismiss = useCallback(() => {
    markIntroSeen()
    document.getElementById('main-content')?.focus()
  }, [markIntroSeen])

  useEffect(() => {
    if (!shouldPlay) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shouldPlay, dismiss])

  useGSAP(
    () => {
      if (!shouldPlay) return
      document.documentElement.style.overflow = 'hidden'
      skipRef.current?.focus({ preventScroll: true })
      const tl = createIntroTimeline(rootRef.current!, () => markIntroSeen())
      tl.play()
      sfx.play('motif')
      const skipTimer = window.setTimeout(() => setSkipVisible(true), 700)
      return () => {
        window.clearTimeout(skipTimer)
        tl.kill()
        document.documentElement.style.overflow = ''
      }
    },
    { scope: rootRef, dependencies: [shouldPlay], revertOnUpdate: true },
  )

  if (!shouldPlay) return null

  return (
    <div ref={rootRef} className="g-film-root" role="region" aria-label="开屏动画">
      <div className="g-film-frame" aria-hidden="true">
        <div className="g-film-pin">
          <span className="pin-head" />
        </div>

        <figure className="g-film-map">
          <svg viewBox="0 0 460 250" role="img" aria-label="城市街区示意地图">
            <path d="M20 198C82 164 88 110 150 124S238 213 310 171 352 69 437 78" fill="none" stroke="#f4ebd8" strokeWidth="7" strokeDasharray="11 9" />
            <path d="M49 32H151V86H49zM176 29H280V91H176zM304 106H430V180H304zM83 145H206V224H83z" fill="#a9c9d8" stroke="#f4ebd8" strokeWidth="3" />
            <circle cx="150" cy="124" r="12" fill="#d6422b" stroke="#f4ebd8" strokeWidth="3" />
            <circle cx="310" cy="171" r="9" fill="#f2b705" stroke="#f4ebd8" strokeWidth="3" />
          </svg>
        </figure>

        <div className="g-film-cards">
          <figure className="g-film-card">
            <img className="art" src={art['night-room'].src} alt="" width="480" height="586" />
            <figcaption>00:17 / 雨 · 房间</figcaption>
          </figure>
          <figure className="g-film-card">
            <img className="art" src={art['plaza'].src} alt="" width="480" height="297" />
            <figcaption>18:40 / 广场</figcaption>
          </figure>
          <figure className="g-film-card">
            <img className="art" src={art['avatar-qingtai'].src} alt="" width="320" height="400" />
            <figcaption>居民 001 / 微光</figcaption>
          </figure>
        </div>

        <h1 className="g-film-title">
          <span className="char-row">
            {'拾己'.split('').map((char, index) => <span key={index} className="char">{char}</span>)}
          </span>
          <span className="char-row">
            {'LIFE'.split('').map((char, index) => <span key={index} className="char char-life">{char}</span>)}
          </span>
          <span className="underline" />
        </h1>

        <span className="g-film-stamp">城市周刊 001</span>

        <p className="g-film-claim">先生活，再认识自己。</p>
        <span className="g-film-out">未完成之城 · LOCAL ONLY</span>
      </div>

      <button ref={skipRef} type="button" className={`g-film-skip${skipVisible ? ' is-visible' : ''}`} onClick={dismiss}>
        跳过
      </button>
    </div>
  )
}
