import type { LifeExperience, SaveData } from '@/game/saveSchema'

/**
 * 经历查询
 *
 * 页面与（将来的）回顾分析都从这里取数，不直接翻存档数组，
 * 保证「已删除」与「未授权」两条规则只有一处实现。
 */

/** 玩家可见的经历：扣掉已删除的，保留原有顺序 */
export function getVisibleExperiences(save: SaveData): LifeExperience[] {
  return save.experiences.filter((experience) => experience.deletedAt === null)
}

/**
 * 可用于回顾分析的经历：可见且玩家已授权。
 * M3 的阈值判断与 AI 输入都只能使用这个结果。
 */
export function getEligibleExperiences(save: SaveData): LifeExperience[] {
  return getVisibleExperiences(save).filter((experience) => experience.analysisConsent)
}
