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

    async expectVehicleImageSrc(expectedFileName: string) {
      await expect(vehicleImage).toHaveAttribute('src', new RegExp(`${expectedFileName}(-[\\w-]+)?\\.png$`))
    },

    async setOptional(checked: boolean, name: string | RegExp) {
      await page.getByRole('checkbox', { name }).setChecked(checked)
    },

    async proceedToCheckout() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
      await expect(page).toHaveURL(/\/order/)
    },
  }
}