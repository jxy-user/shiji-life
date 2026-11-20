import type { Reflection, SaveData } from '@/game/saveSchema'
import { getEligibleExperiences, getVisibleExperiences } from '@/services/experienceService'

/**
 * 回顾触发判断
 *
 * 产品参数：默认 3 条可见经历、覆盖 2 类。这是可配置的演示值，
 * 不是心理学标准。拒绝或稍后之后进入冷却，冷却期内不再打扰。
 */
export type ReflectionReason =
  | 'ok'
  | 'disabled'
  | 'active-session'
  | 'cooldown'
  | 'too-few-experiences'
  | 'too-few-types'

export type ReflectionReadiness = {
  shouldInvite: boolean
  reason: ReflectionReason
  /** 可见经历（含未授权），决定要不要邀请 */
  visibleCount: number
  /** 已授权经历，决定能不能真的生成观察 */
  eligibleCount: number
  typeCount: number
  threshold: number
  minTypes: number
  activeSession: Reflection | null
}

export function getActiveReflection(save: SaveData): Reflection | null {
  return (
    save.reflections.find(
      (reflection) =>
        reflection.status === 'invited' || reflection.status === 'accepted',
    ) ?? null
  )
}

export function evaluateReflection(save: SaveData): ReflectionReadiness {
  const visible = getVisibleExperiences(save)
  const eligible = getEligibleExperiences(save)
  const typeCount = new Set(visible.map((experience) => experience.experienceType)).size
  const threshold = save.settings.reflectionThreshold
  const minTypes = save.settings.minExperienceTypes
  const activeSession = getActiveReflection(save)

  const base = {
    visibleCount: visible.length,
    eligibleCount: eligible.length,
    typeCount,
    threshold,
    minTypes,
    activeSession,
  }

  if (!save.settings.invitationsEnabled) {
    return { ...base, shouldInvite: false, reason: 'disabled' }
  }

  if (activeSession) {
    return { ...base, shouldInvite: false, reason: 'active-session' }
  }

  const cooldownUntil = save.reflections.reduce(
    (latest, reflection) => Math.max(latest, reflection.cooldownUntilGameDay ?? 0),
    0,
  )
  if (save.gameDay < cooldownUntil) {
    return { ...base, shouldInvite: false, reason: 'cooldown' }
  }

  if (visible.length < threshold) {
    return { ...base, shouldInvite: false, reason: 'too-few-experiences' }
  }

  if (typeCount < minTypes) {
    return { ...base, shouldInvite: false, reason: 'too-few-types' }
  }

  return { ...base, shouldInvite: true, reason: 'ok' }
}
