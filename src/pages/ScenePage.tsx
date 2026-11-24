import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { StatusBar } from '@/components/layout/StatusBar'
import { SceneBackdrop } from '@/components/scene/SceneBackdrop'
import { charactersInScene } from '@/data/characters'
import { characterEventFor, pendingEventFor } from '@/data/events'
import { SCENES, type SceneAction } from '@/data/scenes'
import { RELATIONSHIP_STAGE_LABELS } from '@/game/relationships'
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
  const spendActionPoint = useGameStore((state) => state.spendActionPoint)
  const greetCharacter = useGameStore((state) => state.greetCharacter)
  const restUntilMorning = useGameStore((state) => state.restUntilMorning)

  const [result, setResult] = useState<string | null>(null)
  const [lastActionId, setLastActionId] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<SceneAction | null>(null)
  const [runningActionId, setRunningActionId] = useState<string | null>(null)
  // 同步锁：React 状态更新是异步的，双击时两次事件可能读到同一份旧状态
  const busyRef = useRef(false)

  if (!save) return <Navigate to="/" replace />
  if (!isSceneId(sceneId)) return <Navigate to="/city" replace />

  const scene = SCENES[sceneId]
  const pendingEvent = pendingEventFor(sceneId, save.seenEventIds)
  const sceneCharacters = charactersInScene(sceneId)

  function runAction(action: SceneAction) {
    if (!save || busyRef.current) return
    busyRef.current = true
    setRunningActionId(action.id)

    // 以 store 的原子结果为准：扣不到行动力就什么都不执行
    if (!spendActionPoint()) {
      setResult('今天的行动力用完了。可以睡一觉，等明天再来。')
      busyRef.current = false
      setRunningActionId(null)
      return
    }

    changeEnergy(action.energy)
    if (action.advancesTime) advanceTime()
    if (sceneId !== 'plaza') setFlag('exploredBeyondPlaza')
    setResult(action.result)
    setLastActionId(action.id)
    setLastAction(action)

    // 短暂锁住，防止同一次点击被双击重复结算
    setTimeout(() => {
      busyRef.current = false
      setRunningActionId(null)
    }, 350)
  }

  function handleGreet(characterId: string) {
    if (!save || busyRef.current) return
    busyRef.current = true
    const ok = greetCharacter(characterId)
    busyRef.current = false

    if (!ok) {
      const latest = useGameStore.getState().save
      setResult(
        latest && latest.actionPoints <= 0
          ? '今天的行动力用完了。可以睡一觉，等明天再来。'
          : '今天已经打过招呼了，明天再来吧。',
      )
      return
    }

    const character = sceneCharacters.find((item) => item.id === characterId)
    setResult(character?.greeting ?? '你打了招呼。')
    setLastActionId(null)
    setLastAction(null)
  }

  function handleRest() {
    restUntilMorning()
    setResult('你回到房间，睡了一觉。第二天早上，行动力恢复了。')
    setLastActionId(null)
    setLastAction(null)
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-cream-100">
      <SceneBackdrop scene={scene.id} />

      <div className="relative z-10 flex min-h-dvh flex-col">
        <StatusBar save={save} title={scene.name} />

        <div className="min-h-[26vh] flex-1" aria-hidden />

        <section className="mx-auto w-full max-w-2xl rounded-t-2xl border-t border-sand-300 bg-cream-50/95 px-6 pb-10 pt-7 shadow-[0_-12px_32px_-30px_rgba(43,38,33,0.3)] backdrop-blur-md lg:max-w-3xl lg:px-8">
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

          {sceneCharacters.length > 0 ? (
            <div className="mt-6 space-y-3">
              <p className="text-[11px] tracking-[0.3em] text-sage-500">在这里的人</p>
              {sceneCharacters.map((character) => {
                const relationship = save.relationships.find(
                  (item) => item.characterId === character.id,
                )
                const affinity = relationship?.affinity ?? 0
                const stageLabel = relationship
                  ? RELATIONSHIP_STAGE_LABELS[relationship.stage]
                  : '还没打过照面'
                const nextEvent = characterEventFor(
                  character.id,
                  save.seenEventIds,
                  affinity,
                )

                return (
                  <div
                    key={character.id}
                    className="rounded-xl border border-sand-300 bg-cream-100/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-display text-[16px] text-ink-900">
                          {character.name}
                          <span className="ml-2 text-[11px] font-normal text-ink-500">
                            {character.role}
                          </span>
                        </p>
                        <p className="mt-1 text-[11px] text-ink-500">{stageLabel}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {nextEvent ? (
                        <Link
                          to={`/event/${nextEvent.id}`}
                          className="inline-flex items-center rounded-lg bg-gold-500 px-3 py-1.5 text-[12px] font-semibold text-cream-50"
                        >
                          聊聊「{nextEvent.title}」
                        </Link>
                      ) : (
                        <span className="text-[11px] text-ink-500">
                          暂时没有新的话题
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleGreet(character.id)}
                        disabled={save.actionPoints <= 0}
                        className="inline-flex items-center rounded-lg border border-sand-300 px-3 py-1.5 text-[12px] text-ink-700 transition-colors hover:border-gold-400 disabled:opacity-45"
                      >
                        打个招呼 · 1 行动
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}

          <div className="mt-6 space-y-2.5">
            {scene.actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => runAction(action)}
                aria-pressed={lastActionId === action.id}
                disabled={runningActionId !== null}
                className={[
                  'flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60',
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
                {lastAction ? (
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px]">
                    <span className="text-gold-500">行动力 −1</span>
                    {lastAction.energy !== 0 ? (
                      <span
                        className={
                          lastAction.energy > 0 ? 'text-sage-700' : 'text-ink-500'
                        }
                      >
                        精力 {lastAction.energy > 0 ? '+' : ''}
                        {lastAction.energy}
                      </span>
                    ) : null}
                    {lastAction.advancesTime ? (
                      <span className="text-ink-500">时间往前一段</span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleRest}
              className="w-full rounded-lg border border-sand-300 px-5 py-3 text-[13px] tracking-[0.08em] text-ink-700 transition-colors hover:border-gold-400 hover:text-ink-900"
            >
              睡到明天早晨
            </button>
            <button
              type="button"
              onClick={() => navigate('/city')}
              className="w-full rounded-lg border border-sand-300 px-5 py-3 text-[13px] tracking-[0.08em] text-ink-700 transition-colors hover:border-gold-400 hover:text-ink-900"
            >
              回到城市
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
