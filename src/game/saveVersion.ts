/**
 * 存档版本号
 *
 * 单独成文件、不依赖 zod：首屏需要判断「有没有可继续的存档」，
 * 但首屏不应为此加载整个校验库。
 *
 * v1: 基础角色与进度
 * v2: 新增 experiences、seenEventIds、settings
 * v3: 新增 reflections、candidateInsights、insights、choiceTags、回顾设置
 * v4: 新增 actions、journalEntries、chapterSummaries（M5：现实行动、日记、阶段总结）
 */
export const SAVE_VERSION = 4
