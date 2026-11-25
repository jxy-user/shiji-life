export type AvatarId = 'chenguang' | 'yese' | 'qingtai' | 'taotu'
export type Period = '早上' | '下午' | '傍晚' | '夜里'
export type ActionStatus = 'todo' | 'doing' | 'paused' | 'done'
export type ActionWindow = 'today-week' | 'today' | 'week' | 'someday'
export type JournalType = 'free' | 'action' | 'insight'
export type InsightStatus = 'guess' | 'confirmed' | 'rejected' | 'rewritten'
export type ExperienceKind = 'event' | 'scene'
export type ArtKey =
  | 'avatar-chenguang'
  | 'avatar-yese'
  | 'avatar-qingtai'
  | 'avatar-taotu'
  | 'night-room'
  | 'plaza'
  | 'sketch-plaza'
  | 'sketch-oldman'
  | 'sketch-bridge'
  | 'sketch-mugs'
  | 'sketch-desk'
  | 'sketch-park'
  | 'sketch-ruins'
  | 'sketch-plane'
  | 'sketch-map'

export interface Profile {
  name: string
  avatarId: AvatarId
  lifeStages: string[]
  topics: string[]
  createdAt: string | null
}

export interface Progress {
  day: number
  period: Period
  energy: number
  prologueStep: number
  exploredSceneIds: string[]
  /** 当前章节，1 = 初入未完成之城，2 = 雨停之后 */
  chapter: number
  chapter2UnlockedAt: string | null
}

export interface Settings {
  defaultExperienceConsent: boolean
  invitationsEnabled: boolean
  thresholdExperiences: 3
  thresholdCategories: 2
}

export interface CityState {
  inviteDismissedAt: string | null
  lumiMetAt: string | null
  /** 已播过的一次性对话脚本 id，不重播 */
  playedScriptIds: string[]
}

export interface Experience {
  id: string
  eventId: string
  sceneId: string
  title: string
  body: string
  kind: ExperienceKind
  occurredAt: string
  consent: boolean
  consentUpdatedAt: string
  deletedAt: string | null
  artKey: ArtKey
}

export interface Insight {
  id: string
  key: string
  text: string
  sourceExperienceIds: string[]
  status: InsightStatus
  rewrittenText: string | null
  updatedAt: string
}

export interface Action {
  id: string
  title: string
  sourceInsightId: string | null
  sourceLabel: string
  status: ActionStatus
  when: ActionWindow
  doneAt: string | null
  artKey: ArtKey
  createdAt: string
  updatedAt: string
  autoReviewJournalId: string | null
}

export interface Journal {
  id: string
  type: JournalType
  text: string
  period: Period
  createdAt: string
  updatedAt: string
  actionId: string | null
  insightId: string | null
  sceneId: string | null
  linkLabel: string | null
  artKey: ArtKey
}

export interface EventCompletion {
  choiceId: string
  experienceId: string
  reason: string
  completedAt: string
}

export interface ChapterSummary {
  title: string
  text: string
  updatedAt: string
}

export interface SaveV2 {
  schemaVersion: 2
  profile: Profile
  progress: Progress
  settings: Settings
  city: CityState
  experiences: Experience[]
  insights: Insight[]
  actions: Action[]
  journals: Journal[]
  events: Record<string, EventCompletion>
  summary: ChapterSummary | null
  /** 往届章节总结（进入第 2 章时归档第 1 章总结） */
  pastSummaries: ChapterSummary[]
}

export interface OnboardingInput {
  name: string
  avatarId: AvatarId
  lifeStages: string[]
  topics: string[]
}

export interface ActionInput {
  title: string
  sourceInsightId?: string | null
  sourceLabel: string
  when: ActionWindow
  artKey: ArtKey
}

export interface JournalInput {
  type: JournalType
  text: string
  period: Period
  actionId?: string | null
  insightId?: string | null
  sceneId?: string | null
  linkLabel?: string | null
  artKey: ArtKey
}

export interface InsightInput {
  key: string
  text: string
  sourceExperienceIds: string[]
}

export interface EventInput {
  eventId: string
  sceneId: string
  choiceId: string
  title: string
  body: string
  reason: string
  consent: boolean
  artKey: ArtKey
}
