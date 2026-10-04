import { screen, within } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { portfolio } from './data/portfolio.ts'
import { renderAt } from './test/renderAt.tsx'

beforeEach(() => {
  renderAt('/portfolio')
})

/** Each group's cards paired with the project data they should show. */
function cardsWithProjects() {
  return portfolio.flatMap(({ heading, projects }) => {
    const cards = [...screen.getByRole('list', { name: heading }).children] as HTMLElement[]

    expect(cards).toHaveLength(projects.length)
    return projects.map((project, index) => ({ card: cards[index], project }))
  })
}

test('headings appear in order: Portfolio, each group, then its projects', () => {
  const headings = within(screen.getByRole('main')).getAllByRole('heading')

  expect(headings.map((heading) => `${heading.tagName} ${heading.textContent}`)).toEqual([
    'H1 Portfolio',
    ...portfolio.flatMap(({ heading, projects }) => [
      `H2 ${heading}`,
      ...projects.map(({ title }) => `H3 ${title}`),
    ]),
  ])
})

test('cards render in order with context, description, and tags', () => {
  for (const { card, project } of cardsWithProjects()) {
    const { title, context, description, tags } = project
    const tagList = within(card).getByRole('list', { name: `${title} technologies` })

    expect(within(card).getByRole('heading')).toHaveTextContent(title)
    expect(within(card).getByText(context)).toBeInTheDocument()
    expect(within(card).getByText(description)).toBeInTheDocument()
    expect(within(tagList).getAllByRole('listitem').map((tag) => tag.textContent)).toEqual(tags)
  }
})

test('each card shows exactly its links, opening in the same tab', () => {
  for (const { card, project } of cardsWithProjects()) {
    const links = within(card).queryAllByRole('link')

    expect(links.map((link) => [link.textContent, link.getAttribute('href')])).toEqual(
      project.links.map(({ label, href }) => [label, href]),
    )
    links.forEach((link) => expect(link).not.toHaveAttribute('target'))
  }
})
