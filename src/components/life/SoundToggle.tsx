import { useState } from 'react'

import { isMuted, setMuted, sfx, unlockAudio } from '@/services/sound'

/** 音效开关：状态持久化，关掉后全部音效静默 */
export function SoundToggle({ className }: { className?: string }) {
  const [muted, setMutedState] = useState(() => isMuted())

  function toggle() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
    if (!next) {
      // 开启时给一声反馈，同时解锁音频
      unlockAudio()
      sfx.tick()
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={!muted}
      aria-label={muted ? '音效已关闭，点击开启' : '音效已开启，点击关闭'}
      className={[
        'rounded-md border px-3 py-1 text-[11px] tracking-[0.12em] transition-colors',
        muted
          ? 'border-sand-300 text-ink-500 hover:text-ink-900'
          : 'border-gold-500/40 text-gold-600',
        className ?? '',
      ].join(' ')}
    >
      音效 {muted ? '关' : '开'}
    </button>
  )
}
