/**
 * 游戏领域类型（权威定义）
 *
 * 经历类型统一使用英文标识，展示文案集中在 LABELS 中，
 * 避免事件数据、AI 提示词与界面各写一套中文名。
 */

/** 四类经历：事件、人际、行动、内心 */
export const EXPERIENCE_TYPES = ['event', 'social', 'action', 'inner'] as const
export type ExperienceType = (typeof EXPERIENCE_TYPES)[number]

export const EXPERIENCE_TYPE_LABELS: Record<ExperienceType, string> = {
  event: '事件经历',
  social: '人际经历',
  action: '行动经历',
  inner: '内心经历',
}

/** 五类认知卡片 */
export const INSIGHT_CATEGORIES = [
  'values',
  'patterns',
  'thinking',
  'direction',
  'change',
] as const
export type InsightCategory = (typeof INSIGHT_CATEGORIES)[number]

export const INSIGHT_CATEGORY_LABELS: Record<InsightCategory, string> = {
  values: '我在意什么',
  patterns: '我经常怎样做',
  thinking: '我如何思考',
  direction: '我想去哪里',
  change: '我准备如何改变',
}

/** 信息可信度：玩家表达、客观行为、AI 观察、待确认假设 */
export const CLAIM_SOURCES = [
  'explicit',
  'behavior',
  'observation',
  'hypothesis',
] as const
export type ClaimSource = (typeof CLAIM_SOURCES)[number]

export const CLAIM_SOURCE_LABELS: Record<ClaimSource, string> = {
  explicit: '你明确说过',
  behavior: '记录下来的行为',
  observation: '微光的观察',
  hypothesis: '待确认的猜测',
}

/** 城市区域 */
export const LOCATION_IDS = [
  'plaza',
  'home',
  'campus',
  'district',
  'studio',
  'park',
  'faraway',
] as const
export type LocationId = (typeof LOCATION_IDS)[number]

export const LOCATION_LABELS: Record<LocationId, string> = {
  plaza: '中央广场',
  home: '家',
  campus: '校园',
  district: '街区',
  studio: '工作室',
  park: '公园',
  faraway: '远方',
}
