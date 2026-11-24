import { Link, Navigate } from 'react-router-dom'

import { StatusBar } from '@/components/layout/StatusBar'
import { CHARACTERS, CHARACTER_IDS } from '@/data/characters'
import { SCENES } from '@/data/scenes'
import { characterEventFor } from '@/data/events'
import { MAX_ACTION_POINTS, RELATIONSHIP_STAGE_LABELS } from '@/game/relationships'
import { useGameStore } from '@/stores/useGameStore'

/**
 * 人物页：城市里认识的人
 *
 * 借恋爱模拟器的关系界面，但衡量的是「理解程度」而非好感；
 * 每位角色只显示事实（在哪里、聊过什么、理解到哪一步），不做人格判断。
 */
export default function PeoplePage() {
  const save = useGameStore((state) => state.save)

  if (!save) return <Navigate to="/" replace />

  return (
    <main className="min-h-dvh bg-cream-50 pb-20">
      <StatusBar save={save} title="人物" />

      <div className="mx-auto w-full max-w-3xl px-5 pt-8 lg:max-w-4xl">
        <p className="text-[11px] tracking-[0.4em] text-gold-600">人物</p>
        <h1 className="mt-3 font-display text-3xl tracking-[0.04em] text-ink-900">
          你认识的人
        </h1>
        <p className="mt-3 max-w-xl text-[13px] leading-6 text-ink-500">
          关系不是好感度，而是彼此理解的程度。每天的行动力有限，想清楚今天想见谁。
        </p>

        <ul className="mt-8 divide-y divide-sand-300/60 border-t border-sand-300/60">
          {CHARACTER_IDS.map((id) => {
            const character = CHARACTERS[id]
            const relationship = save.relationships.find(
              (item) => item.characterId === id,
            )
            const affinity = relationship?.affinity ?? 0
            const stageLabel = relationship
              ? RELATIONSHIP_STAGE_LABELS[relationship.stage]
              : '还没打过照面'
            const nextEvent = characterEventFor(id, save.seenEventIds, affinity)
            const scene = SCENES[character.sceneId]

            return (
              <li key={id} className="py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-[18px] text-ink-900">
                      {character.name}
                      <span className="ml-2 text-[11px] font-normal text-ink-500">
                        {character.role} · {scene.name}
                      </span>
                    </p>
                    <p className="mt-1 text-[12px] text-ink-500">{stageLabel}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-[12px] leading-6 text-ink-500">
                  {character.intro.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {nextEvent ? (
                    <Link
                      to={`/event/${nextEvent.id}`}
                      className="rounded-lg bg-gold-500 px-3 py-1.5 text-[12px] font-semibold text-cream-50"
                    >
                      聊聊「{nextEvent.title}」
                    </Link>
                  ) : (
                    <span className="text-[11px] text-ink-500">
                      暂时没有新的话题
                    </span>
                  )}
                  <Link
                    to={`/scene/${character.sceneId}`}
                    className="rounded-lg border border-sand-300 px-3 py-1.5 text-[12px] text-ink-700 transition-colors hover:border-gold-400"
                  >
                    去{scene.name}
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="mt-6 text-[11px] text-ink-500">
          今天剩余行动力：{save.actionPoints} / {MAX_ACTION_POINTS}
        </p>
      </div>
    </main>
  )
}
