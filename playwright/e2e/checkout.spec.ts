import { test } from '../support/fixtures'

test.describe('Checkout - Pagamento à Vista', () => {

  const customer = {
    name: 'Fernando',
    surname: 'Papito',
    email: 'papito.e2e@teste.com',
    phone: '(11) 99999-9999',
    cpf: '053.661.270-68',
    store: 'Velô Paulista - Av. Paulista, 1000',
  }

  test.beforeEach(async ({ app }) => {
    await app.database.deleteOrderByEmail(customer.email)
    await app.configurator.open()
  })

  test.afterEach(async ({ app }) => {
    await app.database.deleteOrderByEmail(customer.email)
  })

  test('deve criar um pedido com sucesso ao concluir a compra à vista', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')
    await app.configurator.proceedToCheckout()

    await app.orderCheckout.expectLoaded()
    await app.orderCheckout.expectSummaryTotalPrice('R$ 40.000,00')

    await app.orderCheckout.fillCustomerData(customer)
    await app.orderCheckout.selectStore(customer.store)
    await app.orderCheckout.selectPaymentMethodAvista()
    await app.orderCheckout.acceptTerms()
    await app.orderCheckout.submit()

    await app.orderCheckout.expectResult('Pedido Aprovado!')
  })
})
