import type { DialogueLine } from '../../store/uiStore'

export interface DialogueScript {
  id: string
  lines: DialogueLine[]
  onFinish?: () => void
}

export type { DialogueLine }
