import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import {
  AVATAR_IDS,
  EXPLORATION_TOPICS,
  LIFE_STAGES,
  type AvatarId,
  type ExplorationTopic,
  type LifeStage,
} from '@/game/saveSchema'
import { useGameStore } from '@/stores/useGameStore'

const AVATAR_STYLES: Record<AvatarId, { label: string; bg: string; face: string; hair: string }> = {
  sun: { label: '晨光', bg: '#f4e2bd', face: '#f8e8cf', hair: '#a9784a' },
  ink: { label: '夜色', bg: '#d9d2c7', face: '#efe6d8', hair: '#3a3128' },
  sage: { label: '青苔', bg: '#dbe6d8', face: '#f3ecdd', hair: '#5d7a63' },
  clay: { label: '陶土', bg: '#efd9cc', face: '#f6e6d8', hair: '#8a5a45' },
}

const LIFE_STAGE_LABELS: Record<LifeStage, string> = {
  seeking: '寻找方向',
  growing: '努力成长',
  restart: '想重新开始',
  living: '想好好生活',
}

const TOPIC_LABELS: Record<ExplorationTopic, string> = {
  future: '未来方向',
  interest: '兴趣',
  action: '行动',
  relation: '人际关系',
  unknown: '暂时不知道',
}

function AvatarFace({ id, size = 64 }: { id: AvatarId; size?: number }) {
  const style = AVATAR_STYLES[id]
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <circle cx="50" cy="50" r="46" fill={style.bg} />
      <circle cx="50" cy="52" r="28" fill={style.face} />
      <path
        d="M22 50 q2 -30 28 -30 q26 0 28 30 q-8 -14 -28 -14 q-20 0 -28 14 z"
        fill={style.hair}
      />
      <ellipse cx="41" cy="54" rx="2.4" ry="3" fill="#3a3128" opacity="0.75" />
      <ellipse cx="59" cy="54" rx="2.4" ry="3" fill="#3a3128" opacity="0.75" />
      <path d="M45 64 q5 3.5 10 0" stroke="#9b6f2e" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export default function CreatePage() {
  const navigate = useNavigate()
  const beginJourney = useGameStore((state) => state.beginJourney)

  const [nickname, setNickname] = useState('旅人')
  const [avatarId, setAvatarId] = useState<AvatarId>('sun')
  const [lifeStage, setLifeStage] = useState<LifeStage | null>(null)
  const [topic, setTopic] = useState<ExplorationTopic | null>(null)

  const cleanName = nickname.trim()

  function submit() {
    if (!cleanName) return
    beginJourney({
      nickname: cleanName.slice(0, 16),
      avatarId,
      lifeStage,
      explorationTopic: topic,
    })
    navigate('/city')
  }

  return (
    <main className="relative isolate min-h-dvh bg-cream-50 pb-16">
      <div aria-hidden className="paper-grain pointer-events-none absolute inset-0 opacity-60" />

      <div className="relative z-10 mx-auto w-full max-w-xl px-6 pt-14">
        <p className="text-[11px] tracking-[0.45em] text-gold-600">角色</p>
        <h1 className="mt-4 font-display text-3xl tracking-[0.05em] text-ink-900">
          你想怎样被称呼
        </h1>
        <p className="mt-3 text-[13px] leading-6 text-ink-500">
          不用真实姓名。下面的问题都可以跳过，跳过不会影响任何事。
        </p>

        <div className="mt-10 space-y-9">
          <label className="block">
            <span className="text-[12px] tracking-[0.1em] text-ink-500">昵称</span>
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={16}
              className="mt-2 w-full rounded-2xl border border-sand-300 bg-cream-100/70 px-4 py-3 font-display text-lg text-ink-900 outline-none transition-colors focus:border-gold-400"
              placeholder="给自己起个名字"
            />
          </label>

          <fieldset>
            <legend className="text-[12px] tracking-[0.1em] text-ink-500">形象</legend>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {AVATAR_IDS.map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={avatarId === id}
                  onClick={() => setAvatarId(id)}
                  className={[
                    'flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 transition-all',
                    avatarId === id
                      ? 'border-gold-400 bg-cream-100 shadow-sm'
                      : 'border-sand-300 bg-cream-50 hover:border-gold-300',
                  ].join(' ')}
                >
                  <AvatarFace id={id} size={56} />
                  <span className="text-[11px] tracking-[0.08em] text-ink-500">
                    {AVATAR_STYLES[id].label}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[12px] tracking-[0.1em] text-ink-500">
              人生状态<span className="ml-2 text-ink-500">可跳过</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {LIFE_STAGES.map((stage) => (
                <button
                  key={stage}
                  type="button"
                  aria-pressed={lifeStage === stage}
                  onClick={() => setLifeStage(lifeStage === stage ? null : stage)}
                  className={[
                    'rounded-full border px-4 py-2 text-[13px] transition-colors',
                    lifeStage === stage
                      ? 'border-gold-400 bg-gold-200/50 text-ink-900'
                      : 'border-sand-300 bg-cream-50 text-ink-700 hover:border-gold-300',
                  ].join(' ')}
                >
                  {LIFE_STAGE_LABELS[stage]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-[12px] tracking-[0.1em] text-ink-500">
              此刻想探索的问题<span className="ml-2 text-ink-500">可跳过</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXPLORATION_TOPICS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={topic === item}
                  onClick={() => setTopic(topic === item ? null : item)}
                  className={[
                    'rounded-full border px-4 py-2 text-[13px] transition-colors',
                    topic === item
                      ? 'border-gold-400 bg-gold-200/50 text-ink-900'
                      : 'border-sand-300 bg-cream-50 text-ink-700 hover:border-gold-300',
                  ].join(' ')}
                >
                  {TOPIC_LABELS[item]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-12 flex flex-col gap-3">
          <Button size="lg" onClick={submit} disabled={!cleanName} className="w-full">
            推门，进入城市
          </Button>
          <p className="text-center text-[11px] text-ink-500">
            之后都可以在设置里修改
          </p>
        </div>
      </div>
    </main>
  )
}
