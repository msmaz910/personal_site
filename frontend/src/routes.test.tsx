import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { pages } from './pages.tsx'
import { renderAt } from './test/renderAt.tsx'

function expectLayout() {
  expect(screen.getByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
}

test.each(pages)('$path renders $label inside the layout', ({ path, label }) => {
  renderAt(path)

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(label)
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
