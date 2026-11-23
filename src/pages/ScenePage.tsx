import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { StatusBar } from '@/components/layout/StatusBar'
import { SceneBackdrop } from '@/components/scene/SceneBackdrop'
import { pendingEventFor } from '@/data/events'
import { SCENES, type SceneAction } from '@/data/scenes'
import { SCENE_IDS, type SceneId } from '@/game/saveSchema'
import { useGameStore } from '@/stores/useGameStore'

function isSceneId(value: string | undefined): value is SceneId {
  return SCENE_IDS.includes(value as SceneId)
}

export default function ScenePage() {
  const { sceneId } = useParams<{ sceneId: string }>()
  const navigate = useNavigate()
  const save = useGameStore((state) => state.save)
  const changeEnergy = useGameStore((state) => state.changeEnergy)
  const advanceTime = useGameStore((state) => state.advanceTime)
  const setFlag = useGameStore((state) => state.setFlag)

  const [result, setResult] = useState<string | null>(null)
  const [lastActionId, setLastActionId] = useState<string | null>(null)

  if (!save) return <Navigate to="/" replace />
  if (!isSceneId(sceneId)) return <Navigate to="/city" replace />

  const scene = SCENES[sceneId]
  const pendingEvent = pendingEventFor(sceneId, save.seenEventIds)

  function runAction(action: SceneAction) {
    changeEnergy(action.energy)
    if (action.advancesTime) advanceTime()
    if (sceneId !== 'plaza') setFlag('exploredBeyondPlaza')
    setResult(action.result)
    setLastActionId(action.id)
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-cream-100">
      <SceneBackdrop scene={scene.id} />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <StatusBar save={save} title={scene.name} />

        <div className="min-h-[26vh] flex-1" aria-hidden />

        <section className="mx-auto w-full max-w-2xl rounded-t-[28px] border-t border-sand-300 bg-cream-50/95 px-6 pb-10 pt-7 shadow-[0_-20px_50px_-40px_rgba(43,38,33,0.5)] backdrop-blur-md lg:max-w-3xl lg:px-8">
          <p className="text-[11px] tracking-[0.4em] text-gold-600">{scene.kicker}</p>
          <h1 className="mt-3 font-display text-2xl tracking-[0.04em] text-ink-900">
            {scene.name}
          </h1>

          <div className="mt-4 space-y-2">
            {scene.intro.map((line) => (
              <p key={line} className="font-display text-[14px] leading-7 text-ink-700">
                {line}
              </p>
            ))}
          </div>

          {pendingEvent ? (
            <Link
              to={`/event/${pendingEvent.id}`}
              className="group mt-5 block rounded-2xl border border-gold-300/70 bg-gold-200/20 px-4 py-4 transition-colors hover:border-gold-400 hover:bg-gold-200/35"
            >
              <p className="text-[11px] tracking-[0.3em] text-gold-600">
                这里发生了一件事
              </p>
              <p className="mt-1.5 font-display text-[16px] text-ink-900">
                {pendingEvent.title}
              </p>
              <p className="mt-1 text-[11px] text-ink-500 transition-colors group-hover:text-ink-700">
                走过去看看 →
              </p>
            </Link>
          ) : null}

          <div className="mt-6 space-y-2.5">
            {scene.actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => runAction(action)}
                aria-pressed={lastActionId === action.id}
                className={[
                  'flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-all',
                  lastActionId === action.id
                    ? 'border-gold-400 bg-gold-200/30'
                    : 'border-sand-300 bg-cream-50 hover:border-gold-300 hover:bg-cream-100/60',
                ].join(' ')}
              >
                <span>
                  <span className="block text-[14px] text-ink-900">{action.label}</span>
                  <span className="mt-0.5 block text-[11px] text-ink-500">
                    {action.hint}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-ink-500">
                  {action.energy === 0
                    ? '精力不变'
                    : action.energy > 0
                      ? `精力 +${action.energy}`
                      : `精力 ${action.energy}`}
                </span>
              </button>
            ))}
          </div>

          {/*
            aria-live 容器必须常驻：先有区域、后有内容，读屏才会播报。
            若容器随结果一起挂载，多数读屏软件不会朗读。
          */}
          <div aria-live="polite" aria-atomic="true">
            {result ? (
              <div className="mt-5 animate-rise-in rounded-2xl border border-sand-300/70 bg-cream-100/70 px-4 py-3">
                <p className="font-display text-[14px] leading-7 text-ink-700">{result}</p>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => navigate('/city')}
            className="mt-6 w-full rounded-full border border-sand-300 px-5 py-3 text-[13px] tracking-[0.08em] text-ink-700 transition-colors hover:border-gold-400 hover:text-ink-900"
          >
            回到城市
          </button>
        </section>
      </div>
    </main>
  )
}
