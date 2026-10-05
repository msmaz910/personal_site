import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { starterQuestions } from '../data/chat.ts'
import { renderAt } from '../test/renderAt.tsx'
import { setWide } from '../test/viewport.ts'

const fetchMock = vi.fn()

const box = () => screen.getByRole('textbox', { name: 'Your question' })
const group = () => screen.queryByRole('group', { name: 'Suggested questions' })
const starter = (index: number) => screen.getByRole('button', { name: starterQuestions[index] })
const reply = (text: string) => Response.json({ reply: text, limit_reached: false })
const sentMessages = (call: number) => JSON.parse(fetchMock.mock.calls[call][1].body).messages

/** Saves a finished exchange, as if the visitor had chatted before a reload. */
function saveConversation(limitReached: boolean) {
  const messages = [
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: 'Hello!' },
  ]
  sessionStorage.setItem('chat-conversation', JSON.stringify({ messages, limitReached }))
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  setWide(true)
})

test('an empty chat offers the approved questions in order, between the conversation and the box', () => {
  renderAt('/')

  const buttons = Array.from(group()!.querySelectorAll('button'))
  expect(buttons.map((button) => button.textContent)).toEqual(starterQuestions)
  expect(buttons.every((button) => button.type === 'button')).toBe(true)
  expect(screen.getByRole('log').compareDocumentPosition(group()!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  expect(group()!.compareDocumentPosition(box())).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
})

test('clicking a question sends exactly that question and moves focus to the box', async () => {
  fetchMock.mockReturnValueOnce(new Promise(() => {}))
  renderAt('/')

  await userEvent.setup().click(starter(1))
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(sentMessages(0)).toEqual([{ role: 'user', content: starterQuestions[1] }])
  expect(box()).toHaveFocus()
})

test('the questions hide while the first one is pending and stay hidden after the reply', async () => {
  let respond!: (response: Response) => void
  fetchMock.mockReturnValueOnce(new Promise((resolve) => (respond = resolve)))
  renderAt('/')

  await userEvent.setup().click(starter(0))
  expect(group()).not.toBeInTheDocument()
  await act(async () => respond(reply('She leads enterprise analytics.')))
  expect(group()).not.toBeInTheDocument()
})

test('a typed first question also hides them', async () => {
  fetchMock.mockResolvedValueOnce(reply('Hello!'))
  renderAt('/')

  expect(group()).toBeInTheDocument()
  await userEvent.setup().type(box(), 'Hello there{Enter}')
  await screen.findByText('Hello!')
  expect(group()).not.toBeInTheDocument()
})

test.each([false, true])('they stay hidden after a reload with a saved conversation (limit reached: %s)', (limitReached) => {
  saveConversation(limitReached)
  renderAt('/')

  expect(group()).not.toBeInTheDocument()
})

test('a failed first question brings them back with the question in the box', async () => {
  const user = userEvent.setup()
  fetchMock
    .mockResolvedValueOnce(Response.json({ detail: 'The chat is unavailable right now.' }, { status: 502 }))
    .mockResolvedValueOnce(reply('She started in customer success.'))
  renderAt('/')

  await user.click(starter(2))
  expect(await screen.findByRole('alert')).toHaveTextContent('The chat is unavailable right now.')
  expect(group()).toBeInTheDocument()
  expect(box()).toHaveValue(starterQuestions[2])

  await user.click(starter(3))
  await screen.findByText('She started in customer success.')
  expect(sentMessages(1)).toEqual([{ role: 'user', content: starterQuestions[3] }])
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test.each(['{Enter}', ' '])('the keyboard key %j sends a question', async (key) => {
  fetchMock.mockReturnValueOnce(new Promise(() => {}))
  renderAt('/')

  starter(3).focus()
  await userEvent.setup().keyboard(key)
  expect(sentMessages(0)).toEqual([{ role: 'user', content: starterQuestions[3] }])
  expect(box()).toHaveFocus()
})

test('text the visitor typed stays in the box when they click a question', async () => {
  const user = userEvent.setup()
  fetchMock.mockResolvedValueOnce(reply('Analytics engineering.'))
  renderAt('/')

  await user.type(box(), 'abc')
  await user.click(starter(1))
  await screen.findByText('Analytics engineering.')
  expect(box()).toHaveValue('abc')
})

test('a failed click keeps text the visitor typed instead of replacing it', async () => {
  const user = userEvent.setup()
  fetchMock.mockResolvedValueOnce(Response.json({ detail: 'The chat is unavailable right now.' }, { status: 502 }))
  renderAt('/')

  await user.type(box(), 'abc')
  await user.click(starter(1))
  await screen.findByRole('alert')
  expect(box()).toHaveValue('abc')
})
