#!/usr/bin/env node
/**
 * Prints the QR link for every table in db.json (spec §20).
 *
 *   npm run tables -- https://username.github.io/coffee-menu/
 *
 * Feed the list to any QR generator to print the table stickers. The URLs are
 * the only thing that has to be right — the app reads `?table=` from them.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const writeFile = args.includes('--write')
const siteUrl = (args.find((arg) => !arg.startsWith('--')) ?? 'https://username.github.io/coffee-menu/')
  .replace(/\/+$/, '')

const db = JSON.parse(readFileSync(join(root, 'public/data/db.json'), 'utf8'))
const tables = db.tables.filter((table) => table.active !== false)

const lines = [
  `# Table QR links — ${db.settings.shop_name_en}`,
  '',
  `Site: ${siteUrl}/`,
  '',
  '| Table | Link |',
  '| --- | --- |',
  ...tables.map((table) => `| ${table.name} | ${siteUrl}/?table=${table.number} |`),
]

const output = lines.join('\n')
console.log(output)

if (writeFile) {
  const target = join(root, 'table-links.md')
  writeFileSync(target, `${output}\n`)
  console.log(`\nWritten to ${target}`)
}

const inactive = db.tables.length - tables.length
if (inactive > 0) console.log(`\n(${inactive} inactive table(s) skipped.)`)
