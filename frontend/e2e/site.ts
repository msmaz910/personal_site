import { type Locator, type Page, expect } from '@playwright/test'

/** The five pages in nav order, with the h1 each one shows. Same list as src/pages.tsx. */
export const pages = [
  { path: '/', label: 'Home', heading: 'Michelle Lewis' },
  { path: '/about', label: 'About', heading: 'About' },
  { path: '/career', label: 'Career', heading: 'Career' },
  { path: '/portfolio', label: 'Portfolio', heading: 'Portfolio' },
  { path: '/contact', label: 'Contact', heading: 'Contact' },
]

export function h1(page: Page, name: string) {
  return page.getByRole('heading', { level: 1, name, exact: true })
}

/** Opens the phone menu, which hides the main nav links. */
export async function openMenu(page: Page) {
  await page.getByRole('button', { name: 'Menu' }).click()
}

/** Clicks a main nav link. On a phone the links sit behind the Menu button. */
export async function openPage(page: Page, label: string, isMobile: boolean) {
  if (isMobile) await openMenu(page)
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: label, exact: true }).click()
}

/** Returns the open chat panel: docked on a desktop, opened by AI Chat on a phone. */
export async function openChat(page: Page, isMobile: boolean) {
  if (isMobile) await page.getByRole('button', { name: 'AI Chat' }).click()
  const panel = page.locator('#chat-panel')
  await expect(panel).toBeVisible()
  return panel
}

/** Types a question, sends it, and returns the conversation log. */
export async function ask(panel: Locator, question: string) {
  await panel.getByLabel('Your question').fill(question)
  await panel.getByRole('button', { name: 'Send', exact: true }).click()
  return panel.getByRole('log', { name: 'Conversation' })
}
