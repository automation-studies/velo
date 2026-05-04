import { Page, expect } from '@playwright/test'

export function createConfiguratorActions(page: Page) {
  const totalPrice = page.getByTestId('total-price')
  const vehicleImage = page.locator('img[alt^="Velô Sprint"]')

  return {
    async open() {
      await page.goto('/configure')
    },

    async selectColor(name: string) {
      await page.getByRole('button', { name }).click()
    },

    async selectWheels(name: string | RegExp) {
      await page.getByRole('button', { name }).click()
    },

    async expectTotalPrice(text: string) {
      await expect(totalPrice).toBeVisible()
      await expect(totalPrice).toHaveText(text)
    },

    async expectVehicleImageSrc(expectedSrc: string) {
      await expect(vehicleImage).toHaveAttribute('src', expectedSrc)
    },
  }
}