import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { home } from './data/home.ts'
import { renderAt } from './test/renderAt.tsx'

beforeEach(() => {
  vi.stubEnv('VITE_SITE_NAME', 'Test Site')
  renderAt('/')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

test('name is the only heading, followed by title and mission', () => {
  const headings = within(screen.getByRole('main')).getAllByRole('heading')

  expect(headings).toHaveLength(1)
  expect(headings[0]).toHaveTextContent('Test Site')
  expect(headings[0].tagName).toBe('H1')
  expect(screen.getByText(home.title)).toBeInTheDocument()
  expect(screen.getByText(home.mission)).toBeInTheDocument()
})

test('lists the tags and the intro from the data file', () => {
  const tags = within(screen.getByRole('list', { name: 'Focus areas' })).getAllByRole('listitem')

  expect(tags.map((tag) => tag.textContent)).toEqual(home.tags)
  expect(screen.getByText(home.intro)).toBeInTheDocument()
})

test('links to the About page', () => {
  const link = within(screen.getByRole('main')).getByRole('link', { name: 'Learn More' })

  expect(link).toHaveAttribute('href', '/about')
})
