import { cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { renderAt } from '../test/renderAt.tsx'
import { setWide } from '../test/viewport.ts'

const toggle = () => screen.getByRole('button', { name: 'Ask me' })
const closeButton = () => screen.getByRole('button', { name: 'Close chat' })
const panel = () => screen.queryByRole('dialog', { name: 'Ask about Michelle' })

test.each(['/', '/about', '/career', '/portfolio', '/contact'])('chat button is on %s', (path) => {
  renderAt(path)

  expect(toggle()).toBeInTheDocument()
})

test('starts closed on a phone and controls the panel', () => {
  renderAt('/')

  expect(panel()).not.toBeInTheDocument()
  expect(toggle()).toHaveAttribute('aria-expanded', 'false')
  expect(toggle()).toHaveAttribute('aria-controls', 'chat-panel')
})

test('mouse opens the panel with focus inside, and close returns focus', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(toggle())
  expect(panel()).toBeInTheDocument()
  expect(toggle()).toHaveAttribute('aria-expanded', 'true')
  expect(closeButton()).toHaveFocus()
  expect(screen.getByText(/ask me anything about michelle/i)).toBeInTheDocument()

  await user.click(closeButton())
  expect(panel()).not.toBeInTheDocument()
  expect(toggle()).toHaveFocus()
})

test('keyboard opens with Enter and closes with Escape', async () => {
  const user = userEvent.setup()
  renderAt('/')

  toggle().focus()
  await user.keyboard('{Enter}')
  expect(panel()).toBeInTheDocument()
  expect(closeButton()).toHaveFocus()

  await user.keyboard('{Escape}')
  expect(panel()).not.toBeInTheDocument()
  expect(toggle()).toHaveFocus()
})

test('opens on its own on a wide screen without moving focus', () => {
  setWide(true)
  renderAt('/')

  expect(panel()).toBeInTheDocument()
  expect(toggle()).toHaveAttribute('aria-expanded', 'true')
  expect(document.body).toHaveFocus()
})

test('once closed, stays closed across pages and a reload', async () => {
  const user = userEvent.setup()
  setWide(true)
  renderAt('/')

  await user.click(closeButton())
  await user.click(screen.getByRole('link', { name: 'Career' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Career' })).toBeInTheDocument()
  expect(panel()).not.toBeInTheDocument()

  cleanup()
  renderAt('/')
  expect(panel()).not.toBeInTheDocument()
})
