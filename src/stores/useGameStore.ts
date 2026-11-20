import { create } from 'zustand'

import { hasSave } from '@/services/storage'

/**
 * 游戏全局状态（M0 阶段只承载存档探测）
 *
 * 后续加入：当前章节、所在区域、游戏时间、精力、经历列表。
 * 规则变化一律通过明确的 action 进行，AI 不得直接修改这里的字段。
 */
type GameState = {
  /** 是否存在可继续的本地存档 */
  hasSave: boolean
  /** 重新探测存档状态（进入开始页时调用） */
  refreshSaveState: () => void
}

export const useGameStore = create<GameState>()((set) => ({
  hasSave: hasSave(),
  refreshSaveState: () => set({ hasSave: hasSave() }),
}))
