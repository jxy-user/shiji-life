export const actionTransitions: Record<import('./types').ActionStatus, readonly import('./types').ActionStatus[]> = {
  todo: ['doing', 'paused'],
  doing: ['paused', 'done'],
  paused: ['doing'],
  done: ['todo'],
}

export function canTransition(from: import('./types').ActionStatus, to: import('./types').ActionStatus) {
  return actionTransitions[from].includes(to)
}
