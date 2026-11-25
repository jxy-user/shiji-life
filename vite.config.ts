import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const base = process.env.VITE_BASE_URL || '/'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'preview-missing-asset-404',
      configurePreviewServer(server) {
        const basePath = server.config.base.replace(/\/+$/, '')
        const distAssets = path.resolve(server.config.root, server.config.build.outDir, 'assets')
        server.middlewares.use((request, response, next) => {
          const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
          const assetPrefix = `${basePath}/assets/`
          if (!pathname.startsWith(assetPrefix)) return next()

          const relativePath = decodeURIComponent(pathname.slice(assetPrefix.length))
          const assetPath = path.resolve(distAssets, relativePath)
          if (!assetPath.startsWith(`${distAssets}${path.sep}`) || !fs.existsSync(assetPath)) {
            response.statusCode = 404
            response.setHeader('Content-Type', 'text/plain; charset=utf-8')
            response.end('Not found')
            return
          }
          next()
        })
      },
    },
  ],
  base,
  server: {
    host: '127.0.0.1',
  },
  preview: {
    host: '127.0.0.1',
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-dom/client'],
          router: ['react-router-dom'],
          state: ['zustand', 'zod'],
          motion: ['gsap', '@gsap/react'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/components/**/*.test.{ts,tsx}'],
  },
})
