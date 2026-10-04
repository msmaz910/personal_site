import { screen, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { contact } from './data/contact.ts'
import { renderAt } from './test/renderAt.tsx'

const links = [
  { name: 'Email me', href: 'mailto:me@example.test' },
  { name: 'LinkedIn', href: 'https://linkedin.example/test' },
  { name: 'GitHub', href: 'https://github.example/test' },
]

beforeEach(() => {
  vi.stubEnv('VITE_CONTACT_EMAIL', 'me@example.test')
  vi.stubEnv('VITE_LINKEDIN_URL', 'https://linkedin.example/test')
  vi.stubEnv('VITE_GITHUB_URL', 'https://github.example/test')
  renderAt('/contact')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

/** Queries scoped to the page body, since the footer repeats LinkedIn and GitHub. */
function main() {
  return within(screen.getByRole('main'))
}

test('shows the heading and intro', () => {
  expect(main().getByRole('heading', { level: 1 })).toHaveTextContent('Contact')
  expect(main().getByText(contact.intro)).toBeInTheDocument()
})

test('links appear in order: email first, then LinkedIn and GitHub', () => {
  expect(main().getAllByRole('link').map((link) => link.textContent)).toEqual(links.map(({ name }) => name))
})

test.each(links)('$name link points to $href in the same tab', ({ name, href }) => {
  const link = main().getByRole('link', { name })

  expect(link).toHaveAttribute('href', href)
  expect(link).not.toHaveAttribute('target')
})
