// Regenerate src/data/licenses.generated.json from installed production dependencies.
// Run with: node scripts/generate-licenses.mjs
// Also acts as a license gate: fails the build if a dependency's license
// isn't on the permissive allowlist below, so an unreviewed copyleft
// dependency (e.g. GPL) can't slip into a production build unnoticed.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outFile = join(root, 'src/data/licenses.generated.json')

const ALLOWED_LICENSES = new Set([
  'MIT',
  'ISC',
  '0BSD',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'CC0-1.0',
  'Unlicense',
])

const raw = execFileSync('pnpm', ['licenses', 'list', '--prod', '--json'], {
  cwd: root,
  encoding: 'utf-8',
})
const byLicense = JSON.parse(raw)

const packages = []
const disallowed = []

for (const [license, entries] of Object.entries(byLicense)) {
  if (!ALLOWED_LICENSES.has(license)) {
    disallowed.push(...entries.map((e) => `${e.name}@${e.versions[0]} (${license})`))
    continue
  }
  for (const entry of entries) {
    packages.push({
      name: entry.name,
      version: entry.versions[0],
      license,
      author: entry.author ?? null,
      homepage: entry.homepage ?? null,
    })
  }
}

if (disallowed.length > 0) {
  console.error('License check failed. The following production dependencies use a license outside the allowlist:')
  for (const line of disallowed) console.error(`  - ${line}`)
  console.error(`Allowed licenses: ${[...ALLOWED_LICENSES].join(', ')}`)
  process.exit(1)
}

packages.sort((a, b) => a.name.localeCompare(b.name))

writeFileSync(
  outFile,
  JSON.stringify({ generatedAt: new Date().toISOString(), packages }, null, 2) + '\n',
)
console.log(`wrote ${packages.length} packages to src/data/licenses.generated.json`)
