import { useEffect, useRef, useState } from 'react'

import { LumiSprite } from '@/components/lumi/LumiSprite'
import type { DialogueNode } from '@/data/story'

type DialoguePanelProps = {
  script: Record<string, DialogueNode>
  startId: string
  onFinish: () => void
}

/**
 * 脚本对话面板
 *
 * 逐句显示，可选项只在当句显示完毕后出现。
 * 键盘：空格 / 回车推进；选项按 Tab 聚焦后回车选择。
 */
export function DialoguePanel({ script, startId, onFinish }: DialoguePanelProps) {
  const [nodeId, setNodeId] = useState(startId)
  const [visibleCount, setVisibleCount] = useState(1)
  const panelRef = useRef<HTMLDivElement>(null)

  const node = script[nodeId]

  // 首次打开、以及每次切换节点后都把焦点交还面板：
  // 选项按钮被移除时焦点会掉到 body，键盘用户会迷失位置
  useEffect(() => {
    panelRef.current?.focus()
  }, [nodeId])

  if (!node) return null

  const allShown = visibleCount >= node.lines.length
  const hasChoices = Boolean(node.choices?.length)

  function advance() {
    if (!allShown) {
      setVisibleCount((count) => count + 1)
      return
    }
    if (hasChoices) return
    if (node.next) {
      setNodeId(node.next)
      setVisibleCount(1)
    } else {
      onFinish()
    }
  }

  function choose(next: string) {
    setNodeId(next)
    setVisibleCount(1)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-6">
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="与微光的对话"
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            // 选项按钮自身处理回车，避免重复触发
            if ((event.target as HTMLElement).tagName === 'BUTTON') return
            event.preventDefault()
            advance()
          }
        }}
        className="mx-auto max-w-2xl rounded-2xl border border-sand-300 bg-cream-50/95 p-5 shadow-[0_16px_36px_-28px_rgba(43,38,33,0.32)] backdrop-blur-md outline-none sm:p-6"
      >
        <div className="flex items-start gap-3">
          <LumiSprite size={44} talking />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] tracking-[0.3em] text-gold-600">微光</p>

            <div aria-live="polite" className="mt-2 space-y-2">
              {node.lines.slice(0, visibleCount).map((line, index) => (
                <p
                  key={`${node.id}-${index}`}
                  className={
                    line.speaker === 'narrator'
                      ? 'animate-rise-in font-display text-[13px] leading-6 text-ink-500'
                      : 'animate-rise-in font-display text-[15px] leading-7 text-ink-900'
                  }
                >
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex min-h-[40px] flex-wrap items-center justify-end gap-2">
          {allShown && hasChoices
            ? node.choices?.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => choose(choice.next)}
                  className="rounded-full border border-sand-300 bg-cream-50 px-4 py-2 text-[13px] text-ink-700 transition-colors hover:border-gold-400 hover:text-ink-900"
                >
                  {choice.label}
                </button>
              ))
            : null}

          {allShown && !hasChoices ? (
            <button
              type="button"
              onClick={advance}
              className="rounded-full bg-ink-900 px-5 py-2 text-[13px] tracking-wide text-cream-50 transition-colors hover:bg-ink-700"
            >
              {node.next ? '继续' : '结束对话'}
            </button>
          ) : null}

          {!allShown ? (
            <button
              type="button"
              onClick={advance}
              className="rounded-full px-3 py-2 text-[12px] text-ink-500 transition-colors hover:text-ink-700"
            >
              继续 →
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
