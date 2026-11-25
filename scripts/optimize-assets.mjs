import { mkdir, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = path.join(root, 'assets', 'img')
const outputDir = path.join(sourceDir, 'webp')

const assets = {
  'avatar-chenguang': [160, 320, 512],
  'avatar-yese': [160, 320, 512],
  'avatar-qingtai': [160, 320, 512],
  'avatar-taotu': [160, 320, 512],
  'night-room': [480, 800, 1000],
  plaza: [420, 700, 1000],
  'sketch-plaza': [400, 800],
  'sketch-oldman': [480, 800, 1200],
  'sketch-bridge': [400, 800],
  'sketch-mugs': [400, 800],
  'sketch-desk': [400, 800],
  'sketch-park': [400, 800],
  'sketch-ruins': [400, 800],
  'sketch-plane': [400, 800],
  'sketch-map': [400, 800],
}

await rm(outputDir, { recursive: true, force: true })
await mkdir(outputDir, { recursive: true })

let generated = 0
let sourceBytes = 0
let outputBytes = 0

for (const [name, widths] of Object.entries(assets)) {
  const source = path.join(sourceDir, `${name}.jpg`)
  const metadata = await sharp(source).metadata()
  sourceBytes += (await stat(source)).size

  for (const width of widths) {
    if (width > metadata.width) continue
    const output = path.join(outputDir, `${name}-${width}.webp`)
    const info = await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .modulate({ saturation: 0.9, contrast: 1.04 })
      .sharpen({ sigma: 0.7, m1: 0.5, m2: 0.2 })
      .webp({ quality: 78, effort: 6 })
      .toFile(output)
    outputBytes += (await stat(output)).size
    generated += 1
    console.log(`${name}-${width}.webp ${info.width}x${info.height}`)
  }
}

console.log(`Generated ${generated} WebP files: ${(sourceBytes / 1024).toFixed(1)} KiB source -> ${(outputBytes / 1024).toFixed(1)} KiB total variants.`)
