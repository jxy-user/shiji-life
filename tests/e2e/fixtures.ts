import type { Page } from '@playwright/test'
import { createEmptySave } from '../../src/domain/state'
import type { Experience, SaveV2 } from '../../src/domain/types'

export const SAVE_KEY = 'shiji.life.v2'
export const LEGACY_SAVE_KEY = 'shiji.life.v1'

export function createJourneySave(): SaveV2 {
  const save = createEmptySave()
  return {
    ...save,
    profile: {
      ...save.profile,
      name: '旅人',
      createdAt: '2026-11-25T10:00:00.000Z',
    },
    progress: {
      ...save.progress,
      prologueStep: 5,
      exploredSceneIds: ['plaza', 'park', 'harbor'],
    },
  }
}

export function createExperience(id: string, sceneId: string, title: string): Experience {
  return {
    id,
    eventId: id,
    sceneId,
    title,
    body: `${title}的正文。`,
    kind: 'event',
    occurredAt: '2026-11-25T10:00:00.000Z',
    consent: true,
    consentUpdatedAt: '2026-11-25T10:00:00.000Z',
    deletedAt: null,
    artKey: 'sketch-oldman',
  }
}

export function createReflectionSave(): SaveV2 {
  const save = createJourneySave()
  save.experiences = [
    createExperience('exp-1', 'plaza', '广场上的人群'),
    createExperience('exp-2', 'park', '晒干的长椅'),
    createExperience('exp-3', 'harbor', '靠岸的船'),
  ]
  return save
}

export async function seedSave(page: Page, save: SaveV2, legacyValue?: string) {
  await page.goto('/')
  await page.evaluate(({ key, value, legacyKey, legacy }) => {
    localStorage.setItem(key, JSON.stringify(value))
    if (legacy !== undefined) localStorage.setItem(legacyKey, legacy)
  }, { key: SAVE_KEY, value: save, legacyKey: LEGACY_SAVE_KEY, legacy: legacyValue })
  await page.reload()
}

export async function readSave(page: Page): Promise<SaveV2> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? 'null'), SAVE_KEY) as Promise<SaveV2>
}
