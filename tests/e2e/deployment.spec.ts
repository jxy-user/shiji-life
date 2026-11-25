import { expect, test } from '@playwright/test'

const deepLinks = ['/scene/plaza', '/event/bench', '/journal?id=missing', '/actions?new=1']

test('serves the SPA document for deep links', async ({ request }) => {
  for (const path of deepLinks) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(200)
    expect(response.headers()['content-type'], path).toContain('text/html')
    expect(await response.text(), path).toContain('id="root"')
  }
})

test('returns a real 404 for missing images', async ({ request }) => {
  const response = await request.get('/assets/__missing_release_asset__.webp', {
    headers: { Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' },
  })
  expect(response.status()).toBe(404)
  expect(response.headers()['content-type'] ?? '').not.toContain('text/html')
})

test('loads only local assets and responsive WebP images', async ({ page }) => {
  const externalRequests: string[] = []
  const failedRequests: string[] = []
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4173/')) externalRequests.push(request.url())
  })
  page.on('requestfailed', (request) => failedRequests.push(request.url()))

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('拾己')
  await page.waitForLoadState('networkidle')

  const images = await page.locator('img').evaluateAll((nodes) => nodes.map((node) => {
    const image = node as HTMLImageElement
    return { currentSrc: image.currentSrc, complete: image.complete, naturalWidth: image.naturalWidth }
  }))
  expect(images.length).toBeGreaterThan(0)
  for (const image of images) {
    expect(image.complete).toBe(true)
    expect(image.naturalWidth).toBeGreaterThan(0)
    expect(image.currentSrc).toMatch(/(\.webp$|^data:image\/webp)/)
  }
  expect(externalRequests).toEqual([])
  expect(failedRequests).toEqual([])
})

test('keeps the start page within the viewport at release sizes', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 768, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
    expect(overflow, `${viewport.width}x${viewport.height}`).toBe(false)
  }
})
