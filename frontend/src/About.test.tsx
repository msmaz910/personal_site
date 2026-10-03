import { screen, within } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { about } from './data/about.ts'
import { renderAt } from './test/renderAt.tsx'

beforeEach(() => {
  renderAt('/about')
})

test('headings appear in order: About, Core Skills, then each section', () => {
  const headings = within(screen.getByRole('main')).getAllByRole('heading')

  expect(headings.map((heading) => heading.tagName)).toEqual(['H1', 'H2', 'H2', 'H2'])
  expect(headings.map((heading) => heading.textContent)).toEqual([
    'About',
    'Core Skills',
    ...about.sections.map(({ heading }) => heading),
  ])
})

test('every paragraph from the data file renders in order', () => {
  const paragraphs = within(screen.getByRole('main')).getAllByText((_, element) => element?.tagName === 'P')
  const expected = [...about.story, ...about.sections.flatMap(({ paragraphs }) => paragraphs)]

  expect(paragraphs.map((paragraph) => paragraph.textContent)).toEqual(expected)
})

test('lists every core skill in order', () => {
  const skills = within(screen.getByRole('list', { name: 'Core skills' })).getAllByRole('listitem')

  expect(skills.map((skill) => skill.textContent)).toEqual(about.skills)
})
