import { expect, test } from '@playwright/test'
import { ANSWER, FAKE_MODEL, FAKE_URL, REASONING } from './constants.ts'
import { ask, openChat } from './site.ts'

const QUESTION = 'What does Michelle do?'

type Sent = { model: string; messages: { role: string; content: string }[] }

test('a visitor sends a message and sees a cleaned reply', async ({ page, isMobile }) => {
  await page.goto('/')
  const log = await ask(await openChat(page, isMobile), QUESTION)

  await expect(log).toContainText(QUESTION)
  await expect(log).toContainText(ANSWER)
  await expect(log).not.toContainText(REASONING)
})

test('the container sends the system prompt, model and question to the model', async ({
  page,
  isMobile,
  request,
}, testInfo) => {
  const question = `${QUESTION} (${testInfo.project.name})`
  await page.goto('/')
  const log = await ask(await openChat(page, isMobile), question)
  await expect(log).toContainText(ANSWER)

  const received: Sent[] = await (await request.get(`${FAKE_URL}/requests`)).json()
  const body = received.find((sent) => sent.messages.at(-1)?.content === question)
  expect(body?.model).toBe(FAKE_MODEL)
  expect(body?.messages[0].role).toBe('system')
})

test('the input placeholder uses the muted text colour', async ({ page, isMobile }) => {
  await page.goto('/')
  const input = (await openChat(page, isMobile)).getByLabel('Your question')

  const { text, placeholder } = await input.evaluate((el) => ({
    text: getComputedStyle(el).color,
    placeholder: getComputedStyle(el, '::placeholder').color,
  }))

  expect(placeholder).toBe(text)
})
