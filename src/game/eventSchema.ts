import { z } from 'zod'

import { SCENE_IDS } from '@/game/saveSchema'
import { EXPERIENCE_TYPES } from '@/types/game'

/**
 * 事件数据契约
 *
 * 事件是内容而不是代码：全部字段在加载时用 Zod 校验，
 * 校验失败直接抛错，不允许带着坏数据进入运行时。
 *
 * 选择效果只由游戏引擎执行（精力、时间、剧情标记），
 * 任何 AI 输出都不能修改这些字段。
 */

export const choiceEffectsSchema = z.object({
  /** 精力变化，负数消耗 */
  energy: z.number().int().min(-40).max(40).optional(),
  /** 是否推进一个时段 */
  advanceTime: z.boolean().optional(),
  /** 剧情标记，后续事件可据此出现 */
  flags: z.record(z.string(), z.boolean()).optional(),
})

export const eventChoiceSchema = z.object({
  id: z.string().min(1).max(40),
  text: z.string().min(1).max(40),
  /** 选择之后发生的事情：只描述事实，不评价玩家 */
  result: z.array(z.string().min(1).max(120)).min(1).max(4),
  effects: choiceEffectsSchema.optional(),
})

export const gameEventSchema = z.object({
  id: z.string().regex(/^[a-z0-9_]+$/, '事件 id 只能是小写字母、数字与下划线'),
  title: z.string().min(1).max(24),
  chapter: z.literal('chapter_01'),
  sceneId: z.enum(SCENE_IDS),
  experienceType: z.enum(EXPERIENCE_TYPES),
  trigger: z.literal('scene_enter'),
  once: z.boolean(),
  narrative: z.array(z.string().min(1).max(140)).min(1).max(4),
  choices: z.array(eventChoiceSchema).min(2).max(4),
  memory: z.object({
    /** 事件完成后是否提供「可跳过」的理由填写入口 */
    askReason: z.boolean(),
  }),
})

export type GameEvent = z.infer<typeof gameEventSchema>
export type EventChoice = z.infer<typeof eventChoiceSchema>
