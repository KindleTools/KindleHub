/* eslint-env node */
import fs from 'fs'
import path from 'path'

const coveragePath = './coverage/coverage-final.json'

if (!fs.existsSync(coveragePath)) {
  console.log('No coverage file found. Please run "npm run test:coverage" first.')
  // eslint-disable-next-line no-undef
  process.exit(1)
}

const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))

const fileStats = []

for (const filePath in coverage) {
  const fileCov = coverage[filePath]
  // eslint-disable-next-line no-undef
  const relativePath = path.relative(process.cwd(), filePath)

  let totalStatements = 0
  let coveredStatements = 0

  const statements = fileCov.s
  for (const key in statements) {
    totalStatements++
    if (statements[key] > 0) coveredStatements++
  }

  const percentage = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 100

  fileStats.push({
    path: relativePath,
    pct: percentage,
    missing: totalStatements - coveredStatements
  })
}

// Sort by potential impact (number of missing statements)
fileStats.sort((a, b) => b.missing - a.missing)

console.log('--- Top 10 Files with Missing Coverage ---')
fileStats.slice(0, 10).forEach((stat) => {
  console.log(`${stat.pct.toFixed(1)}% (${stat.missing} missing) - ${stat.path}`)
})
