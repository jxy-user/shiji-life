import { create } from 'zustand'

export interface DialogueLine {
  speaker: 'narrator' | 'lumi'
  text: string
}

export interface DialogueState {
  lines: DialogueLine[]
  index: number
  onFinish?: () => void
}

export type ToastTone = 'success' | 'info' | 'warn'

export interface ToastState {
  id: number
  message: string
  tone: ToastTone
}

interface UIStore {
  toast: ToastState | null
  dialogue: DialogueState | null
  /** 对话正在播放退场动画，此时仍渲染但不可交互 */
  dialogueClosing: boolean
  showToast: (message: string, tone?: ToastTone) => void
  clearToast: () => void
  openDialogue: (dialogue: Omit<DialogueState, 'index'>) => void
  advanceDialogue: () => void
  closeDialogue: () => void
  beginDialogueClose: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  toast: null,
  dialogue: null,
  dialogueClosing: false,
  showToast: (message, tone = 'success') => set({ toast: { id: Date.now(), message, tone } }),
  clearToast: () => set({ toast: null }),
  openDialogue: (dialogue) => set({ dialogue: { ...dialogue, index: 0 }, dialogueClosing: false }),
  advanceDialogue: () => {
    const dialogue = get().dialogue
    if (!dialogue) return
    if (dialogue.index < dialogue.lines.length - 1) {
      set({ dialogue: { ...dialogue, index: dialogue.index + 1 } })
      return
    }
    const onFinish = dialogue.onFinish
    set({ dialogue: null, dialogueClosing: false })
    onFinish?.()
  },
  closeDialogue: () => set({ dialogue: null, dialogueClosing: false }),
  beginDialogueClose: () => set({ dialogueClosing: true }),
}))
