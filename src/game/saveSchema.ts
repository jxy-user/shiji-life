import { z } from 'zod'

/**
 * 存档模型（v1）
 *
 * 存档是玩家数据的唯一真相，任何字段变化都必须升级 version 并提供迁移，
 * 不允许直接丢弃旧存档。读取时一律走 schema 校验，失败视为无存档。
 */

export const SAVE_VERSION = 1

export const SCENE_IDS = ['plaza', 'home', 'campus', 'park'] as const
export type SceneId = (typeof SCENE_IDS)[number]

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

export const TIME_SLOTS = ['morning', 'noon', 'afternoon', 'evening'] as const
export type TimeSlot = (typeof TIME_SLOTS)[number]

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
    prologueDone: true,
    createdAt: now,
    updatedAt: now,
  }
}
