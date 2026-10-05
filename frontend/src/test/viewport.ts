let wide = false
const listeners = new Set<() => void>()

/** Stand-in for window.matchMedia (jsdom has none): every query reports the current fake width. */
function fakeMatchMedia() {
  return {
    get matches() {
      return wide
    },
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }
}

/** Sets the fake screen to wide (desktop) or narrow (phone) and notifies listening components. */
export function setWide(value: boolean) {
  wide = value
  window.matchMedia = fakeMatchMedia as unknown as typeof window.matchMedia
  listeners.forEach((listener) => listener())
}
