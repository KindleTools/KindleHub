import fs from 'fs'

const coveragePath = './coverage/coverage-final.json'

if (!fs.existsSync(coveragePath)) {
  console.log('No coverage file found')

  process.exit(1)
}

const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))

let totalStatements = 0
let coveredStatements = 0
let totalBranches = 0
let coveredBranches = 0
let totalFunctions = 0
let coveredFunctions = 0

for (const filePath in coverage) {
  const fileCov = coverage[filePath]

  // Statements
  const statements = fileCov.s
  for (const key in statements) {
    totalStatements++
    if (statements[key] > 0) coveredStatements++
  }

  // Branches
  const branches = fileCov.b
  for (const key in branches) {
    // branches[key] is an array of counts per branch path
    const branchCounts = branches[key]
    totalBranches += branchCounts.length
    branchCounts.forEach((count) => {
      if (count > 0) coveredBranches++
    })
  }

  // Functions
  const functions = fileCov.f
  for (const key in functions) {
    totalFunctions++
    if (functions[key] > 0) coveredFunctions++
  }
}

console.log('--- Coverage Summary ---')
console.log(`Statements: ${((coveredStatements / totalStatements) * 100).toFixed(2)}% (${coveredStatements}/${totalStatements})`)
console.log(`Branches:   ${((coveredBranches / totalBranches) * 100).toFixed(2)}% (${coveredBranches}/${totalBranches})`)
console.log(`Functions:  ${((coveredFunctions / totalFunctions) * 100).toFixed(2)}% (${coveredFunctions}/${totalFunctions})`)
