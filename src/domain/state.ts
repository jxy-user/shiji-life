import type { SaveV2 } from './types'

export function createEmptySave(): SaveV2 {
  return {
    schemaVersion: 2,
    profile: {
      name: '旅人',
      avatarId: 'chenguang',
      lifeStages: [],
      topics: [],
      createdAt: null,
    },
    progress: {
      day: 1,
      period: '傍晚',
      energy: 72,
      prologueStep: 0,
      exploredSceneIds: [],
      chapter: 1,
      chapter2UnlockedAt: null,
    },
    settings: {
      defaultExperienceConsent: false,
      invitationsEnabled: true,
      thresholdExperiences: 3,
      thresholdCategories: 2,
    },
    city: {
      inviteDismissedAt: null,
      lumiMetAt: null,
      playedScriptIds: [],
    },
    experiences: [],
    insights: [],
    actions: [],
    journals: [],
    events: {},
    summary: null,
    pastSummaries: [],
  }
}
