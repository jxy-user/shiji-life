/**
 * 存档里用到的枚举值
 *
 * 单独成文件、不依赖 zod：首屏的轻量存档判断需要这些值，
 * 但不应该为此把整个校验库带进首包。
 */

export const SCENE_IDS = ['plaza', 'home', 'campus', 'park'] as const
export type SceneId = (typeof SCENE_IDS)[number]

export const TIME_SLOTS = ['morning', 'noon', 'afternoon', 'evening'] as const
export type TimeSlot = (typeof TIME_SLOTS)[number]
