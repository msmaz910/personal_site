import { useSyncExternalStore } from 'react'

/** Same breakpoint as the two-column layout in index.css. Keep the two 64rem values in step. */
const WIDE = '(width >= 64rem)'

function subscribe(onChange: () => void) {
  const query = window.matchMedia(WIDE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** True when the screen is 64rem or wider. Updates when the window is resized. */
export function useWideScreen() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches)
}
