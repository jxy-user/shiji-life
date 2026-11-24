/**
 * 关系与行动力（恋爱模拟器式玩法骨架，但不含恋爱要素）
 *
 * 关系值衡量的是「理解程度」，不是恋爱好感：
 * 玩家与城市里的角色通过对话与共同经历，逐渐更了解对方，也更了解自己。
 */

/** 每天的行动点上限：去场景做事、与角色互动都会消耗 */
export const MAX_ACTION_POINTS = 3

export const RELATIONSHIP_STAGES = [
  'stranger',
  'acquaintance',
  'trusted',
  'understood',
] as const
export type RelationshipStage = (typeof RELATIONSHIP_STAGES)[number]

/** 关系值对应的阶段；只描述了解程度，不评价关系好坏 */
export function relationshipStage(affinity: number): RelationshipStage {
  if (affinity >= 80) return 'understood'
  if (affinity >= 50) return 'trusted'
  if (affinity >= 20) return 'acquaintance'
  return 'stranger'
}

export const RELATIONSHIP_STAGE_LABELS: Record<RelationshipStage, string> = {
  stranger: '还不熟',
  acquaintance: '有点熟悉',
  trusted: '愿意说真话',
  understood: '彼此理解',
}

export const AFFINITY_MIN = 0
export const AFFINITY_MAX = 100

export function clampAffinity(value: number): number {
  return Math.max(AFFINITY_MIN, Math.min(AFFINITY_MAX, Math.round(value)))
}
