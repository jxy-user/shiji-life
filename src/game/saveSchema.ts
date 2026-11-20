import { z } from 'zod'

import { SCENE_IDS, TIME_SLOTS, type SceneId, type TimeSlot } from '@/game/saveEnums'
import { SAVE_VERSION } from '@/game/saveVersion'
import { EXPERIENCE_TYPES, INSIGHT_CATEGORIES } from '@/types/game'

/**
 * 存档模型（v2）
 *
 * 存档是玩家数据的唯一真相，任何字段变化都必须升级 version 并提供迁移，
 * 不允许直接丢弃旧存档。读取时一律走 schema 校验，失败视为无存档。
 *
 * v1 → v2：新增经历记录 experiences 与已读事件 seenEventIds。
 * v2 → v3：新增选择标签、回顾会话、候选观察、认知卡片与回顾设置。迁移见 saveService。
 */

export { SAVE_VERSION }
export { SCENE_IDS, TIME_SLOTS }
export type { SceneId, TimeSlot }

export const AVATAR_IDS = ['sun', 'ink', 'sage', 'clay'] as const
export type AvatarId = (typeof AVATAR_IDS)[number]

export const LIFE_STAGES = ['seeking', 'growing', 'restart', 'living'] as const
export type LifeStage = (typeof LIFE_STAGES)[number]

export const EXPLORATION_TOPICS = [
  'future',
  'interest',
  'action',
  'relation',
  'unknown',
] as const
export type ExplorationTopic = (typeof EXPLORATION_TOPICS)[number]

export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: '早晨',
  noon: '上午',
  afternoon: '下午',
  evening: '晚上',
}

export const playerProfileSchema = z.object({
  nickname: z.string().trim().min(1).max(16),
  avatarId: z.enum(AVATAR_IDS),
  /** 以下两项均为可选，玩家可以跳过 */
  lifeStage: z.enum(LIFE_STAGES).nullable(),
  explorationTopic: z.enum(EXPLORATION_TOPICS).nullable(),
})

export type PlayerProfile = z.infer<typeof playerProfileSchema>

/**
 * 一条人生经历
 *
 * 只记录游戏内客观发生的事情（选了什么、结果是什么）与玩家的授权状态。
 * 玩家的理由与感受是可选的主动表达：只有玩家填写才保存，空白一律为 null。
 * 删除采用软删除：保留记录以维持一致性，但不再进入任何分析。
 */
export const lifeExperienceSchema = z.object({
  id: z.string().min(1),
  eventId: z.string().min(1),
  /** 事件标题快照：即使日后改写事件文案，档案里仍是当初的版本 */
  eventTitle: z.string().min(1),
  sceneId: z.enum(SCENE_IDS),
  experienceType: z.enum(EXPERIENCE_TYPES),
  choiceId: z.string().min(1),
  choiceText: z.string().min(1),
  outcome: z.array(z.string().min(1)).min(1).max(6),
  /** 是否允许用于之后的人生回响分析；玩家可随时撤回。默认关闭 */
  analysisConsent: z.boolean(),
  /** 玩家主动填写的理由与感受；未填写一律为 null，绝不代写 */
  playerReason: z.string().max(200).nullable(),
  playerFeeling: z.string().max(200).nullable(),
  /** 选择标签快照（做法倾向），只用于生成中性的候选观察，不代表人格 */
  choiceTags: z.array(z.string().min(1).max(16)).max(4),
  /** 经历发生时的游戏内时间，便于回顾时按时间排列 */
  gameDay: z.number().int().min(1),
  timeSlot: z.enum(TIME_SLOTS),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
})

export type LifeExperience = z.infer<typeof lifeExperienceSchema>

/** 回顾会话：一次邀请及其处理结果 */
export const REFLECTION_STATUSES = [
  'invited',
  'accepted',
  'postponed',
  'declined',
  'completed',
] as const

export const reflectionSchema = z.object({
  id: z.string().min(1),
  status: z.enum(REFLECTION_STATUSES),
  trigger: z.literal('threshold'),
  /** 本次回顾被邀请参与的经历 id 快照 */
  experienceIds: z.array(z.string()).max(50),
  createdAt: z.string(),
  respondedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  /** 冷却到第几个游戏日；null 表示无冷却 */
  cooldownUntilGameDay: z.number().int().min(1).nullable(),
})

export type Reflection = z.infer<typeof reflectionSchema>

/** 候选观察：微光基于授权经历提出的线索，必须带证据，玩家确认前不进入档案 */
export const CANDIDATE_STATUSES = ['pending', 'confirmed', 'rejected'] as const

export const candidateInsightSchema = z.object({
  id: z.string().min(1),
  reflectionId: z.string().min(1),
  category: z.enum(INSIGHT_CATEGORIES),
  title: z.string().min(1).max(24),
  description: z.string().min(1).max(200),
  hypothesis: z.string().max(200).nullable(),
  uncertainty: z.string().min(1).max(120),
  questionForPlayer: z.string().min(1).max(120),
  evidenceIds: z.array(z.string()).min(1).max(5),
  status: z.enum(CANDIDATE_STATUSES),
  createdAt: z.string(),
})

export type CandidateInsight = z.infer<typeof candidateInsightSchema>

/** 玩家确认后的认知卡片 */
export const selfInsightSchema = z.object({
  id: z.string().min(1),
  candidateId: z.string().nullable(),
  category: z.enum(INSIGHT_CATEGORIES),
  title: z.string().min(1).max(40),
  content: z.string().min(1).max(300),
  evidenceIds: z.array(z.string()).max(6),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type SelfInsight = z.infer<typeof selfInsightSchema>

export const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  profile: playerProfileSchema,
  chapter: z.literal('chapter_01'),
  currentScene: z.enum(SCENE_IDS),
  gameDay: z.number().int().min(1).max(9999),
  timeSlot: z.enum(TIME_SLOTS),
  energy: z.number().int().min(0).max(100),
  /** 剧情标记：只由游戏引擎写入，AI 不得修改 */
  flags: z.record(z.string(), z.boolean()),
  visitedScenes: z.array(z.enum(SCENE_IDS)),
  /** 经历记录，按时间顺序追加；分析时必须过滤掉已删除与未授权的条目 */
  experiences: z.array(lifeExperienceSchema).max(500),
  /** 已经历过的事件 id，保证一次性事件不重复触发 */
  seenEventIds: z.array(z.string()).max(500),
  /** 回顾会话记录 */
  reflections: z.array(reflectionSchema).max(200),
  /** 候选观察（含已被拒绝的），仅用于流程与审计 */
  candidateInsights: z.array(candidateInsightSchema).max(200),
  /** 玩家确认过的认知卡片 */
  insights: z.array(selfInsightSchema).max(200),
  settings: z.object({
    /** 新经历是否默认允许用于回顾；默认关闭，只影响之后创建的经历 */
    analysisConsentDefault: z.boolean(),
    /** 触发回顾所需的有效经历条数（产品参数，不是心理学标准） */
    reflectionThreshold: z.number().int().min(1).max(10),
    /** 触发回顾需要覆盖的经历类型数 */
    minExperienceTypes: z.number().int().min(1).max(4),
    /** 是否接受主动邀请；关闭后只记录经历，不打扰玩家 */
    invitationsEnabled: z.boolean(),
  }),
  prologueDone: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type SaveData = z.infer<typeof saveSchema>

export function createInitialSave(profile: PlayerProfile): SaveData {
  const now = new Date().toISOString()
  return {
    version: SAVE_VERSION,
    profile,
    chapter: 'chapter_01',
    currentScene: 'plaza',
    gameDay: 1,
    timeSlot: 'morning',
    energy: 100,
    flags: {},
    visitedScenes: ['plaza'],
    experiences: [],
    seenEventIds: [],
    reflections: [],
    candidateInsights: [],
    insights: [],
    settings: {
      analysisConsentDefault: false,
      reflectionThreshold: 3,
      minExperienceTypes: 2,
      invitationsEnabled: true,
    },
    prologueDone: true,
    createdAt: now,
    updatedAt: now,
  }
}
