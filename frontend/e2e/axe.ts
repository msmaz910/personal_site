import { AxeBuilder } from '@axe-core/playwright'
import type { Page, TestInfo } from '@playwright/test'

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/**
 * Runs axe with every WCAG A/AA rule, attaches the full results to the report, and
 * returns one readable line per violation. An empty list means the page is clean.
 */
export async function scan(page: Page, testInfo: TestInfo) {
  await page.evaluate(() => document.fonts.ready)
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  await testInfo.attach('axe-violations', {
    body: JSON.stringify(violations, null, 2),
    contentType: 'application/json',
  })
  return violations.map(
    ({ id, impact, nodes }) => `${id} (${impact}): ${nodes.map((node) => node.target.join(' ')).join(', ')}`,
  )
}
