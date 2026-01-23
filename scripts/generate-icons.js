import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(__dirname, '../public')
const sourceIcon = path.join(publicDir, 'icon.png')

if (!fs.existsSync(sourceIcon)) {
  console.error('Source icon not found:', sourceIcon)
  process.exit(1)
}

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.ico', size: 32 } // sharp can output png, we might rename or convert. For simple ico, png often works in modern browsers or we force format.
]

async function generate() {
  for (const icon of sizes) {
    const outputPath = path.join(publicDir, icon.name)
    console.log(`Generating ${icon.name}...`)

    await sharp(sourceIcon)
      .resize(icon.size, icon.size)
      .toFile(outputPath)
  }
}

generate().catch(console.error)
