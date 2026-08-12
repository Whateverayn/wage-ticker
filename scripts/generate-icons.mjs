// Regenerate PWA icon PNGs from scripts/icon-source.svg.
// Run with: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'scripts/icon-source.svg'))

const targets = [
  { out: 'public/icons/icon-192.png', size: 192 },
  { out: 'public/icons/icon-512.png', size: 512 },
  { out: 'public/apple-touch-icon.png', size: 180 },
  { out: 'public/favicon.png', size: 32 },
]

for (const { out, size } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(join(root, out))
  console.log(`wrote ${out} (${size}x${size})`)
}
