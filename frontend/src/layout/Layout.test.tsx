import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { renderAt } from '../test/renderAt.tsx'

const main = () => screen.getByRole('main')
const nav = () => within(screen.getByRole('navigation', { name: 'Main' }))

test('first load leaves focus alone', () => {
  renderAt('/')

  expect(document.body).toHaveFocus()
})

test('main can take focus but is not in the tab order', () => {
  renderAt('/')

  expect(main()).toHaveAttribute('tabindex', '-1')
})

test('a phone menu link moves focus to the new page content', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(screen.getByRole('button', { name: 'Menu' }))
  await user.click(nav().getByRole('link', { name: 'Career' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Career' })).toBeInTheDocument()
  expect(main()).toHaveFocus()
})

test('any link to another page moves focus to the page content', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(within(main()).getByRole('link', { name: 'Learn More' }))
  expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument()
  expect(main()).toHaveFocus()
})

test('a phone menu link to the current page also moves focus to the page content', async () => {
  const user = userEvent.setup()
  renderAt('/career')

  await user.click(screen.getByRole('button', { name: 'Menu' }))
  await user.click(nav().getByRole('link', { name: 'Career' }))
  expect(main()).toHaveFocus()
})
