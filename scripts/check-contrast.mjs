#!/usr/bin/env node
/**
 * Checks the colour contrast of both themes (spec §47).
 *
 *   npm run contrast
 *
 * Two palettes mean every foreground/background pair has to work twice, and a
 * token that reads well on cream can vanish on espresso. This reads the real
 * values out of `src/styles/variables.css` and fails the build if a pair drops
 * below its WCAG target, so a palette tweak cannot quietly break legibility.
 *
 * Only pairs that actually appear in the UI are listed. Decorative icons are
 * deliberately absent: they are `aria-hidden` and always sit beside a text
 * label, so WCAG 1.4.11 exempts them — which is exactly why anything readable
 * uses `--accent-strong` rather than the brand caramel `--accent`.
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const css = readFileSync(join(root, 'src/styles/variables.css'), 'utf8')

function readBlock(pattern) {
  const match = css.match(pattern)
  if (!match) {
    console.error(`✖ Could not find the ${pattern} block in variables.css`)
    process.exit(1)
  }
  return Object.fromEntries(
    [...match[1].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map(([, key, value]) => [
      key,
      value.trim(),
    ]),
  )
}

const dark = readBlock(/:root\s*\{([\s\S]*?)\n\}/)
const light = { ...dark, ...readBlock(/:root\[data-theme='light'\]\s*\{([\s\S]*?)\n\}/) }

/** Follows `var(--x)` indirection back to a literal colour. */
function resolveToken(tokens, name, depth = 0) {
  const value = tokens[name]
  if (!value || depth > 8) return value
  const reference = value.match(/^var\(--([a-z0-9-]+)\)$/)
  return reference ? resolveToken(tokens, reference[1], depth + 1) : value
}

function relativeLuminance(hex) {
  const digits = hex.replace('#', '')
  const full = digits.length === 3 ? [...digits].map((c) => c + c).join('') : digits
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(foreground, background) {
  const [lighter, darker] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

/** [foreground token, background token, minimum ratio, what it is in the UI] */
const PAIRS = [
  ['text', 'bg', 4.5, 'body text on the page'],
  ['text', 'surface', 4.5, 'card text'],
  ['text', 'surface-2', 4.5, 'chip and option text'],
  ['muted', 'bg', 4.5, 'secondary text on the page'],
  ['muted', 'surface', 4.5, 'card descriptions'],
  ['muted', 'surface-2', 4.5, 'chip hint text'],
  ['accent-strong', 'surface', 4.5, 'accent links and focus ring on cards'],
  ['accent-strong', 'bg', 4.5, 'focus ring on the page'],
  ['accent-strong', 'surface-2', 4.5, 'focus ring on panels'],
  ['on-primary', 'primary', 4.5, 'primary button and active toggle'],
  ['on-accent', 'accent', 4.5, 'best-seller badge'],
  ['on-secondary', 'secondary', 4.5, 'featured badge'],
  ['success', 'success-soft', 4.5, 'available badge'],
  ['danger', 'danger-soft', 4.5, 'unavailable badge'],
  ['border-interactive', 'surface', 3, 'outline button and search field border'],
  ['border-interactive', 'bg', 3, 'control borders on the page'],
]

let failures = 0

for (const [themeName, tokens] of [
  ['dark (default)', dark],
  ['light', light],
]) {
  console.log(`\n${themeName}`)

  for (const [foreground, background, minimum, label] of PAIRS) {
    const fg = resolveToken(tokens, foreground)
    const bg = resolveToken(tokens, background)

    if (!fg || !bg) {
      failures++
      console.log(`  ✖ missing token: ${!fg ? foreground : background}`)
      continue
    }

    const ratio = contrast(fg, bg)
    const passed = ratio >= minimum
    if (!passed) failures++

    console.log(
      `  ${passed ? '✔' : '✖'} ${ratio.toFixed(2).padStart(5)}:1 (min ${minimum})  ${label}`,
    )
  }
}

if (failures > 0) {
  console.error(`\n✖ ${failures} pair(s) below target — adjust the tokens in variables.css`)
  process.exit(1)
}

console.log(`\n✔ All ${PAIRS.length * 2} contrast pairs pass in both themes.`)
