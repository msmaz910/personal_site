/** Decorative sunset sky and mountain ridges under the header. Hidden from screen readers. */
function RidgeBand() {
  return (
    <svg className="ridge" viewBox="0 0 400 70" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="ridge-sky">
          <stop offset="0" stopColor="var(--color-sky-1)" />
          <stop offset="0.33" stopColor="var(--color-sky-2)" />
          <stop offset="0.67" stopColor="var(--color-sky-3)" />
          <stop offset="1" stopColor="var(--color-sky-4)" />
        </linearGradient>
      </defs>
      <rect width="400" height="70" fill="url(#ridge-sky)" />
      <path
        fill="var(--color-ridge-far)"
        d="M0 70 L0 46 L50 30 L95 44 L150 18 L205 40 L250 26 L300 42 L350 22 L400 38 L400 70 Z"
      />
      <path
        fill="var(--color-ridge-near)"
        d="M0 70 L0 58 L70 44 L120 56 L185 36 L240 54 L300 46 L360 58 L400 50 L400 70 Z"
      />
    </svg>
  )
}

export default RidgeBand
