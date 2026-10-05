/** Makes every matchMedia query report the given result: true for a wide screen, false for a phone. */
export function setWide(wide: boolean) {
  window.matchMedia = (() => ({ matches: wide })) as unknown as typeof window.matchMedia
}
