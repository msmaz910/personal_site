import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

function menuButton() {
  return screen.getByRole('button', { name: 'Menu' })
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

test('menu starts closed and controls the link list', () => {
  renderAt('/')

  expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  expect(nav().getByRole('list')).toHaveAttribute('id', menuButton().getAttribute('aria-controls'))
})

test('menu button opens and closes the menu', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(menuButton())
  expect(menuButton()).toHaveAttribute('aria-expanded', 'true')

  await user.click(menuButton())
  expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
})

test('menu opens from the keyboard', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.tab()
  await user.tab()
  expect(menuButton()).toHaveFocus()

  await user.keyboard('{Enter}')
  expect(menuButton()).toHaveAttribute('aria-expanded', 'true')
})

test('clicking a link closes the menu and navigates', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(menuButton())
  await user.click(nav().getByRole('link', { name: 'Career' }))

  expect(menuButton()).toHaveAttribute('aria-expanded', 'false')
  expect(nav().getByRole('link', { name: 'Career' })).toHaveAttribute('aria-current', 'page')
})
