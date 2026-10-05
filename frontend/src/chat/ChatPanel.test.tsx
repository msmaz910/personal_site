import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { renderAt } from '../test/renderAt.tsx'
import { setWide } from '../test/viewport.ts'

const TITLE = 'Chat with my Digital Twin'

const askButton = () => screen.getByRole('button', { name: 'AI Chat' })
const closeButton = () => screen.queryByRole('button', { name: 'Close chat' })
const heading = () => screen.queryByRole('heading', { name: TITLE })
const dialog = () => screen.queryByRole('dialog', { name: TITLE })
const page = () => screen.getByRole('main', { hidden: true })

test.each(['/', '/about', '/career', '/portfolio', '/contact'])('phone: %s has the button and a hidden chat', (path) => {
  renderAt(path)

  expect(askButton()).toHaveAttribute('aria-controls', 'chat-panel')
  expect(heading()).not.toBeInTheDocument()
  expect(page().closest('[inert]')).toBeNull()
})

test('phone: clicking the button opens the chat full screen and locks the page', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(askButton())
  expect(dialog()).toBeInTheDocument()
  expect(closeButton()).toHaveFocus()
  expect(screen.getByText(/ask me anything about michelle/i)).toBeInTheDocument()
  expect(page().closest('[inert]')).not.toBeNull()
  expect(dialog()!.closest('[inert]')).toBeNull()
})

test('phone: closing returns focus and keeps the same chat element', async () => {
  const user = userEvent.setup()
  renderAt('/')
  const panel = document.getElementById('chat-panel')

  await user.click(askButton())
  await user.click(closeButton()!)
  expect(dialog()).not.toBeInTheDocument()
  expect(askButton()).toHaveFocus()
  expect(page().closest('[inert]')).toBeNull()
  expect(document.getElementById('chat-panel')).toBe(panel)
})

test('phone: Enter opens and Escape closes', async () => {
  const user = userEvent.setup()
  renderAt('/')

  askButton().focus()
  await user.keyboard('{Enter}')
  expect(closeButton()).toHaveFocus()

  await user.keyboard('{Escape}')
  expect(dialog()).not.toBeInTheDocument()
  expect(askButton()).toHaveFocus()
})

test.each(['/', '/career'])('desktop: %s shows the chat column, not a dialog', async (path) => {
  const user = userEvent.setup()
  setWide(true)
  renderAt(path)

  expect(heading()).toBeInTheDocument()
  expect(dialog()).not.toBeInTheDocument()
  expect(closeButton()).not.toBeInTheDocument()
  expect(page().closest('[inert]')).toBeNull()

  await user.keyboard('{Escape}')
  expect(heading()).toBeInTheDocument()
})

test('desktop: the chat column stays the same element across pages', async () => {
  const user = userEvent.setup()
  setWide(true)
  renderAt('/')
  expect(heading()).toBeInTheDocument()
  const panel = document.getElementById('chat-panel')

  await user.click(screen.getByRole('link', { name: 'Career' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Career' })).toBeInTheDocument()
  expect(document.getElementById('chat-panel')).toBe(panel)
})

test('chat shows a message box and Send button, disabled until E6-2', () => {
  setWide(true)
  renderAt('/')

  expect(screen.getByRole('textbox', { name: 'Your question' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
})

test('resizing: an open phone chat docks on desktop and unlocks the page', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(askButton())
  act(() => setWide(true))
  expect(heading()).toBeInTheDocument()
  expect(dialog()).not.toBeInTheDocument()
  expect(page().closest('[inert]')).toBeNull()
})

test('resizing: going from desktop to phone hides the chat', () => {
  setWide(true)
  renderAt('/')
  expect(heading()).toBeInTheDocument()

  act(() => setWide(false))
  expect(heading()).not.toBeInTheDocument()
})

test('resizing: a chat closed by going wide does not pop open again on a phone', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(askButton())
  act(() => setWide(true))
  act(() => setWide(false))
  expect(dialog()).not.toBeInTheDocument()
  expect(page().closest('[inert]')).toBeNull()
})

test('phone: Escape still closes after clicking text inside the chat', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(askButton())
  await user.click(screen.getByText(/ask me anything about michelle/i))
  await user.keyboard('{Escape}')
  expect(dialog()).not.toBeInTheDocument()
})
