import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { pages } from '../pages.tsx'
import { renderAt } from '../test/renderAt.tsx'

beforeEach(() => {
  vi.stubEnv('VITE_SITE_NAME', 'Test Site')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

function nav() {
  return within(screen.getByRole('navigation', { name: 'Main' }))
}

test('links to every page in order', () => {
  renderAt('/')

  const links = nav().getAllByRole('link')
  expect(links.map((a) => a.textContent)).toEqual(pages.map((p) => p.label))
  expect(links.map((a) => a.getAttribute('href'))).toEqual(pages.map((p) => p.path))
})

test('marks only the current page as active', () => {
  renderAt('/career')

  expect(nav().getByRole('link', { name: 'Career' })).toHaveAttribute('aria-current', 'page')
  const others = nav().getAllByRole('link').filter((a) => a.textContent !== 'Career')
  for (const link of others) {
    expect(link).not.toHaveAttribute('aria-current')
  }
})

test('site name links home', () => {
  renderAt('/about')

  expect(screen.getByRole('link', { name: 'Test Site' })).toHaveAttribute('href', '/')
})
