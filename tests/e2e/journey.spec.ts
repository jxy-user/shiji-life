import { expect, test, type Page } from '@playwright/test'
import {
  createExperience,
  createJourneySave,
  createReflectionSave,
  LEGACY_SAVE_KEY,
  readSave,
  SAVE_KEY,
  seedSave,
} from './fixtures'

function dialog(page: Page, name: string) {
  return page.getByRole('dialog', { name })
}

test('completes a new journey and snapshots event consent without duplicates', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('还没有本地存档')).toBeVisible()
  await expect(page.getByRole('button', { name: '继续旅程' })).toBeDisabled()
  await page.getByRole('button', { name: '开始新的旅程' }).click()

  await page.getByRole('button', { name: '继续', exact: true }).click()
  await page.getByRole('button', { name: '把信读完' }).click()
  const letter = dialog(page, '桌上的信')
  await expect(letter).toContainText('一封没有署名的信')
  await letter.getByRole('button', { name: '折好，放进口袋' }).click()
  await page.getByRole('button', { name: '继续', exact: true }).click()
  await page.getByRole('button', { name: '继续', exact: true }).click()
  await page.getByRole('button', { name: '推门，进入登记页' }).click()

  await page.getByLabel(/怎么称呼你/).fill('南风')
  await page.getByRole('button', { name: '推门，进入城市' }).click()
  await expect(page).toHaveURL(/\/city$/)
  await expect(page.getByRole('heading', { level: 1, name: '未完成之城' })).toBeVisible()

  await page.getByRole('link', { name: '设置', exact: true }).click()
  await page.getByText('新经历默认授权', { exact: true }).click()
  await expect(page.getByRole('switch', { name: /新经历默认授权/ })).toBeChecked()

  await page.getByRole('link', { name: '城市', exact: true }).click()
  await page.getByRole('link', { name: '前往中央广场' }).click()
  await expect(page.getByRole('heading', { level: 1, name: '中央广场' })).toBeVisible()
  await page.getByRole('button', { name: /看看来往的人/ }).click()
  await page.getByText('在他旁边坐下', { exact: true }).click()
  await page.getByLabel(/现场补充/).fill('风从河面吹过来。')
  await page.getByText('把这次经历用于阶段回顾', { exact: true }).click()
  await expect(page.getByRole('switch', { name: /把这次经历用于阶段回顾/ })).not.toBeChecked()
  await page.getByRole('button', { name: '保存这次经历' }).click()

  await expect(page.getByRole('heading', { name: '这次相遇，已经留下。' })).toBeVisible()
  let save = await readSave(page)
  expect(save.profile.name).toBe('南风')
  expect(save.experiences).toHaveLength(1)
  expect(save.experiences[0]?.consent).toBe(false)
  expect(save.experiences[0]?.body).toContain('风从河面吹过来')

  await page.reload()
  await expect(page.getByRole('heading', { name: '这次相遇，已经留下。' })).toBeVisible()
  save = await readSave(page)
  expect(save.experiences).toHaveLength(1)

  await page.goto('/settings')
  await page.getByText('新经历默认授权', { exact: true }).click()
  await expect(page.getByRole('switch', { name: /新经历默认授权/ })).not.toBeChecked()
  await page.goto('/event/bench')
  await expect(page.getByText('保留在本机，不进入回顾分析')).toBeVisible()
  expect((await readSave(page)).experiences[0]?.consent).toBe(false)
})

test('updates archive consent, soft-deletes, restores and saves a chapter summary', async ({ page }) => {
  const save = createJourneySave()
  save.experiences = [
    createExperience('exp-1', 'plaza', '广场上的人群'),
    createExperience('exp-2', 'park', '晒干的长椅'),
  ]
  await seedSave(page, save)
  await page.goto('/archive?experience=exp-1')

  const consent = page.getByRole('switch', { name: '允许这条经历进入阶段回顾' })
  await expect(consent).toBeChecked()
  await consent.click()
  await expect(consent).not.toBeChecked()
  expect((await readSave(page)).experiences.find((item) => item.id === 'exp-1')?.consent).toBe(false)

  await page.getByRole('button', { name: '收起经历' }).click()
  await dialog(page, '把这条经历收起？').getByRole('button', { name: '收起经历' }).click()
  await expect(page.getByRole('heading', { name: '广场上的人群' })).toHaveCount(0)
  await page.getByRole('button', { name: /已收起 1 条经历/ }).click()
  await page.getByRole('button', { name: '恢复', exact: true }).click()
  await expect(page.getByRole('heading', { name: '广场上的人群' })).toBeVisible()

  await page.getByRole('button', { name: '写阶段总结' }).click()
  const summary = dialog(page, '写阶段总结')
  await summary.getByLabel('这一章的名字').fill('第一章 · 风开始变软')
  await summary.getByLabel('此刻想留下的话').fill('我开始记得经过的地方。')
  await summary.getByRole('button', { name: '保存总结' }).click()
  await expect(page.getByRole('heading', { name: '第一章 · 风开始变软' })).toBeVisible()
  expect((await readSave(page)).summary?.text).toBe('我开始记得经过的地方。')
})

test('creates, rewrites, invalidates and restores a sourced observation', async ({ page }) => {
  await seedSave(page, createReflectionSave())
  await page.goto('/reflection')
  await expect(page.getByText('3 / 3 条')).toBeVisible()
  await expect(page.getByText('3 / 2 类')).toBeVisible()
  await expect(page.getByText('可以回顾', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: /让微光留一个猜测/ }).click()
  await expect(page.getByText('这只是猜测')).toBeVisible()
  let save = await readSave(page)
  expect(save.insights).toHaveLength(1)
  expect(save.insights[0]?.sourceExperienceIds).toEqual(['exp-1', 'exp-2', 'exp-3'])

  await page.getByRole('button', { name: '换成我的说法' }).click()
  const rewrite = dialog(page, '换成更接近你的说法')
  await rewrite.getByLabel('我的说法').fill('我需要在安静里确认自己的节奏。')
  await rewrite.getByRole('button', { name: '保存这句话' }).click()
  await expect(page.getByText('换成你的说法')).toBeVisible()
  await expect(page.getByRole('blockquote')).toHaveText('我需要在安静里确认自己的节奏。')

  await page.getByRole('switch', { name: '撤销回顾：广场上的人群' }).click()
  await expect(page.getByText('这条观察的依据已经变化')).toBeVisible()
  await expect(page.getByRole('blockquote')).toHaveCount(0)
  await page.getByRole('switch', { name: '允许回顾：广场上的人群' }).click()
  await expect(page.getByText('换成你的说法')).toBeVisible()
  await expect(page.getByText('这条观察的依据已经变化')).toHaveCount(0)

  await page.getByRole('button', { name: '有点像我' }).click()
  await expect(page.getByText('你说有点像我')).toBeVisible()
  await page.getByRole('switch', { name: '撤销回顾：广场上的人群' }).click()
  await page.goto('/archive')
  await expect(page.getByText('我需要在安静里确认自己的节奏。')).toHaveCount(0)
  await expect(page.getByText('还没有被你确认的观察。猜测只有经过你的判断，才会成为索引。')).toBeVisible()
  save = await readSave(page)
  expect(save.insights[0]?.status).toBe('confirmed')
})

test('creates, deep-links, edits, filters and deletes a private journal', async ({ page }) => {
  await seedSave(page, createJourneySave())
  await page.goto('/journal?new=1&scene=plaza')
  const editor = dialog(page, '写一页日记')
  await editor.getByText('自由记录', { exact: true }).click()
  await editor.getByLabel(/想留下什么/).fill('今天在广场坐了一会儿，没有急着离开。')
  await editor.getByLabel(/关联地点/).selectOption('plaza')
  await editor.getByRole('button', { name: '收进日记' }).click()
  await expect(page).toHaveURL(/\/journal\?id=/)
  const journalId = new URL(page.url()).searchParams.get('id')
  expect(journalId).toBeTruthy()
  await expect(page.getByRole('heading', { name: '关联地点：中央广场' })).toBeVisible()

  await page.reload()
  await expect(page.getByRole('article').getByText('今天在广场坐了一会儿，没有急着离开。')).toBeVisible()
  await page.getByRole('button', { name: '编辑', exact: true }).click()
  const edit = dialog(page, '编辑这一页')
  await edit.getByLabel(/想留下什么/).fill('今天在广场坐了一会儿，风很轻。')
  await edit.getByRole('button', { name: '保存修改' }).click()
  let save = await readSave(page)
  expect(save.journals).toHaveLength(1)
  expect(save.journals[0]?.text).toBe('今天在广场坐了一会儿，风很轻。')

  await page.getByRole('button', { name: '自由记录', exact: true }).click()
  await expect(page.getByRole('article').getByText('今天在广场坐了一会儿，风很轻。')).toBeVisible()
  await page.getByRole('button', { name: '删除', exact: true }).click()
  await dialog(page, '删除这篇日记？').getByRole('button', { name: '确认删除' }).click()
  save = await readSave(page)
  expect(save.journals).toHaveLength(0)
  await expect(page.getByRole('heading', { name: '这个分类还是空的' })).toBeVisible()
})

test('keeps one edited action review across repeats and preserves it after action deletion', async ({ page }) => {
  await seedSave(page, createJourneySave())
  await page.goto('/actions?new=1&title=下楼走十分钟')
  const editor = dialog(page, '新建一项现实行动')
  await editor.getByText('今天', { exact: true }).click()
  await editor.getByRole('button', { name: '放进行动账本' }).click()
  await expect(page).toHaveURL(/\/actions\?id=/)
  const actionId = new URL(page.url()).searchParams.get('id')
  expect(actionId).toBeTruthy()

  await page.getByRole('button', { name: '开始这件事' }).click()
  await page.getByRole('button', { name: '先暂停' }).click()
  await page.getByRole('button', { name: '继续这件事' }).click()
  await page.getByRole('button', { name: '完成并复盘' }).click()
  const completed = await readSave(page)
  const reviewId = completed.actions.find((item) => item.id === actionId)?.autoReviewJournalId
  expect(reviewId).toBeTruthy()

  // 完成时微光对白会自动浮出并盖住复盘入口；先收掉浮层再继续，和真实操作一致。
  await page.getByRole('button', { name: '关闭微光对话' }).click()
  await page.getByRole('button', { name: /这篇行动已经自动留下复盘/ }).click()
  await page.getByRole('button', { name: '编辑', exact: true }).click()
  const edit = dialog(page, '编辑这一页')
  await edit.getByLabel(/想留下什么/).fill('我慢慢走完了十分钟，回来后轻松了一点。')
  await edit.getByLabel(/关联地点/).selectOption('park')
  await edit.getByRole('button', { name: '保存修改' }).click()
  let save = await readSave(page)
  expect(save.journals.find((item) => item.id === reviewId)?.actionId).toBe(actionId)
  expect(save.journals.find((item) => item.id === reviewId)?.text).toContain('慢慢走完')

  await page.goto(`/actions?id=${actionId}`)
  await page.getByRole('button', { name: '再做一次' }).click()
  await page.getByRole('button', { name: '开始这件事' }).click()
  await page.getByRole('button', { name: '完成并复盘' }).click()
  save = await readSave(page)
  expect(save.journals.filter((item) => item.actionId === actionId)).toHaveLength(1)
  expect(save.journals[0]?.id).toBe(reviewId)

  await page.getByRole('button', { name: '删除行动' }).click()
  await dialog(page, '删除这项行动？').getByRole('button', { name: '删除行动' }).click()
  save = await readSave(page)
  expect(save.actions).toHaveLength(0)
  expect(save.journals).toHaveLength(1)
  expect(save.journals[0]?.actionId).toBeNull()
})

test('resets only v2 data from settings and preserves v1 byte-for-byte', async ({ page }) => {
  const legacy = '{"schemaVersion":1,"sentinel":"never-read-or-change"}'
  const save = createJourneySave()
  save.experiences = [createExperience('exp-1', 'plaza', '广场上的人群')]
  await seedSave(page, save, legacy)
  await page.goto('/settings')

  await page.getByText('接收微光邀请', { exact: true }).click()
  await expect(page.getByRole('switch', { name: /接收微光邀请/ })).not.toBeChecked()
  await page.getByRole('button', { name: '清空本机数据' }).click()
  await dialog(page, '确认清空这台设备上的旅程数据？').getByRole('button', { name: '确认清空' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('button', { name: '继续旅程' })).toBeDisabled()
  const storage = await page.evaluate(({ v2, v1 }) => ({ v2: localStorage.getItem(v2), v1: localStorage.getItem(v1) }), { v2: SAVE_KEY, v1: LEGACY_SAVE_KEY })
  expect(storage.v2).toBeNull()
  expect(storage.v1).toBe(legacy)
})

test('starting a new journey overwrites v2 without touching v1', async ({ page }) => {
  const legacy = 'legacy-sentinel-001'
  const save = createJourneySave()
  save.experiences = [createExperience('exp-1', 'plaza', '广场上的人群')]
  await seedSave(page, save, legacy)
  await page.goto('/')
  await page.getByRole('button', { name: '开始新的旅程' }).click()
  await dialog(page, '开始新的旅程？').getByRole('button', { name: '清空并重新开始' }).click()
  await expect(page).toHaveURL(/\/prologue$/)
  const nextSave = await readSave(page)
  expect(nextSave.profile.createdAt).toBeNull()
  expect(nextSave.experiences).toHaveLength(0)
  expect(await page.evaluate((key) => localStorage.getItem(key), LEGACY_SAVE_KEY)).toBe(legacy)
})

test('returns a protected deep link after onboarding', async ({ page }) => {
  await page.goto('/journal?new=1&scene=plaza')
  await expect(page).toHaveURL(/\/create\?next=/)
  await page.getByRole('button', { name: '先跳过' }).click()
  await expect(page).toHaveURL(/\/journal\?new=1&scene=plaza$/)
  await expect(dialog(page, '写一页日记')).toBeVisible()
  expect((await readSave(page)).profile.name).toBe('旅人')
})

test('synchronizes consent changes between open tabs', async ({ page, context }) => {
  await seedSave(page, createJourneySave())
  const second = await context.newPage()
  await second.goto('/archive')
  await page.goto('/event/bench')
  await page.getByText('在他旁边坐下', { exact: true }).click()
  await page.getByText('把这次经历用于阶段回顾', { exact: true }).click()
  await page.getByRole('button', { name: '保存这次经历' }).click()
  await expect(second.getByRole('heading', { name: '长椅上的老人' })).toBeVisible()
  await second.getByRole('switch', { name: '允许这条经历进入阶段回顾' }).click()
  await expect(page.getByText('保留在本机，不进入回顾分析')).toBeVisible()
  expect((await readSave(page)).experiences).toHaveLength(1)
  expect((await readSave(page)).experiences[0]?.consent).toBe(false)
})
