import { useCallback, useEffect, useRef, useState } from 'react'
import { ArtImage } from '../../components/g/ArtImage'
import Typewriter from '../../motion/components/Typewriter'
import { useUIStore } from '../../store/uiStore'
import { sfx } from '../../motion/sound/SfxEngine'
import { Pin, Stamp } from '../../components/g/GPrimitives'
import styles from './DialoguePanel.module.css'

export function DialoguePanel() {
  const dialogue = useUIStore((state) => state.dialogue)
  const closing = useUIStore((state) => state.dialogueClosing)
  const advanceDialogue = useUIStore((state) => state.advanceDialogue)
  const closeDialogue = useUIStore((state) => state.closeDialogue)
  const beginDialogueClose = useUIStore((state) => state.beginDialogueClose)
  const panelRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  const [revealed, setRevealed] = useState(false)
  const lineText = dialogue ? dialogue.lines[dialogue.index]?.text ?? '' : ''

  // 关闭时先播退场动画（exit 比 enter 快），动画结束后再真正卸载
  const requestClose = useCallback(() => {
    const panel = panelRef.current
    if (!panel || !window.matchMedia?.('(prefers-reduced-motion: no-preference)').matches) {
      closeDialogue()
      return
    }
    beginDialogueClose()
    window.setTimeout(closeDialogue, 150)
  }, [beginDialogueClose, closeDialogue])

  useEffect(() => {
    const isOpen = Boolean(dialogue)
    if (isOpen && !wasOpenRef.current) {
      triggerRef.current = document.activeElement as HTMLElement | null
    }
    if (!isOpen && wasOpenRef.current) {
      triggerRef.current?.focus()
      triggerRef.current = null
    }
    wasOpenRef.current = isOpen
  }, [dialogue])

  useEffect(() => {
    if (dialogue) panelRef.current?.focus()
  }, [dialogue?.index, dialogue])

  // 换台词时重置打字机
  useEffect(() => {
    setRevealed(false)
  }, [dialogue?.index, lineText])

  // 每换一行给一记纸面轻点；逐字音会变成机关枪，叙事对白不需要
  const lineIndex = dialogue?.index
  useEffect(() => {
    if (lineIndex === undefined) return
    sfx.play('type')
  }, [lineIndex, lineText])

  if (!dialogue) return null
  const line = dialogue.lines[dialogue.index]
  if (!line) return null
  const isLast = dialogue.index === dialogue.lines.length - 1

  function onPanelKeyDown(event: React.KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      if (event.target !== event.currentTarget) return
      event.preventDefault()
      if (!revealed) {
        setRevealed(true)
        return
      }
      advanceDialogue()
    }
  }

  return (
    <aside
      ref={panelRef}
      className={[styles.dialogue, closing ? styles.dialogueClosing : ''].filter(Boolean).join(' ')}
      aria-label="微光对话"
      tabIndex={-1}
      onKeyDown={onPanelKeyDown}
    >
      <Pin tone="sun" />
      <header>
        <span className={styles.avatarWrap}>
          <ArtImage artKey="avatar-qingtai" alt="" width="64" height="64" sizes="64px" />
        </span>
        <div><Stamp tone="sun">微光</Stamp><strong>{line.speaker === 'lumi' ? '微光' : '城市旁白'}</strong></div>
        <button type="button" onClick={requestClose} aria-label="关闭微光对话">关闭</button>
      </header>
      <div className={styles.lineBody}>
        <Typewriter as="p" text={line.text} speed={line.speaker === 'narrator' ? 40 : 32} skip={revealed} onDone={() => setRevealed(true)} />
        <span className={revealed ? styles.cueVisible : styles.cue} aria-hidden="true">▼</span>
      </div>
      <footer>
        <span>{dialogue.index + 1} / {dialogue.lines.length}</span>
        <button type="button" onClick={advanceDialogue}>{isLast ? '结束对话' : '继续'} <kbd>Space</kbd></button>
      </footer>
    </aside>
  )
}
