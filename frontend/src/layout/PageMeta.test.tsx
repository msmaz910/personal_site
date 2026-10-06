import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { pages } from '../pages.tsx'
import { renderAt } from '../test/renderAt.tsx'

const meta = (name: string) => document.head.querySelector(`meta[name="${name}"]`)

const approved = [
  [
    '/',
    'Michelle Lewis | Analytics Engineering Leader',
    'Michelle Lewis leads Data Science & Enterprise Analytics at Insperity, building dashboards, models, and pipelines that drive corporate strategy.',
  ],
  [
    '/about',
    'About | Michelle Lewis',
    'From art history and Wall Street data desks to analytics engineering leadership. Skills in SQL, Python, dbt, Snowflake, and AI.',
  ],
  [
    '/career',
    'Career | Michelle Lewis',
    'From Lehman Brothers and Barclays to Director of Data Science & Enterprise Analytics at Insperity, plus an MBA from Baruch College.',
  ],
  [
    '/portfolio',
    'Portfolio | Michelle Lewis',
    'Case studies in customer health scoring, executive dashboards, machine learning, and expense audits, plus this AI-chat website.',
  ],
  [
    '/contact',
    'Contact | Michelle Lewis',
    'Get in touch to talk analytics engineering, data leadership, or AI. Email is the fastest way to reach me.',
  ],
]

test.each(approved)('%s has its own title and description, once each', (path, title, description) => {
  renderAt(path)

  expect(document.title).toBe(title)
  expect(meta('description')).toHaveAttribute('content', description)
  expect(meta('robots')).toBeNull()
  expect(document.head.querySelectorAll('title')).toHaveLength(1)
  expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
})

test('every page has a title and description no other page uses', () => {
  expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length)
  expect(new Set(pages.map((page) => page.description)).size).toBe(pages.length)
})

test.each([
  ['/nope', 'Page not found | Michelle Lewis'],
  ['/style-guide', 'Design tokens | Michelle Lewis'],
])('%s is kept out of search results', (path, title) => {
  renderAt(path)

  expect(document.title).toBe(title)
  expect(meta('robots')).toHaveAttribute('content', 'noindex')
})

test('navigating swaps the title and description', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'About' }))
  expect(document.title).toBe('About | Michelle Lewis')
  expect(document.head.querySelectorAll('title')).toHaveLength(1)
  expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
})
