import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { CityMap } from '@/components/city/CityMap'
import { DialoguePanel } from '@/components/dialogue/DialoguePanel'
import { StatusBar } from '@/components/layout/StatusBar'
import { LumiSprite } from '@/components/lumi/LumiSprite'
import { LUMI_FIRST_MEETING, LUMI_SMALL_TALK } from '@/data/story'
import { evaluateReflection } from '@/game/reflection'
import type { SceneId } from '@/game/saveSchema'
import { hasPlayableSave } from '@/services/savePeek'
import { useGameStore } from '@/stores/useGameStore'

export default function CityPage() {
  const navigate = useNavigate()
  const save = useGameStore((state) => state.save)
  const goToScene = useGameStore((state) => state.goToScene)
  const setFlag = useGameStore((state) => state.setFlag)
  const createReflectionInvite = useGameStore((state) => state.createReflectionInvite)
  const respondReflection = useGameStore((state) => state.respondReflection)

  const [dialogue, setDialogue] = useState<'first' | 'smalltalk' | null>(null)

  const exploredBeyondPlaza =
    save?.visitedScenes.some((scene) => scene !== 'plaza') ?? false
  // 关闭状态写进存档，刷新后不再重复弹出
  const chapterCardDismissed = Boolean(save?.flags.chapterCardDismissed)
  const chapterCardRef = useRef<HTMLElement>(null)

  // 第一次完成探索时，把通关卡片带到视野里，避免玩家以为没有反馈
  useEffect(() => {
    if (!exploredBeyondPlaza || chapterCardDismissed) return
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    chapterCardRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center',
    })
  }, [exploredBeyondPlaza, chapterCardDismissed])

  if (!save) {
    // 首屏判断通过、完整校验失败：明确告诉玩家存档读不出来，
    // 而不是静默弹回首页让人以为点错了
    return (
      <Navigate
        to="/"
        replace
        state={hasPlayableSave() ? { saveBroken: true } : undefined}
      />
    )
  }

  const lumiMet = Boolean(save.flags.lumiMet)
  const readiness = evaluateReflection(save)

  function handleReflection(response: 'accept' | 'postpone' | 'decline') {
    const reflectionId = createReflectionInvite()
    if (!reflectionId) return

    if (response === 'accept') {
      respondReflection(reflectionId, 'accept')
      navigate('/reflection')
      return
    }
    respondReflection(reflectionId, response)
  }

  function enterScene(scene: SceneId) {
    goToScene(scene)
    navigate(`/scene/${scene}`)
  }

  return (
    <main className="min-h-dvh bg-cream-50 pb-16">
      <StatusBar save={save} showBackHome={false} title="未完成之城" />

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 lg:max-w-6xl lg:px-6 lg:pt-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-sand-300/60 px-1 pb-5">
          <div>
            <p className="text-[11px] tracking-[0.4em] text-gold-600">第一章 · 初入未完成之城</p>
            <h1 className="mt-2 font-display text-2xl tracking-[0.05em] text-ink-900">
              {save.profile.nickname}，想去哪里走走？
            </h1>
          </div>
          <p className="text-[12px] text-ink-500">
            亮着灯的地方可以进入，灰色的还在建造。
          </p>
        </div>

        <CityMap
          onEnter={enterScene}
          lumiSlot={
            <button
              type="button"
              onClick={() => setDialogue(lumiMet ? 'smalltalk' : 'first')}
              style={{ left: '37%', top: '56%' }}
              aria-label={lumiMet ? '呼唤微光' : '老树下有什么在发光'}
              className="group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-full transition-transform hover:scale-105"
            >
              <span className="mb-0.5 rounded-full bg-cream-50/85 px-2 py-0.5 text-[10px] tracking-[0.2em] text-gold-600 backdrop-blur-sm">
                微光
              </span>
              <LumiSprite size={54} />
            </button>
          }
        />

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-sand-300/50 pt-4 text-[11px] tracking-[0.16em] text-ink-500">
          <Link to="/archive" className="transition-colors hover:text-ink-900">
            人生档案
          </Link>
          <Link to="/journal" className="transition-colors hover:text-ink-900">
            日记
          </Link>
          <Link to="/actions" className="transition-colors hover:text-ink-900">
            现实行动
          </Link>
          <Link to="/settings" className="transition-colors hover:text-ink-900">
            设置
          </Link>
        </nav>

        {readiness.shouldInvite ? (
          <section className="mx-auto mt-8 animate-rise-in rounded-2xl border border-gold-300/70 bg-cream-100 p-5 sm:p-6 lg:max-w-4xl lg:p-7">
            <div className="flex items-start gap-4">
              <LumiSprite size={52} talking />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] tracking-[0.35em] text-gold-600">微光</p>
                <p className="mt-2 font-display text-[15px] leading-7 text-ink-900">
                  最近我们一起经历了不少事。我有一些小发现，但不确定是不是我理解的那样。你愿意聊聊吗？
                </p>
                <p className="mt-1.5 text-[11px] leading-5 text-ink-500">
                  你可以接受、稍后，或者这次不聊——都不会有惩罚，也不会影响城市里的任何事。
                </p>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleReflection('accept')}
                    className="rounded-full bg-ink-900 px-5 py-2 text-[13px] text-cream-50 transition-colors hover:bg-ink-700"
                  >
                    现在聊聊
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReflection('postpone')}
                    className="rounded-full border border-sand-300 px-5 py-2 text-[13px] text-ink-700 transition-colors hover:border-gold-400"
                  >
                    稍后
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReflection('decline')}
                    className="rounded-full px-4 py-2 text-[13px] text-ink-500 transition-colors hover:text-ink-900"
                  >
                    这次不聊
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {exploredBeyondPlaza && !chapterCardDismissed ? (
          <section
            ref={chapterCardRef}
            className="mx-auto mt-8 max-w-2xl animate-rise-in rounded-2xl border border-gold-300/60 bg-cream-100 p-6 lg:max-w-3xl"
          >
            <p className="text-[11px] tracking-[0.35em] text-gold-600">第一章 · 完成</p>
            <h2 className="mt-3 font-display text-xl text-ink-900">
              你第一次在这座城市里走了一圈。
            </h2>
            <p className="mt-3 text-[13px] leading-6 text-ink-500">
              还没有什么结论，也不需要现在就有。经历会留在这里，等合适的时机再一起看。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/archive"
                className="rounded-full bg-ink-900 px-5 py-2 text-[13px] text-cream-50 transition-colors hover:bg-ink-700"
              >
                打开人生档案
              </Link>
              <button
                type="button"
                onClick={() => setFlag('chapterCardDismissed')}
                className="rounded-full border border-sand-300 px-5 py-2 text-[13px] text-ink-700 transition-colors hover:border-gold-400"
              >
                继续在城里走走
              </button>
            </div>
          </section>
        ) : null}
      </div>

      {dialogue ? (
        <DialoguePanel
          script={dialogue === 'first' ? LUMI_FIRST_MEETING : LUMI_SMALL_TALK}
          startId="start"
          onFinish={() => {
            if (dialogue === 'first') setFlag('lumiMet')
            setDialogue(null)
          }}
        />
      ) : null}
    </main>
  )
}
