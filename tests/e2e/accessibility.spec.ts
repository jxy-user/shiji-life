import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { createJourneySave, createReflectionSave, seedSave } from './fixtures'

function populatedSave() {
  const save = createReflectionSave()
  save.summary = { title: '第一章 · 慢慢走', text: '已经开始记得风的方向。', updatedAt: '2026-11-25T10:00:00.000Z' }
  save.insights = [{
    id: 'insight-1',
    key: '关于独处',
    text: '你需要在安静里待一会儿。',
    sourceExperienceIds: ['exp-1', 'exp-2', 'exp-3'],
    status: 'confirmed',
    rewrittenText: null,
    updatedAt: '2026-11-25T10:00:00.000Z',
  }]
  save.actions = [{
    id: 'action-1',
    title: '下楼走十分钟',
    sourceInsightId: 'insight-1',
    sourceLabel: '关于独处',
    status: 'done',
    when: 'today',
    doneAt: '2026-11-25T10:00:00.000Z',
    artKey: 'sketch-plane',
    createdAt: '2026-11-25T09:00:00.000Z',
    updatedAt: '2026-11-25T10:00:00.000Z',
    autoReviewJournalId: 'journal-action',
  }]
  save.journals = [
    {
      id: 'journal-action',
      type: 'action',
      text: '走完十分钟，身体轻松了一点。',
      period: '傍晚',
      createdAt: '2026-11-25T10:00:00.000Z',
      updatedAt: '2026-11-25T10:00:00.000Z',
      actionId: 'action-1',
      insightId: 'insight-1',
      sceneId: null,
      linkLabel: '关联行动：下楼走十分钟',
      artKey: 'sketch-plane',
    },
    {
      id: 'journal-1',
      type: 'free',
      text: '今天记住了一小段风。',
      period: '傍晚',
      createdAt: '2026-11-25T10:00:00.000Z',
      updatedAt: '2026-11-25T10:00:00.000Z',
      actionId: null,
      insightId: null,
      sceneId: 'plaza',
      linkLabel: '关联地点：中央广场',
      artKey: 'sketch-desk',
    },
  ]
  return save
}

const routes = [
  '/',
  '/prologue',
  '/create',
  '/city',
  '/scene/plaza',
  '/event/bench',
  '/archive?experience=exp-1',
  '/reflection?insight=insight-1',
  '/journal?id=journal-1',
  '/actions?id=action-1',
  '/settings',
  '/missing-route',
]

for (const route of routes) {
  test(`has no automated accessibility violations on ${route}`, async ({ page }) => {
    // 入场动效是装饰性的瞬态；axe 在淡入中途采样会把纸色与墨色按透明度混合，误报对比度。
    // 用 reduced motion 让页面停在终态后审计。
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await seedSave(page, populatedSave())
    const pageErrors: string[] = []
    const consoleErrors: string[] = []
    const failedRequests: string[] = []
    const externalRequests: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    page.on('requestfailed', (request) => failedRequests.push(request.url()))
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173/')) externalRequests.push(request.url())
    })

    await page.goto(route)
    await expect(page.locator('#main-content')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze()
    expect(results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })),
    }))).toEqual([])
    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
    expect(failedRequests).toEqual([])
    expect(externalRequests).toEqual([])
  })
}

test('keeps key dialogs accessible and traps keyboard focus', async ({ page }) => {
  await seedSave(page, populatedSave())
  await page.goto('/journal')
  await page.getByRole('button', { name: '写一页', exact: true }).click()
  const editor = page.getByRole('dialog', { name: '写一页日记' })
  await expect(editor).toBeVisible()
  let results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze()
  expect(results.violations.map((violation) => violation.id)).toEqual([])

  for (let index = 0; index < 18; index += 1) {
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true)
  }
  await page.keyboard.press('Escape')
  await expect(editor).not.toBeVisible()
  await expect(page.getByRole('button', { name: '写一页', exact: true })).toBeFocused()

  await page.goto('/settings')
  await page.getByRole('button', { name: '清空本机数据' }).click()
  const confirmation = page.getByRole('dialog', { name: '确认清空这台设备上的旅程数据？' })
  await expect(confirmation).toBeVisible()
  results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']).analyze()
  expect(results.violations.map((violation) => violation.id)).toEqual([])
})

test('respects reduced motion on animated city surfaces', async ({ page }) => {
  await seedSave(page, createJourneySave())
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/city')
  const durations = await page.locator('body *').evaluateAll((nodes) => nodes.map((node): [string, string] => {
    const style = getComputedStyle(node)
    return [style.animationDuration, style.transitionDuration]
  }))
  for (const [animation, transition] of durations) {
    expect(Number.parseFloat(animation)).toBeLessThanOrEqual(0.001)
    expect(Number.parseFloat(transition)).toBeLessThanOrEqual(0.001)
  }
})
