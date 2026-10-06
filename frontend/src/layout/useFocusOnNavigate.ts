import { type RefObject, useEffect, useRef } from 'react'
import { useLocation } from 'react-router'

/**
 * Moves focus to the element after every navigation, including a link to the current
 * page, but never on first load. Compares location keys rather than skipping the first
 * run, so StrictMode's double effect is safe. Focus does not scroll: ScrollRestoration
 * already puts a new page at the top.
 */
export function useFocusOnNavigate(ref: RefObject<HTMLElement | null>) {
  const { key } = useLocation()
  const shown = useRef(key)

  useEffect(() => {
    if (shown.current === key) return
    shown.current = key
    ref.current!.focus({ preventScroll: true })
  }, [key, ref])
}
