import { tokens, type Token } from './styles/tokens.ts'

/** Shows a preview for one token, chosen by its name prefix. */
function Preview({ name }: Token) {
  const ref = `var(${name})`
  if (name.startsWith('--color-')) {
    return <span className="swatch" style={{ background: ref }} />
  }
  if (name.startsWith('--font-')) {
    return <span style={{ fontFamily: ref }}>Trail notes, 2026</span>
  }
  return <span className="space-bar" style={{ width: ref }} />
}

/** Test page listing every design token with a live preview. Temporary until E3-2. */
function StyleGuide() {
  return (
    <section className="style-guide" aria-labelledby="style-guide-title">
      <h1 id="style-guide-title">Design tokens</h1>
      <ul>
        {tokens.map((token) => (
          <li key={token.name}>
            <Preview {...token} />
            <code>{token.name}</code>
            <span className="token-value">{token.value}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default StyleGuide
