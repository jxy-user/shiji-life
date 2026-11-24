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
  /** 与该角色的理解度变化（仅角色事件有效） */
  affinity: z.number().int().min(-20).max(20).optional(),
  /** 是否推进一个时段 */
  advanceTime: z.boolean().optional(),
  /** 剧情标记，后续事件可据此出现 */
  flags: z.record(z.string(), z.boolean()).optional(),
})

export const eventChoiceSchema = z.object({
  id: z.string().min(1).max(40),
  text: z.string().min(1).max(40),
  /**
   * 做法的中性标签（如 approach / avoid / wait / observe），
   * 只用于生成「你两次都选了…」这类事实性候选观察，不映射人格。
   */
  tags: z.array(z.string().min(1).max(16)).max(3).optional(),
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
  /** 归属角色；有角色的事件只从角色卡触发，不在场景里自动弹出 */
  characterId: z.string().min(1).max(40).optional(),
  /** 触发所需的最低理解度（仅角色事件） */
  minAffinity: z.number().int().min(0).max(100).optional(),
  narrative: z.array(z.string().min(1).max(140)).min(1).max(4),
  choices: z.array(eventChoiceSchema).min(2).max(4),
  memory: z.object({
    /** 事件完成后是否提供「可跳过」的理由填写入口 */
    askReason: z.boolean(),
  }),
}).superRefine((event, ctx) => {
  // 同一事件内的选项 id 必须唯一，否则经历记录无法区分玩家到底选了哪一个
  const seen = new Set<string>()
  event.choices.forEach((choice, index) => {
    if (seen.has(choice.id)) {
      ctx.addIssue({
        code: 'custom',
        message: `事件 ${event.id} 的选项 id 重复：${choice.id}`,
        path: ['choices', index, 'id'],
      })
    }
    seen.add(choice.id)
  })
})

export type GameEvent = z.infer<typeof gameEventSchema>
export type EventChoice = z.infer<typeof eventChoiceSchema>
