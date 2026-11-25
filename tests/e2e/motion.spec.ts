import { expect, test } from '@playwright/test'
import { createJourneySave, seedSave } from './fixtures'

// 章节幕布：纯视觉层，必须可穿透、可跳过、时长受控（≈2.2s，上限 2.6s）。
test('chapter curtain never blocks pointer and finishes quickly', async ({ page }) => {
  const save = createJourneySave()
  save.summary = { title: '第 1 章', text: '小结。', updatedAt: '2026-11-25T10:00:00.000Z' }
  save.progress.exploredSceneIds = ['home', 'school', 'plaza', 'blocks', 'park']
  await seedSave(page, save)

  await page.goto('/city')
  const curtain = page.locator('.g-curtain-root')
  await expect(curtain).toBeVisible()

  // 根节点不吞指针，只有跳过按钮可点
  const pointerEvents = await curtain.evaluate((node) => getComputedStyle(node).pointerEvents)
  expect(pointerEvents).toBe('none')

  // 幕布不会长时间滞留（2.6s 内清场）
  await expect(curtain).toHaveCount(0, { timeout: 2600 })
})

test('chapter curtain can be dismissed by escape', async ({ page }) => {
  const save = createJourneySave()
  save.summary = { title: '第 1 章', text: '小结。', updatedAt: '2026-11-25T10:00:00.000Z' }
  save.progress.exploredSceneIds = ['home', 'school', 'plaza', 'blocks', 'park']
  await seedSave(page, save)

  await page.goto('/city')
  const curtain = page.locator('.g-curtain-root')
  await expect(curtain).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(curtain).toHaveCount(0, { timeout: 500 })
})

// 事件揭晓：提交后结果纸先被遮住再自上而下揭开，「已完成」章随之落定。
test('event result reveals with a mask and settles without clipped content', async ({ page }) => {
  await seedSave(page, createJourneySave())
  await page.goto('/event/bench')
  await page.getByText('在他旁边坐下', { exact: true }).click()
  await page.getByRole('button', { name: '保存这次经历' }).click()

  const heading = page.getByRole('heading', { name: '这次相遇，已经留下。' })
  await expect(heading).toBeVisible()
  // 揭晓结束后没有残留裁剪与 transform，重放基线不会漂移
  await expect.poll(async () => heading.evaluate((node) => getComputedStyle(node).opacity), { timeout: 2500 }).toBe('1')
  const sheetClip = await page.locator('[data-reveal-sheet]').evaluate((node) => getComputedStyle(node).clipPath)
  // 揭开后不应再是「上方裁到剩 0%」的遮罩态
  expect(sheetClip).not.toContain('100%')
})

// 对白关闭要有退场再卸载，避免硬切。
test('micro-dialogue closes with a short exit', async ({ page }) => {
  await seedSave(page, createJourneySave())
  await page.goto('/scene/plaza')
  const panel = page.getByRole('region', { name: '微光对话' }).or(page.locator('aside[aria-label="微光对话"]'))
  await expect(panel.first()).toBeVisible()
  const closeBtn = page.getByRole('button', { name: '关闭微光对话' })
  await closeBtn.click()
  // 退场约 150ms，比入场短；随后彻底卸载
  await expect(page.locator('aside[aria-label="微光对话"]')).toHaveCount(0, { timeout: 800 })
})
