import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { avatarOptions, lifeStageOptions, topicOptions } from '../../data/assets'
import { ArtImage } from '../../components/g/ArtImage'
import { onboardingSchema } from '../../domain/schema'
import type { AvatarId } from '../../domain/types'
import { useGameStore } from '../../store/gameStore'
import { useUIStore } from '../../store/uiStore'
import { ChoiceGroup, Field } from '../../components/forms/FormPrimitives'
import { PaperButton, Stamp } from '../../components/g/GPrimitives'
import { usePageMotion } from '../../motion/usePageMotion'
import { useCurtainStore } from '../../motion/curtainStore'
import styles from './CreatePage.module.css'

export default function CreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const profile = useGameStore((state) => state.save.profile)
  const completeOnboarding = useGameStore((state) => state.completeOnboarding)
  const showToast = useUIStore((state) => state.showToast)
  const openCurtain = useCurtainStore((state) => state.openCurtain)
  const scopeRef = usePageMotion<HTMLFormElement>({ stagger: 0.08 })
  const [name, setName] = useState(profile.createdAt ? profile.name : '')
  const [avatarId, setAvatarId] = useState<AvatarId>(profile.avatarId)
  const [lifeStages, setLifeStages] = useState<string[]>(profile.lifeStages)
  const [topics, setTopics] = useState<string[]>(profile.topics)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const next = useMemo(() => {
    const target = searchParams.get('next')
    return target?.startsWith('/') && !target.startsWith('//') ? target : '/city'
  }, [searchParams])

  function submit(skip = false) {
    const input = skip ? { name: '', avatarId, lifeStages: [], topics: [] } : { name, avatarId, lifeStages, topics }
    const parsed = onboardingSchema.safeParse(input)
    if (!parsed.success) {
      setErrors({ name: parsed.error.issues[0]?.message || '请检查登记信息。' })
      document.getElementById('resident-name')?.focus()
      return
    }
    completeOnboarding(parsed.data)
    showToast(skip ? '已先进入城市，之后仍可回来补充信息。' : `欢迎入城，${parsed.data.name || '旅人'}。`)
    if (next === '/city') {
      openCurtain({
        code: 'CHAPTER 01',
        title: '初入未完成之城',
        subtitle: '门后是日光，和一条可以慢慢走的路。',
        theme: 'rain',
      })
    }
    navigate(next, { replace: true })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  return (
    <form ref={scopeRef} className={styles.form} onSubmit={onSubmit} noValidate>
      <header className={styles.header} data-motion>
        <div><Stamp tone="sun">居民登记 / 001</Stamp><h1>给今天的自己<br />留一个位置。</h1><p>这些信息只用于本机档案，之后可以在设置中重置。</p></div>
        <div className={styles.status} aria-label="登记状态：待入城"><span aria-hidden="true" />待入城</div>
      </header>

      <div className={styles.grid}>
        <section className={styles.identity} aria-labelledby="identity-title" data-motion>
          <div className={styles.sectionTitle}><span>01</span><div><h2 id="identity-title">身份信息</h2><p>选一个愿意先陪伴你的角色。</p></div></div>
          <Field id="resident-name" label="怎么称呼你" hint="留空会使用“旅人”。最多 8 个字。" error={errors.name} optional>
            <div className={styles.nameControl}>
              <input
                id="resident-name"
                value={name}
                onChange={(event) => { setName(event.target.value); setErrors({}) }}
                maxLength={8}
                autoComplete="nickname"
                placeholder="旅人"
              />
              <span>{name.length} / 8</span>
            </div>
          </Field>
          <fieldset className={styles.avatars}>
            <legend>角色头像</legend>
            <div>
              {avatarOptions.map((option) => (
                <label key={option.id} className={[styles.avatar, avatarId === option.id ? styles.avatarActive : ''].filter(Boolean).join(' ')}>
                  <input type="radio" name="avatar" value={option.id} checked={avatarId === option.id} onChange={() => setAvatarId(option.id)} />
                  <ArtImage artKey={option.artKey} alt="" width="160" height="190" sizes="(max-width: 620px) 40vw, 160px" />
                  <span>{option.name}</span>
                  {avatarId === option.id && <i aria-hidden="true"><Check size={16} strokeWidth={3} /></i>}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className={styles.context} aria-labelledby="context-title" data-motion>
          <div className={styles.sectionTitle}><span>02</span><div><h2 id="context-title">此刻的状态</h2><p>可以多选，也可以先不回答。</p></div></div>
          <ChoiceGroup
            legend="最近更接近哪一种状态？"
            hint="没有正确答案，按此刻的感受选择。"
            options={lifeStageOptions.map((option) => ({ value: option, label: option }))}
            value={lifeStages}
            onChange={setLifeStages}
          />
          <ChoiceGroup
            legend="你想慢慢靠近什么？"
            hint="之后发生在城市里的经历，会帮助你整理这些线索。"
            options={topicOptions.map((option) => ({ value: option, label: option }))}
            value={topics}
            onChange={setTopics}
          />
        </section>
      </div>

      <footer className={styles.footer} data-motion>
        <p><ShieldCheck size={21} aria-hidden="true" />昵称留空也可以。城市不会催你成为谁。</p>
        <div>
          <PaperButton intent="secondary" onClick={() => submit(true)}>先跳过</PaperButton>
          <PaperButton type="submit">推门，进入城市<ArrowRight size={18} aria-hidden="true" /></PaperButton>
        </div>
      </footer>
    </form>
  )
}
