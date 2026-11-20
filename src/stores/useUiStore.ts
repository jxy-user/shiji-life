import { create } from 'zustand'

/**
 * 轻量 UI 状态
 *
 * 单独成文件、不引入任何校验库：它会被首屏（App 根节点）引用，
 * 若与游戏存档 store 混在一起，zod 会跟着进入首包。
 */
type UiState = {
  /** 最近一次写盘是否失败，用于全局提示 */
  persistenceError: boolean
  setPersistenceError: (value: boolean) => void
}

export const useUiStore = create<UiState>()((set) => ({
  persistenceError: false,
  setPersistenceError: (value) => set({ persistenceError: value }),
}))
