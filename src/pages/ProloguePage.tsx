import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PROLOGUE_BEATS } from '@/data/story'

/**
 * 开场：雨、房间、没寄出的信、显影的地图。
 * 只有氛围与选择语气，不分析玩家。
 */
export default function ProloguePage() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [reply, setReply] = useState<string | null>(null)

  const beat = PROLOGUE_BEATS[index]
  const isLast = index === PROLOGUE_BEATS.length - 1
  const waitingChoice = Boolean(beat.choices && !reply)

  function goNext() {
    if (waitingChoice) return
    if (reply) {
      setReply(null)
      setIndex((current) => Math.min(current + 1, PROLOGUE_BEATS.length - 1))
      return
    }
    if (isLast) {
      navigate('/create')
      return
    }
    setIndex((current) => current + 1)
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === ' ' || event.key === 'Enter') {
        const target = event.target as HTMLElement
        if (target.tagName === 'BUTTON' || target.tagName === 'A') return
        event.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[#211d19] text-cream-50">
      {/* 夜与雨 */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,rgba(192,143,69,0.22),transparent_60%)]"
      />
      <div aria-hidden className="absolute inset-0 opacity-[0.08]">
        <svg viewBox="0 0 400 300" className="h-full w-full" preserveAspectRatio="none">
          <g stroke="#f4e2bd" strokeWidth="0.5">
            {Array.from({ length: 60 }).map((_, i) => {
              const x = (i * 37) % 400
              const y = (i * 53) % 300
              return <path key={i} d={`M${x} ${y} l-6 18`} />
            })}
          </g>
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col px-6 py-10">
        <div className="flex items-center justify-between text-[11px] tracking-[0.3em] text-cream-200/60">
          <span>序章</span>
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="rounded-full px-2 py-1 tracking-[0.1em] transition-colors hover:text-cream-50"
          >
            跳过开场
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <p className="animate-rise-in text-[11px] tracking-[0.5em] text-gold-300/80">
            {beat.kicker}
          </p>

          <div key={beat.id} className="mt-6 space-y-3">
            {beat.lines.map((line, lineIndex) => (
              <p
                key={lineIndex}
                className="animate-rise-in font-display text-[22px] leading-[1.75] text-cream-50/90 sm:text-[26px]"
                style={{ animationDelay: `${lineIndex * 140}ms` }}
              >
                {line}
              </p>
            ))}

            {reply ? (
              <p className="animate-rise-in pt-2 font-display text-[17px] leading-8 text-cream-200/75">
                {reply}
              </p>
            ) : null}
          </div>

          {waitingChoice ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {beat.choices?.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => setReply(choice.reply)}
                  className="rounded-full border border-cream-200/25 px-5 py-2.5 text-[13px] text-cream-50/85 transition-colors hover:border-gold-300/70 hover:text-cream-50"
                >
                  {choice.label}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="mt-10 w-fit rounded-full border border-cream-200/25 px-6 py-2.5 text-[13px] tracking-[0.1em] text-cream-50/85 transition-colors hover:border-gold-300/70 hover:text-cream-50"
            >
              {isLast ? '推开门' : '继续'}
            </button>
          )}
        </div>

        <p className="text-[11px] tracking-[0.2em] text-cream-200/35">
          空格键也可以继续
        </p>
      </div>

      {/* 幕次进度 */}
      <div className="relative z-10 flex justify-center gap-1.5 pb-6" aria-hidden>
        {PROLOGUE_BEATS.map((item, itemIndex) => (
          <span
            key={item.id}
            className={[
              'h-1 rounded-full transition-all duration-500',
              itemIndex === index ? 'w-6 bg-gold-300/80' : 'w-1.5 bg-cream-200/20',
            ].join(' ')}
          />
        ))}
      </div>
    </main>
  )
}
