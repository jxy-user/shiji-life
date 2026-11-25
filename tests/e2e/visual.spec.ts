import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { createJourneySave, createReflectionSave, seedSave } from './fixtures'

const screenshotDir = 'test-results/acceptance'

test('captures the G desktop system at release viewport sizes', async ({ page }) => {
  await mkdir(screenshotDir, { recursive: true })
  const save = createReflectionSave()
  save.journals = [{
    id: 'journal-1',
    type: 'free',
    text: '今天在广场坐了一会儿，风很轻。',
    period: '傍晚',
    createdAt: '2026-11-25T10:00:00.000Z',
    updatedAt: '2026-11-25T10:00:00.000Z',
    actionId: null,
    insightId: null,
    sceneId: 'plaza',
    linkLabel: '关联地点：中央广场',
    artKey: 'sketch-desk',
  }]
  save.actions = [{
    id: 'action-1',
    title: '下楼走十分钟',
    sourceInsightId: null,
    sourceLabel: '自己的选择',
    status: 'todo',
    when: 'today',
    doneAt: null,
    artKey: 'sketch-plane',
    createdAt: '2026-11-25T10:00:00.000Z',
    updatedAt: '2026-11-25T10:00:00.000Z',
    autoReviewJournalId: null,
  }]
  await seedSave(page, save)

  const captures = [
    { width: 1440, height: 900, path: '/', name: 'start-1440' },
    { width: 1440, height: 900, path: '/city', name: 'city-1440' },
    { width: 1440, height: 900, path: '/scene/plaza', name: 'scene-1440' },
    { width: 1440, height: 900, path: '/event/bench', name: 'event-1440' },
    { width: 1440, height: 900, path: '/archive?experience=exp-1', name: 'archive-1440' },
    { width: 1440, height: 900, path: '/reflection', name: 'reflection-1440' },
    { width: 1440, height: 900, path: '/journal?id=journal-1', name: 'journal-1440' },
    { width: 1440, height: 900, path: '/actions?id=action-1', name: 'actions-1440' },
    { width: 1440, height: 900, path: '/settings', name: 'settings-1440' },
    { width: 1280, height: 800, path: '/city', name: 'city-1280' },
    { width: 1024, height: 768, path: '/city', name: 'city-1024' },
  ]

  for (const capture of captures) {
    await page.setViewportSize({ width: capture.width, height: capture.height })
    await page.goto(capture.path)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `${capture.name} overflow`).toBe(false)
    if (capture.path !== '/') {
      const sidebarWidth = await page.locator('aside').first().evaluate((element) => element.getBoundingClientRect().width)
      expect(sidebarWidth).toBe(capture.width >= 1200 ? 224 : 72)
    }
    await page.screenshot({ path: `${screenshotDir}/${capture.name}.png`, fullPage: true, animations: 'disabled' })
  }
})

test('keeps city and tools usable at secondary widths and 200% zoom equivalent', async ({ page }) => {
  await seedSave(page, createJourneySave())
  for (const viewport of [
    { width: 768, height: 900 },
    { width: 640, height: 480 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    for (const path of ['/city', '/journal', '/actions', '/settings']) {
      await page.goto(path)
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `${path} at ${viewport.width}`).toBe(false)
    }
  }
})
