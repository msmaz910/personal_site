import { expect, test } from 'vitest'
import { parseTokens, tokens } from './tokens.ts'

const AA_NORMAL_TEXT = 4.5
const TEXT_COLORS = ['text', 'text-muted', 'accent', 'error']
const BACKGROUNDS = ['bg', 'surface']

/** WCAG relative luminance of a #rrggbb color. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two #rrggbb colors. */
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

function color(name: string): string {
  return tokens.find((t) => t.name === `--color-${name}`)!.value
}

test('parseTokens reads names and values in order', () => {
  const css = ':root { --color-bg: #000;  --space-1: 0.25rem; }'

  expect(parseTokens(css)).toEqual([
    { name: '--color-bg', value: '#000' },
    { name: '--space-1', value: '0.25rem' },
  ])
})

test('contrast matches known WCAG values', () => {
  expect(contrast('#ffffff', '#000000')).toBeCloseTo(21)
  expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
})

test.each(TEXT_COLORS.flatMap((fg) => BACKGROUNDS.map((bg) => [fg, bg])))(
  '%s on %s meets WCAG AA',
  (fg, bg) => {
    expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
  },
)

test('button text (bg) on accent meets WCAG AA', () => {
  expect(contrast(color('bg'), color('accent'))).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
})
