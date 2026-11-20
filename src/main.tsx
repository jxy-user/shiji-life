import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import App from '@/app/App'
import '@/index.css'

/**
 * 使用 HashRouter（哈希路由）的原因：
 * Qoder Sites 为静态托管，没有把未知路径重写到 index.html 的 SPA 回退，
 * 实测直接访问 /archive 会返回 404。哈希路由不依赖服务端配置，
 * 刷新和分享深层链接都能正常打开。
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
