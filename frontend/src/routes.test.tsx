import { screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { pages } from './pages.tsx'
import Placeholder from './Placeholder.tsx'
import { renderAt } from './test/renderAt.tsx'

const placeholderPages = pages.filter(({ element }) => element.type === Placeholder)

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

test.each(placeholderPages)('$path renders $label inside the layout', ({ path, label }) => {
  renderAt(path)

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(label)
  expectLayout()
})

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