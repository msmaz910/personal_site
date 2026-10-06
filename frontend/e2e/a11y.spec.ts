import { expect, test } from '@playwright/test'
import { scan } from './axe.ts'
import { ANSWER } from './constants.ts'
import { ask, h1, openChat, openMenu, pages } from './site.ts'

for (const { path, label, heading } of pages) {
  test(`${label} page has no accessibility violations`, async ({ page }, testInfo) => {
    await page.goto(path)
    await expect(h1(page, heading)).toBeVisible()
    expect(await scan(page, testInfo)).toEqual([])
  })
}

test('the not-found page has no accessibility violations', async ({ page }, testInfo) => {
  await page.goto('/no-such-page')
  await expect(h1(page, 'Page not found')).toBeVisible()
  expect(await scan(page, testInfo)).toEqual([])
})

test('the open chat panel has no accessibility violations', async ({ page, isMobile }, testInfo) => {
  await page.goto('/')
  await openChat(page, isMobile)
  expect(await scan(page, testInfo)).toEqual([])
})

test('the chat after a reply has no accessibility violations', async ({ page, isMobile }, testInfo) => {
  await page.goto('/')
  const log = await ask(await openChat(page, isMobile), 'What does Michelle do?')
  await expect(log).toContainText(ANSWER)
  expect(await scan(page, testInfo)).toEqual([])
})

test('the open phone menu has no accessibility violations', async ({ page, isMobile }, testInfo) => {
  test.skip(!isMobile, 'The menu button only shows on phones')
  await page.goto('/')
  await openMenu(page)
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  expect(await scan(page, testInfo)).toEqual([])
})
