import { Page, expect } from '@playwright/test'

export type Customer = {
  name: string
  surname: string
  email: string
  phone: string
  cpf: string
  store: string
}

export function createOrderCheckoutActions(page: Page) {

  const summaryTotalPrice = page.getByTestId('summary-total-price')
  const terms = page.getByTestId('checkout-terms')
  const submitButton = page.getByTestId('checkout-submit')

  return {

    async expectLoaded() {
      await expect(page.getByRole('heading', { name: 'Finalizar Pedido' })).toBeVisible()
    },

    async expectSummaryTotalPrice(price: string) {
      await expect(summaryTotalPrice).toHaveText(price)
    },

    async fillCustomerData(customer: Customer) {
      await page.getByTestId('checkout-name').fill(customer.name)
      await page.getByTestId('checkout-surname').fill(customer.surname)
      await page.getByTestId('checkout-email').fill(customer.email)
      await page.getByTestId('checkout-phone').fill(customer.phone)
      await page.getByTestId('checkout-cpf').fill(customer.cpf)
    },

    async selectStore(storeName: string) {
      await page.getByTestId('checkout-store').click()
      await page.getByRole('option', { name: storeName }).click()
    },

    async selectPaymentMethodAvista() {
      await page.getByTestId('payment-avista').click()
    },

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await submitButton.click()
    },

    async expectResult(status: 'Pedido Aprovado!' | 'Crédito Reprovado') {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByTestId('success-status')).toHaveText(status)
    },
  }
}
