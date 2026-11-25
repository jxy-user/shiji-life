import type { JournalType, SaveV2 } from '../domain/types'

export function selectActiveExperiences(save: SaveV2) {
  return save.experiences.filter((experience) => experience.deletedAt === null)
}

export function selectApprovedExperiences(save: SaveV2) {
  return selectActiveExperiences(save).filter((experience) => experience.consent)
}

export function selectReflectionStats(save: SaveV2) {
  const approved = selectApprovedExperiences(save)
  const categories = new Set(approved.map((experience) => experience.sceneId))
  return {
    approvedCount: approved.length,
    categoryCount: categories.size,
    eligible: approved.length >= save.settings.thresholdExperiences && categories.size >= save.settings.thresholdCategories,
  }
}

export function selectInsightIsCurrent(insightId: string, save: SaveV2) {
  const insight = save.insights.find((item) => item.id === insightId)
  if (!insight || insight.sourceExperienceIds.length === 0) return false
  return insight.sourceExperienceIds.every((id) => selectApprovedExperiences(save).some((experience) => experience.id === id))
}

export function selectJournals(save: SaveV2, filter: JournalType | 'all') {
  return save.journals.filter((journal) => filter === 'all' || journal.type === filter)
}

export function selectActionReview(save: SaveV2, actionId: string) {
  const action = save.actions.find((item) => item.id === actionId)
  if (!action) return null
  return save.journals.find((journal) => journal.id === action.autoReviewJournalId || journal.actionId === actionId) ?? null
}

/** 第 2 章「雨停之后」解锁：已有阶段总结，且探索/天数/已判断认知达标其一。 */
export function selectChapter2Eligible(save: SaveV2) {
  if (save.progress.chapter !== 1) return false
  if (!save.summary) return false
  const judgedInsights = save.insights.filter((insight) => insight.status !== 'guess').length
  return (
    save.progress.exploredSceneIds.length >= 5 ||
    save.progress.day >= 7 ||
    judgedInsights >= 2
  )
}
