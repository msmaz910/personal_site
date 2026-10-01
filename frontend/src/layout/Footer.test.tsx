import { screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { renderAt } from '../test/renderAt.tsx'

beforeEach(() => {
  vi.stubEnv('VITE_SITE_NAME', 'Test Site')
  vi.stubEnv('VITE_LINKEDIN_URL', 'https://linkedin.example/test')
  vi.stubEnv('VITE_GITHUB_URL', 'https://github.example/test')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

test('shows the copyright with the current year', () => {
  renderAt('/')

  const year = new Date().getFullYear()
  expect(screen.getByRole('contentinfo')).toHaveTextContent(`© ${year} Test Site`)
})

test('links to LinkedIn and GitHub', () => {
  renderAt('/')

  expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://linkedin.example/test',
  )
  expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
    'href',
    'https://github.example/test',
  )
})
