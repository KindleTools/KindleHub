import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localesDir = path.join(__dirname, '../src/locales')
// We can dynamically read the directory or hardcode the list. Dynamic is better.
const files = fs.readdirSync(localesDir).filter((f) => f.endsWith('.json'))

console.log(`Checking i18n consistency for: ${files.join(', ')}`)

const contents = {}
files.forEach((file) => {
  contents[file] = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'))
})

const enKeys = getKeys(contents['en.json'])
let hasError = false

function getKeys(obj, prefix = '') {
  let keys = []
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'))
    } else {
      keys.push(prefix + key)
    }
  }
  return keys
}

files.forEach((file) => {
  if (file === 'en.json') return

  const fileKeys = new Set(getKeys(contents[file]))
  const missing = []

  enKeys.forEach((key) => {
    if (!fileKeys.has(key)) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    hasError = true
    console.error(`\n❌ ${file} is missing ${missing.length} keys:`)
    missing.slice(0, 10).forEach((k) => console.error(`   - ${k}`))
    if (missing.length > 10) console.error(`   ...and ${missing.length - 10} more.`)
  } else {
    console.log(`✅ ${file} is complete.`)
  }
})

if (hasError) {
  process.exit(1)
} else {
  console.log('\n✨ All locales are consistent!')
}
