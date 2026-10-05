/**
 * Vitest setup: adds jest-dom matchers, starts each test on a phone-width screen
 * (jsdom has no matchMedia) with empty session storage, and after each test unmounts
 * rendered components and removes stubbed globals such as fetch.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { setWide } from './viewport.ts'

beforeEach(() => {
  setWide(false)
  sessionStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})
