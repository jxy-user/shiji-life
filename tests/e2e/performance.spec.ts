import { expect, test } from '@playwright/test'
import { readFile, readdir } from 'node:fs/promises'
import { gzipSync } from 'node:zlib'
import { createJourneySave, seedSave } from './fixtures'

interface RuntimeMetrics {
  lcp: number
  cls: number
  events: number[]
}

interface MetricsLayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

async function initialJavaScriptGzip() {
  const html = await readFile('dist/index.html', 'utf8')
  const entry = html.match(/src="([^"]+\.js)"/)?.[1]
  if (!entry) throw new Error('Production entry script was not found.')
  const pending = [entry]
  const visited = new Set<string>()
  let total = 0
  while (pending.length) {
    const asset = pending.pop()!
    if (visited.has(asset)) continue
    visited.add(asset)
    const source = await readFile(`dist${asset}`)
    total += gzipSync(source).length
    const code = source.toString()
    for (const match of code.matchAll(/(?:from\s*|import\s*)["'](\.\/[^"']+\.js)["']/g)) {
      pending.push(new URL(match[1]!, `http://localhost${asset}`).pathname)
    }
  }
  return total
}

test('keeps initial and route JavaScript within the release budgets', async () => {
  const initial = await initialJavaScriptGzip()
  expect(initial).toBeLessThanOrEqual(200 * 1024)
  const files = await readdir('dist/assets')
  const routeNames = ['ActionsPage', 'ArchivePage', 'CityPage', 'EventPage', 'JournalPage', 'NotFoundPage', 'ReflectionPage', 'ScenePage', 'SettingsPage']
  const routeFiles = files.filter((file) => file.endsWith('.js') && routeNames.some((name) => file.startsWith(`${name}-`)))
  expect(routeFiles.length).toBeGreaterThan(0)
  for (const file of routeFiles) {
    const source = await readFile(`dist/assets/${file}`)
    expect(gzipSync(source).length, file).toBeLessThanOrEqual(60 * 1024)
  }
})

test('meets LCP, CLS and INP targets on the production start and city flow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Core Web Vitals are measured in Chromium.')
  await seedSave(page, createJourneySave())
  await page.addInitScript(() => {
    const metrics: RuntimeMetrics = { lcp: 0, cls: 0, events: [] }
    Object.defineProperty(window, '__runtimeMetrics', { value: metrics })
    new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[]
      const last = entries.at(-1) as PerformancePaintTiming | undefined
      if (last) metrics.lcp = last.startTime
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as MetricsLayoutShift[]) {
        if (!entry.hadRecentInput) metrics.cls += entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
    new PerformanceObserver((list) => {
      metrics.events.push(...(list.getEntries() as PerformanceEventTiming[]).map((entry) => entry.duration))
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit & { durationThreshold: number })
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('拾己')
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
  const initialMetrics = await page.evaluate(() => (window as unknown as { __runtimeMetrics: RuntimeMetrics }).__runtimeMetrics)
  expect(initialMetrics.lcp).toBeGreaterThan(0)
  expect(initialMetrics.lcp).toBeLessThanOrEqual(2500)
  expect(initialMetrics.cls).toBeLessThanOrEqual(0.1)

  await page.getByRole('button', { name: '继续旅程' }).click()
  await expect(page.getByRole('heading', { level: 1, name: '未完成之城' })).toBeVisible()
  await page.getByRole('link', { name: '前往中央广场' }).click()
  await expect(page.getByRole('heading', { level: 1, name: '中央广场' })).toBeVisible()
  await page.getByRole('button', { name: '返回城市' }).click()
  await page.getByRole('link', { name: '人生档案', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: '人生档案' })).toBeVisible()
  await page.waitForTimeout(300)
  const finalMetrics = await page.evaluate(() => (window as unknown as { __runtimeMetrics: RuntimeMetrics }).__runtimeMetrics)
  const sorted = [...finalMetrics.events].sort((a, b) => a - b)
  expect(sorted.length).toBeGreaterThan(0)
  const inp = sorted[Math.floor(sorted.length * 0.9)] ?? 0
  expect(inp).toBeLessThanOrEqual(200)
  expect(finalMetrics.cls).toBeLessThanOrEqual(0.1)
})
