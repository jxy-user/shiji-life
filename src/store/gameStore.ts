import { create } from 'zustand'
import { canTransition } from '../domain/actionStateMachine'
import {
  actionInputSchema,
  eventInputSchema,
  insightInputSchema,
  journalInputSchema,
  onboardingSchema,
  saveSchema,
} from '../domain/schema'
import { createEmptySave } from '../domain/state'
import type {
  Action,
  ActionInput,
  ActionStatus,
  EventInput,
  Experience,
  Insight,
  InsightInput,
  InsightStatus,
  Journal,
  JournalInput,
  OnboardingInput,
  SaveV2,
  Settings,
} from '../domain/types'
import { clearSave, loadSave, SAVE_KEY, writeSave, type StorageStatus } from './persistence'

const initialLoad = loadSave()

function makeId(prefix: string) {
  const value = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${prefix}-${value}`
}

function now() {
  return new Date().toISOString()
}

interface GameStore {
  save: SaveV2
  storageStatus: StorageStatus
  storageMessage: string | null
  startNewJourney: () => void
  completeOnboarding: (input: OnboardingInput) => void
  setPrologueStep: (step: number) => void
  recordSceneVisit: (sceneId: string) => void
  dismissInvite: () => void
  markLumiMet: () => void
  markScriptPlayed: (scriptId: string) => void
  unlockChapter2: () => void
  completeEvent: (input: EventInput) => string
  setExperienceConsent: (id: string, consent: boolean) => void
  deleteExperience: (id: string) => void
  restoreExperience: (id: string) => void
  ensureInsight: (input: InsightInput) => string
  judgeInsight: (id: string, status: InsightStatus, rewrittenText?: string) => void
  createAction: (input: ActionInput) => string
  changeActionStatus: (id: string, status: ActionStatus) => boolean
  completeAction: (id: string) => boolean
  repeatAction: (id: string) => boolean
  deleteAction: (id: string) => void
  createJournal: (input: JournalInput) => string
  updateJournal: (id: string, input: JournalInput) => void
  deleteJournal: (id: string) => void
  updateSettings: (input: Partial<Pick<Settings, 'defaultExperienceConsent' | 'invitationsEnabled'>>) => void
  updateSummary: (title: string, text: string) => void
  resetProgress: () => void
  replaceFromStorage: (save: SaveV2, status?: StorageStatus, message?: string | null) => void
}

export const useGameStore = create<GameStore>((set, get) => {
  const commit = (save: SaveV2) => {
    const result = writeSave(save)
    set({ save, storageStatus: result.status, storageMessage: result.message })
    return result
  }

  return {
    save: initialLoad.save,
    storageStatus: initialLoad.status,
    storageMessage: initialLoad.message,

    startNewJourney: () => {
      commit(createEmptySave())
    },

    completeOnboarding: (input) => {
      const parsed = onboardingSchema.parse(input)
      const timestamp = now()
      const save = get().save
      commit({
        ...save,
        profile: {
          name: parsed.name || '旅人',
          avatarId: parsed.avatarId,
          lifeStages: parsed.lifeStages,
          topics: parsed.topics,
          createdAt: timestamp,
        },
        progress: {
          ...save.progress,
          prologueStep: 5,
        },
      })
    },

    setPrologueStep: (step) => {
      const save = get().save
      commit({
        ...save,
        progress: { ...save.progress, prologueStep: Math.max(0, Math.min(5, step)) },
      })
    },

    recordSceneVisit: (sceneId) => {
      const save = get().save
      if (save.progress.exploredSceneIds.includes(sceneId)) return
      commit({
        ...save,
        progress: {
          ...save.progress,
          exploredSceneIds: [...save.progress.exploredSceneIds, sceneId],
        },
      })
    },

    dismissInvite: () => {
      const save = get().save
      commit({ ...save, city: { ...save.city, inviteDismissedAt: now() } })
    },

    markLumiMet: () => {
      const save = get().save
      if (save.city.lumiMetAt) return
      commit({ ...save, city: { ...save.city, lumiMetAt: now() } })
    },

    markScriptPlayed: (scriptId) => {
      const save = get().save
      if (save.city.playedScriptIds.includes(scriptId)) return
      commit({
        ...save,
        city: { ...save.city, playedScriptIds: [...save.city.playedScriptIds, scriptId] },
      })
    },

    unlockChapter2: () => {
      const save = get().save
      if (save.progress.chapter !== 1 || !save.summary) return
      const timestamp = now()
      commit({
        ...save,
        progress: { ...save.progress, chapter: 2, chapter2UnlockedAt: timestamp },
        pastSummaries: [...save.pastSummaries, save.summary],
        summary: null,
      })
    },

    completeEvent: (input) => {
      const parsed = eventInputSchema.parse(input)
      const save = get().save
      const existing = save.events[parsed.eventId]
      if (existing) return existing.experienceId

      const timestamp = now()
      const experience: Experience = {
        id: makeId('exp'),
        eventId: parsed.eventId,
        sceneId: parsed.sceneId,
        title: parsed.title,
        body: parsed.body,
        kind: 'event',
        occurredAt: timestamp,
        consent: parsed.consent,
        consentUpdatedAt: timestamp,
        deletedAt: null,
        artKey: parsed.artKey,
      }
      commit({
        ...save,
        experiences: [experience, ...save.experiences],
        events: {
          ...save.events,
          [parsed.eventId]: {
            choiceId: parsed.choiceId,
            experienceId: experience.id,
            reason: parsed.reason,
            completedAt: timestamp,
          },
        },
      })
      return experience.id
    },

    setExperienceConsent: (id, consent) => {
      const save = get().save
      commit({
        ...save,
        experiences: save.experiences.map((experience) =>
          experience.id === id ? { ...experience, consent, consentUpdatedAt: now() } : experience,
        ),
      })
    },

    deleteExperience: (id) => {
      const save = get().save
      commit({
        ...save,
        experiences: save.experiences.map((experience) =>
          experience.id === id ? { ...experience, deletedAt: now() } : experience,
        ),
      })
    },

    restoreExperience: (id) => {
      const save = get().save
      commit({
        ...save,
        experiences: save.experiences.map((experience) =>
          experience.id === id ? { ...experience, deletedAt: null } : experience,
        ),
      })
    },

    ensureInsight: (input) => {
      const parsed = insightInputSchema.parse(input)
      const save = get().save
      const approvedIds = new Set(save.experiences.filter((experience) => experience.deletedAt === null && experience.consent).map((experience) => experience.id))
      const existing = save.insights.find((insight) => insight.key === parsed.key)
      if (existing) {
        const sourcesAreCurrent = existing.sourceExperienceIds.every((id) => approvedIds.has(id))
        commit({
          ...save,
          insights: save.insights.map((insight) =>
            insight.id === existing.id
              ? {
                  ...insight,
                  text: sourcesAreCurrent && insight.status !== 'guess' ? insight.text : parsed.text,
                  sourceExperienceIds: [...new Set([...insight.sourceExperienceIds.filter((id) => approvedIds.has(id)), ...parsed.sourceExperienceIds])],
                  status: sourcesAreCurrent ? insight.status : 'guess',
                  rewrittenText: sourcesAreCurrent ? insight.rewrittenText : null,
                  updatedAt: now(),
                }
              : insight,
          ),
        })
        return existing.id
      }

      const insight: Insight = {
        id: makeId('insight'),
        key: parsed.key,
        text: parsed.text,
        sourceExperienceIds: parsed.sourceExperienceIds,
        status: 'guess',
        rewrittenText: null,
        updatedAt: now(),
      }
      commit({ ...save, insights: [...save.insights, insight] })
      return insight.id
    },

    judgeInsight: (id, status, rewrittenText) => {
      const save = get().save
      commit({
        ...save,
        insights: save.insights.map((insight) =>
          insight.id === id
            ? {
                ...insight,
                status,
                rewrittenText: status === 'rewritten' ? rewrittenText?.trim() || insight.rewrittenText : insight.rewrittenText,
                updatedAt: now(),
              }
            : insight,
        ),
      })
    },

    createAction: (input) => {
      const parsed = actionInputSchema.parse(input)
      const timestamp = now()
      const action: Action = {
        id: makeId('action'),
        title: parsed.title,
        sourceInsightId: parsed.sourceInsightId ?? null,
        sourceLabel: parsed.sourceLabel,
        status: 'todo',
        when: parsed.when,
        doneAt: null,
        artKey: parsed.artKey,
        createdAt: timestamp,
        updatedAt: timestamp,
        autoReviewJournalId: null,
      }
      const save = get().save
      commit({ ...save, actions: [action, ...save.actions] })
      return action.id
    },

    changeActionStatus: (id, status) => {
      const save = get().save
      const action = save.actions.find((item) => item.id === id)
      if (!action || !canTransition(action.status, status)) return false
      if (status === 'done') return get().completeAction(id)
      commit({
        ...save,
        actions: save.actions.map((item) =>
          item.id === id ? { ...item, status, updatedAt: now() } : item,
        ),
      })
      return true
    },

    completeAction: (id) => {
      const save = get().save
      const action = save.actions.find((item) => item.id === id)
      if (!action || action.status !== 'doing') return false
      const timestamp = now()
      let journals = save.journals
      let autoReviewJournalId = action.autoReviewJournalId
      const existingReview = journals.find((journal) => journal.actionId === id)
      if (!existingReview) {
        const journal: Journal = {
          id: makeId('journal'),
          type: 'action',
          text: `行动复盘：${action.title}。做完了，也比想象中轻一点。`,
          period: save.progress.period,
          createdAt: timestamp,
          updatedAt: timestamp,
          actionId: action.id,
          insightId: action.sourceInsightId,
          sceneId: null,
          linkLabel: `关联行动：${action.title}`,
          artKey: action.artKey,
        }
        journals = [journal, ...journals]
        autoReviewJournalId = journal.id
      } else {
        autoReviewJournalId = existingReview.id
      }
      commit({
        ...save,
        actions: save.actions.map((item) =>
          item.id === id
            ? { ...item, status: 'done', doneAt: timestamp, updatedAt: timestamp, autoReviewJournalId }
            : item,
        ),
        journals,
      })
      return true
    },

    repeatAction: (id) => {
      const save = get().save
      const action = save.actions.find((item) => item.id === id)
      if (!action || action.status !== 'done') return false
      commit({
        ...save,
        actions: save.actions.map((item) =>
          item.id === id
            ? { ...item, status: 'todo', doneAt: null, updatedAt: now(), autoReviewJournalId: null }
            : item,
        ),
      })
      return true
    },

    deleteAction: (id) => {
      const save = get().save
      commit({
        ...save,
        actions: save.actions.filter((action) => action.id !== id),
        journals: save.journals.map((journal) =>
          journal.actionId === id ? { ...journal, actionId: null, linkLabel: null, updatedAt: now() } : journal,
        ),
      })
    },

    createJournal: (input) => {
      const parsed = journalInputSchema.parse(input)
      const timestamp = now()
      const journal: Journal = {
        id: makeId('journal'),
        type: parsed.type,
        text: parsed.text,
        period: parsed.period,
        createdAt: timestamp,
        updatedAt: timestamp,
        actionId: parsed.actionId ?? null,
        insightId: parsed.insightId ?? null,
        sceneId: parsed.sceneId ?? null,
        linkLabel: parsed.linkLabel || null,
        artKey: parsed.artKey,
      }
      const save = get().save
      commit({ ...save, journals: [journal, ...save.journals] })
      return journal.id
    },

    updateJournal: (id, input) => {
      const parsed = journalInputSchema.parse(input)
      const save = get().save
      commit({
        ...save,
        journals: save.journals.map((journal) =>
          journal.id === id
            ? {
                ...journal,
                type: parsed.type,
                text: parsed.text,
                period: parsed.period,
                actionId: journal.actionId,
                insightId: journal.insightId,
                sceneId: parsed.sceneId ?? null,
                linkLabel: journal.actionId || journal.insightId ? journal.linkLabel : parsed.linkLabel || null,
                artKey: parsed.artKey,
                updatedAt: now(),
              }
            : journal,
        ),
      })
    },

    deleteJournal: (id) => {
      const save = get().save
      commit({ ...save, journals: save.journals.filter((journal) => journal.id !== id) })
    },

    updateSettings: (input) => {
      const save = get().save
      commit({
        ...save,
        settings: {
          ...save.settings,
          defaultExperienceConsent: input.defaultExperienceConsent ?? save.settings.defaultExperienceConsent,
          invitationsEnabled: input.invitationsEnabled ?? save.settings.invitationsEnabled,
        },
      })
    },

    updateSummary: (title, text) => {
      const save = get().save
      commit({
        ...save,
        summary: {
          title: title.trim() || '第 1 章 · 初入未完成之城',
          text: text.trim() || '仍有许多路线未抵达。但已经走了很远。',
          updatedAt: now(),
        },
      })
    },

    resetProgress: () => {
      const result = clearSave()
      set({ save: createEmptySave(), storageStatus: result.status, storageMessage: result.message })
    },

    replaceFromStorage: (save, status = 'ready', message = null) => {
      set({ save: saveSchema.parse(save), storageStatus: status, storageMessage: message })
    },
  }
})

export function syncGameStoreFromStorage(event: StorageEvent) {
  if (event.key !== SAVE_KEY) return
  if (!event.newValue) {
    useGameStore.getState().replaceFromStorage(createEmptySave())
    return
  }
  try {
    useGameStore.getState().replaceFromStorage(saveSchema.parse(JSON.parse(event.newValue)))
  } catch {
    useGameStore.getState().replaceFromStorage(createEmptySave(), 'broken', '另一个标签页写入了无法读取的存档。')
  }
}
