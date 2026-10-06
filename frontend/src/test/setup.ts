/**
 * Vitest setup: adds jest-dom matchers, starts each test on a phone-width screen
 * (jsdom has no matchMedia) with empty session storage, makes window.scrollTo a no-op
 * (jsdom does not scroll; ScrollRestoration calls it on every navigation), and after each
 * test unmounts rendered components and removes stubbed globals such as fetch.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { setWide } from './viewport.ts'

window.scrollTo = () => {}

beforeEach(() => {
  setWide(false)
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
