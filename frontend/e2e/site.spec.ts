import { expect, test } from '@playwright/test'
import { h1, openPage, pages } from './site.ts'

for (const { path, label, heading } of pages) {
  test(`${label} page loads`, async ({ page }) => {
    await page.goto(path)
    await expect(h1(page, heading)).toBeVisible()
  })
}

test('nav links reach every page', async ({ page, isMobile }) => {
  await page.goto('/')
  for (const { path, label, heading } of pages.slice(1)) {
    await openPage(page, label, isMobile)
    await expect(h1(page, heading)).toBeVisible()
    await expect(page).toHaveURL(path)
  }
})

test('a deep link survives a reload', async ({ page }) => {
  await page.goto('/career')
  await page.reload()
  await expect(h1(page, 'Career')).toBeVisible()
})
