import { Page, expect } from '@playwright/test'

export type Customer = {
  name: string
  surname: string
  email: string
  phone: string
  cpf: string
  store: string
}

export type OrderStatus = 'Pedido Aprovado!' | 'Pedido em Análise!' | 'Pedido Reprovado!'

export function createOrderCheckoutActions(page: Page) {

  const summaryTotalPrice = page.getByTestId('summary-total-price')
  const terms = page.getByTestId('checkout-terms')
  const submitButton = page.getByTestId('checkout-submit')

  const alerts = {
    name: page.getByTestId('error-name'),
    surname: page.getByTestId('error-surname'),
    email: page.getByTestId('error-email'),
    phone: page.getByTestId('error-phone'),
    cpf: page.getByTestId('error-cpf'),
    store: page.getByTestId('error-store'),
    terms: page.getByTestId('error-terms'),
  }

  return {

    elements: {
      terms,
      alerts,
    },

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

    async selectPaymentMethod(method: string) {
      await page.getByRole('button', { name: new RegExp(method, 'i') }).click()
    },

    async fillDownPayment(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async acceptTerms() {
      await terms.check()
    },

    async submit() {
      await submitButton.click()
    },

    async expectResult(status: OrderStatus) {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByTestId('success-status')).toHaveText(status)
    },
  }
}
