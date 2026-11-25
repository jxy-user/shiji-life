import { useCallback, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { useReducedMotion } from '../useReducedMotion'
import { curtainThemeOf, useCurtainStore } from '../curtainStore'
import { createCurtainTimeline } from '../films/chapterCurtain'
import { sfx } from '../sound/SfxEngine'

/**
 * 全局章节过场幕布：调用方先导航、再 openCurtain；幕布作为纯视觉层盖在目标页上，
 * 播完、点「跳过」或按 Escape 后清场。
 * 根节点 pointer-events 为 none（只有跳过按钮可点），幕布不吞目标页交互。
 * reduced-motion 不渲染，直接触发 onDone。
 */
export default function ChapterCurtain() {
  const rootRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const [skipVisible, setSkipVisible] = useState(false)
  const reduced = useReducedMotion()
  const curtain = useCurtainStore((state) => state.curtain)
  const closeCurtain = useCurtainStore((state) => state.closeCurtain)

  const finish = useCallback(() => {
    const done = useCurtainStore.getState().curtain?.onDone
    closeCurtain()
    done?.()
  }, [closeCurtain])

  // reduced-motion 下不渲染幕布，但补触发 onDone，保持与完整播放一致的叙事衔接
  useEffect(() => {
    if (!curtain || !reduced) return
    const done = curtain.onDone
    closeCurtain()
    done?.()
  }, [curtain, reduced, closeCurtain])

  useEffect(() => {
    if (!curtain || reduced) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [curtain, reduced, finish])

  useGSAP(
    () => {
      if (!curtain || reduced) return
      document.documentElement.style.overflow = 'hidden'
      skipRef.current?.focus({ preventScroll: true })
      sfx.play('curtain')
      sfx.play('motif')
      const tl = createCurtainTimeline(rootRef.current!, finish, curtainThemeOf(curtain))
      // 标题落定的时刻打一记上行 chime（每场限一次，正好留给章节收束）
      tl.call(() => sfx.play('chime'), undefined, 1.24)
      tl.play()
      const skipTimer = window.setTimeout(() => setSkipVisible(true), 400)
      return () => {
        window.clearTimeout(skipTimer)
        tl.kill()
        document.documentElement.style.overflow = ''
      }
    },
    { scope: rootRef, dependencies: [curtain, reduced], revertOnUpdate: true },
  )

  if (!curtain || reduced) return null
  const theme = curtainThemeOf(curtain)

  return (
    <div
      ref={rootRef}
      className="g-curtain-root"
      data-curtain-theme={theme}
      role="region"
      aria-label="章节过场"
    >
      <div aria-hidden="true">
        <div className="g-curtain-field" />
        {theme === 'rain' && <div className="g-curtain-torn" />}
        <div className="g-curtain-copy">
          <span className="g-curtain-code">{curtain.code}</span>
          <h2 className="g-curtain-title">
            <span className="char-row">
              {Array.from(curtain.title).map((char, index) => <span key={index} className="char">{char}</span>)}
            </span>
          </h2>
          <span className="g-curtain-rule" />
          {curtain.subtitle && <p className="g-curtain-subtitle">{curtain.subtitle}</p>}
        </div>
      </div>
      <button ref={skipRef} type="button" className={`g-film-skip${skipVisible ? ' is-visible' : ''}`} onClick={finish}>
        跳过
      </button>
    </div>
  )
}
