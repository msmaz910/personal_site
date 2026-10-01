import tokensCss from './tokens.css?raw'

export type Token = { name: string; value: string }

/** Returns every CSS custom property declared in the given CSS, in source order. */
export function parseTokens(css: string): Token[] {
  return [...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => ({
    name,
    value: value.trim(),
  }))
}

/** All design tokens from tokens.css. */
export const tokens = parseTokens(tokensCss)
