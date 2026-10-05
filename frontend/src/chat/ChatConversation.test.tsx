import { act, cleanup, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test, vi } from 'vitest'
import { renderAt } from '../test/renderAt.tsx'
import { setWide } from '../test/viewport.ts'

const fetchMock = vi.fn()

const box = () => screen.getByRole('textbox', { name: 'Your question' })
const sendButton = () => screen.getByRole('button', { name: 'Send' })
const log = () => screen.getByRole('log')
const reply = (text: string, limitReached = false) => Response.json({ reply: text, limit_reached: limitReached })
const sentMessages = (call: number) => JSON.parse(fetchMock.mock.calls[call][1].body).messages

/** Types a question into the chat and submits it with Enter. */
async function ask(question: string) {
  const user = userEvent.setup()
  await user.type(box(), `${question}{Enter}`)
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  setWide(true)
})

test('sends the whole conversation to the API, never the welcome line', async () => {
  fetchMock.mockResolvedValueOnce(reply('Hello!')).mockResolvedValueOnce(reply('SQL and dbt.'))
  renderAt('/')

  await ask('Hi')
  await screen.findByText('Hello!')
  await ask('Skills?')
  await screen.findByText('SQL and dbt.')

  expect(fetchMock).toHaveBeenCalledWith('/api/chat', expect.objectContaining({ method: 'POST' }))
  expect(sentMessages(0)).toEqual([{ role: 'user', content: 'Hi' }])
  expect(sentMessages(1)).toEqual([
    { role: 'user', content: 'Hi' },
    { role: 'assistant', content: 'Hello!' },
    { role: 'user', content: 'Skills?' },
  ])
})

test('shows the question and a thinking bubble until the reply arrives', async () => {
  let respond!: (response: Response) => void
  fetchMock.mockReturnValueOnce(new Promise((resolve) => (respond = resolve)))
  renderAt('/')

  await ask('Hi')
  expect(screen.getByText('Hi')).toBeInTheDocument()
  expect(screen.getByText('Thinking…')).toBeInTheDocument()
  expect(log()).toHaveAttribute('aria-busy', 'true')
  expect(sendButton()).toBeDisabled()

  await act(async () => respond(reply('Hello!')))
  expect(screen.getByText('Hello!')).toBeInTheDocument()
  expect(screen.queryByText('Thinking…')).not.toBeInTheDocument()
  expect(log()).toHaveAttribute('aria-busy', 'false')
})

test('Send needs text, and the box clears and keeps focus after sending', async () => {
  const user = userEvent.setup()
  fetchMock.mockResolvedValueOnce(reply('Hello!'))
  renderAt('/')

  expect(sendButton()).toBeDisabled()
  await user.type(box(), '   ')
  expect(sendButton()).toBeDisabled()
  await user.clear(box())
  await user.type(box(), 'Hi')
  await user.click(sendButton())
  await screen.findByText('Hello!')
  expect(box()).toHaveValue('')

  await ask('Again')
  expect(box()).toHaveFocus()
})

test('replies are shown as plain text, never as HTML', async () => {
  fetchMock.mockResolvedValueOnce(reply('<b>bold</b>'))
  renderAt('/')

  await ask('Hi')
  expect(await screen.findByText('<b>bold</b>')).toBeInTheDocument()
  expect(log().querySelector('b')).toBeNull()
})

test('a failed request shows the friendly error and puts the question back', async () => {
  fetchMock
    .mockResolvedValueOnce(Response.json({ detail: 'The chat is unavailable right now.' }, { status: 502 }))
    .mockResolvedValueOnce(reply('Hello!'))
  renderAt('/')

  await ask('Hi')
  expect(await screen.findByRole('alert')).toHaveTextContent('The chat is unavailable right now.')
  expect(screen.queryByText('Hi')).not.toBeInTheDocument()
  expect(box()).toHaveValue('Hi')

  await ask('')
  await screen.findByText('Hello!')
  expect(sentMessages(1)).toEqual([{ role: 'user', content: 'Hi' }])
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test.each([
  ['a validation error', () => Response.json({ detail: [{ msg: 'bad' }] }, { status: 422 })],
  ['a non-JSON error page', () => new Response('<html>Bad gateway</html>', { status: 502 })],
  ['a network failure', () => Promise.reject(new TypeError('Failed to fetch'))],
])('%s shows a generic error', async (_name, response) => {
  fetchMock.mockImplementationOnce(response)
  renderAt('/')

  await ask('Hi')
  expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Please try again.')
})

test('the closing message locks the box and Send', async () => {
  fetchMock.mockResolvedValueOnce(reply('Thank you for the great conversation!', true))
  renderAt('/')

  await ask('One more')
  expect(await screen.findByText('Thank you for the great conversation!')).toBeInTheDocument()
  expect(box()).toBeDisabled()
  expect(sendButton()).toBeDisabled()
  expect(log()).toHaveFocus()
})

test('the conversation and the limit survive a reload', async () => {
  fetchMock.mockResolvedValueOnce(reply('Goodbye!', true))
  renderAt('/')
  await ask('Hi')
  await screen.findByText('Goodbye!')

  cleanup()
  renderAt('/')
  expect(screen.getByText('Hi')).toBeInTheDocument()
  expect(screen.getByText('Goodbye!')).toBeInTheDocument()
  expect(box()).toBeDisabled()
  expect(document.body).toHaveFocus()
})

test('the conversation can be reached by keyboard so it can be scrolled', () => {
  renderAt('/')

  expect(screen.getByRole('log', { name: 'Conversation' })).toHaveAttribute('tabindex', '0')
})

test('scrolls to the thinking bubble, then to the top of the question and its reply, also when the phone chat opens', async () => {
  const visible = (element: HTMLElement) => !element.closest('[hidden]')
  const spies = [
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return visible(this) ? 500 : 0
    }),
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
      return visible(this) && this.textContent === 'Hi' ? 120 : 0
    }),
  ]
  let respond!: (response: Response) => void
  fetchMock.mockReturnValueOnce(new Promise((resolve) => (respond = resolve)))
  renderAt('/')

  await ask('Hi')
  expect(log().scrollTop).toBe(500)
  await act(async () => respond(reply('Hello!')))
  expect(log().scrollTop).toBe(120)

  cleanup()
  act(() => setWide(false))
  renderAt('/')
  await userEvent.setup().click(screen.getByRole('button', { name: 'AI Chat' }))
  expect(log().scrollTop).toBe(120)
  spies.forEach((spy) => spy.mockRestore())
})
