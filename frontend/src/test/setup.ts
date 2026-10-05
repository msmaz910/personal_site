/**
 * Vitest setup: adds jest-dom matchers, starts each test on a phone-width screen
 * (jsdom has no matchMedia), and unmounts rendered components after each test.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { setWide } from './viewport.ts'

beforeEach(() => {
  setWide(false)
})

afterEach(() => {
  cleanup()
})
