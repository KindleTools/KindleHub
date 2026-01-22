import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localesDir = path.join(__dirname, '../src/locales')
const enPath = path.join(localesDir, 'en.json')

if (!fs.existsSync(enPath)) {
  console.error('Base locale en.json not found!')
  process.exit(1)
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'))

function flattenKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : ''
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k]))
      Object.assign(acc, flattenKeys(obj[k], pre + k))
    else
      acc[pre + k] = true
    return acc
  }, {})
}

const enKeys = flattenKeys(en)

const locales = ['de', 'fr', 'it', 'pt', 'es']
let hasErrors = false

locales.forEach((loc) => {
  const locPath = path.join(localesDir, `${loc}.json`)
  if (!fs.existsSync(locPath)) {
    console.warn(`Locale ${loc}.json not found.`)
    return
  }

  const content = JSON.parse(fs.readFileSync(locPath, 'utf8'))
  const locKeys = flattenKeys(content)

  const missing = Object.keys(enKeys).filter((k) => !locKeys[k])

  if (missing.length > 0) {
    console.log(`\n[${loc.toUpperCase()}] Missing ${missing.length} keys:`)
    missing.forEach((k) => console.log(`  - ${k}`))
    hasErrors = true
  } else {
    console.log(`[${loc.toUpperCase()}] OK`)
  }
})

if (hasErrors) {
  process.exit(1)
} else {
  console.log('\nAll locales are in sync.')
}
