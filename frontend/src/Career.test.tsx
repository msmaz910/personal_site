import { screen, within } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { career } from './data/career.ts'
import { renderAt } from './test/renderAt.tsx'

beforeEach(() => {
  renderAt('/career')
})

/** The top-level entries of a named list, ignoring nested highlight items. */
function entriesOf(name: string) {
  return [...screen.getByRole('list', { name }).children] as HTMLElement[]
}

test('headings appear in order: Career, Experience, roles, Education, degrees', () => {
  const headings = within(screen.getByRole('main')).getAllByRole('heading')

  expect(headings.map((heading) => `${heading.tagName} ${heading.textContent}`)).toEqual([
    'H1 Career',
    'H2 Experience',
    ...career.roles.map(({ title }) => `H3 ${title}`),
    'H2 Education',
    ...career.education.map(({ degree }) => `H3 ${degree}`),
  ])
})

test('roles render in order with org, dates, and highlights', () => {
  const entries = entriesOf('Experience')

  expect(entries).toHaveLength(career.roles.length)
  entries.forEach((entry, index) => {
    const { title, org, dates, highlights } = career.roles[index]
    const items = within(entry).queryAllByRole('listitem')

    expect(within(entry).getByRole('heading')).toHaveTextContent(title)
    expect(entry).toHaveTextContent(`${org} · ${dates}`)
    expect(items.map((item) => item.textContent)).toEqual(highlights)
  })
})

test('education renders in order with school and dates', () => {
  const entries = entriesOf('Education')

  expect(entries).toHaveLength(career.education.length)
  entries.forEach((entry, index) => {
    const { degree, school, dates } = career.education[index]

    expect(within(entry).getByRole('heading')).toHaveTextContent(degree)
    expect(entry).toHaveTextContent(`${school} · ${dates}`)
  })
})
