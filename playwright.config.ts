import { defineConfig, devices } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// E2E 不测开屏影片本身：预置 shiji.motion.v1 让 IntroGate 不拦截既有流程。
const motionStatePath = join(tmpdir(), 'shiji-motion-state.json')
mkdirSync(tmpdir(), { recursive: true })
writeFileSync(motionStatePath, JSON.stringify({
  origins: [
    {
      origin: 'http://127.0.0.1:4173',
      localStorage: [{ name: 'shiji.motion.v1', value: JSON.stringify({ introSeenAt: '2026-01-01T00:00:00.000Z' }) }],
    },
  ],
}))

export default defineConfig({
  testDir: './tests/e2e',
  // 文件内顺序执行、跨文件并行：Firefox 在文件内并行跑 axe 全 DOM 遍历偶发崩溃
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  // Firefox 并行跑 axe 全 DOM 遍历偶发崩溃；本地也留 1 次重试吸收，CI 仍为 2 次
  retries: process.env.CI ? 2 : 1,
  workers: 2,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    storageState: motionStatePath,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
