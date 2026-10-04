import { screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { renderAt } from './test/renderAt.tsx'

beforeEach(() => {
  vi.stubEnv('VITE_SITE_NAME', 'Test Site')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

function expectLayout() {
  expect(screen.getByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
}

test('/ renders the home page inside the layout', () => {
  renderAt('/')

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test Site')
  expectLayout()
})

test('unknown path shows not found with a link home', () => {
  renderAt('/nope')

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found')
  expect(screen.getByRole('link', { name: 'Head back home' })).toHaveAttribute('href', '/')
  expectLayout()
})

test('style guide is reachable but not in the nav', () => {
  renderAt('/style-guide')

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Design tokens')
  expect(screen.queryByRole('link', { name: /style guide|design tokens/i })).toBeNull()
  expectLayout()
})