import { test, expect } from '../support/fixtures'

test.describe('Checkout', () => {

  test.describe('Validações de campos obrigatórios', () => {

    test.beforeEach(async ({ app }) => {
      await app.configurator.open()
      await app.configurator.proceedToCheckout()
      await app.orderCheckout.expectLoaded()
    })

    test('deve validar obrigatoriedade de todos os campos em branco', async ({ app }) => {
      const { alerts } = app.orderCheckout.elements

      // Act
      await app.orderCheckout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.surname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
      await expect(alerts.email).toHaveText('Email inválido')
      await expect(alerts.phone).toHaveText('Telefone inválido')
      await expect(alerts.cpf).toHaveText('CPF inválido')
      await expect(alerts.store).toHaveText('Selecione uma loja')
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })

    test('deve validar limite mínimo de caracteres para Nome e Sobrenome', async ({ app }) => {
      const { alerts } = app.orderCheckout.elements

      const customer = {
        name: 'A',
        surname: 'B',
        email: 'papito@teste.com',
        phone: '(11) 99999-9999',
        cpf: '053.661.270-68',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      // Arrange
      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)
      await app.orderCheckout.acceptTerms()

      // Act
      await app.orderCheckout.submit()

      // Assert
      await expect(alerts.name).toHaveText('Nome deve ter pelo menos 2 caracteres')
      await expect(alerts.surname).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    })

    test('deve exibir erro para e-mail com formato inválido', async ({ app }) => {
      const { alerts } = app.orderCheckout.elements

      const customer = {
        name: 'Fernando',
        surname: 'Papito',
        email: 'papito@.com',
        phone: '(11) 99999-9999',
        cpf: '053.661.270-68',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      // Arrange
      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)
      await app.orderCheckout.acceptTerms()

      // Act
      await app.orderCheckout.submit()

      // Assert
      await expect(alerts.email).toHaveText('Email inválido')
    })

    test('deve exibir erro para CPF inválido', async ({ app }) => {
      const { alerts } = app.orderCheckout.elements

      const customer = {
        name: 'Fernando',
        surname: 'Papito',
        email: 'papito@teste.com',
        phone: '(11) 99999-9999',
        cpf: '123.456.789',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      // Arrange
      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)
      await app.orderCheckout.acceptTerms()

      // Act
      await app.orderCheckout.submit()

      // Assert
      await expect(alerts.cpf).toHaveText('CPF inválido')
    })

    test('deve exigir o aceite dos termos ao finalizar com dados válidos', async ({ app }) => {
      const { alerts, terms } = app.orderCheckout.elements

      const customer = {
        name: 'Fernando',
        surname: 'Papito',
        email: 'papito@teste.com',
        phone: '(11) 99999-9999',
        cpf: '053.661.270-68',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      // Arrange
      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)

      await expect(terms).not.toBeChecked()

      // Act
      await app.orderCheckout.submit()

      // Assert
      await expect(alerts.terms).toHaveText('Aceite os termos')
    })
  })

  test.describe('Pagamento e Confirmação', () => {

    test.beforeEach(async ({ app }) => {
      await app.configurator.open()
    })

    test('deve criar um pedido com sucesso ao concluir a compra à vista', async ({ app }) => {
      const customer = {
        name: 'Fernando',
        surname: 'Papito',
        email: 'papito.e2e@teste.com',
        phone: '(11) 99999-9999',
        cpf: '053.661.270-68',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      await app.database.deleteOrderByEmail(customer.email)

      // Arrange
      await app.configurator.expectTotalPrice('R$ 40.000,00')
      await app.configurator.proceedToCheckout()

      await app.orderCheckout.expectLoaded()
      await app.orderCheckout.expectSummaryTotalPrice('R$ 40.000,00')

      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)

      // Act
      await app.orderCheckout.selectPaymentMethod('À Vista')
      await app.orderCheckout.acceptTerms()
      await app.orderCheckout.submit()

      // Assert
      await app.orderCheckout.expectResult('Pedido Aprovado!')

      await app.database.deleteOrderByEmail(customer.email)
    })

    test('deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento', async ({ app }) => {
      const customer = {
        name: 'Steve',
        surname: 'Woz',
        email: 'woz.e2e@velo.dev',
        phone: '(11) 99999-9999',
        cpf: '654.938.810-47',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      await app.database.deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(710)

      // Arrange
      await app.configurator.proceedToCheckout()
      await app.orderCheckout.expectLoaded()

      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)

      // Act
      await app.orderCheckout.selectPaymentMethod('Financiamento')
      await app.orderCheckout.acceptTerms()
      await app.orderCheckout.submit()

      // Assert
      await app.orderCheckout.expectResult('Pedido Aprovado!')

      await app.database.deleteOrderByEmail(customer.email)
    })

    test('deve encaminhar para análise de crédito quando o score do CPF for entre 501 e 700 no financiamento', async ({ app }) => {
      const customer = {
        name: 'Tony',
        surname: 'Stark',
        email: 'tony.e2e@stark.com',
        phone: '(11) 99999-9999',
        cpf: '746.902.510-37',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      await app.database.deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(600)

      // Arrange
      await app.configurator.proceedToCheckout()
      await app.orderCheckout.expectLoaded()

      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)

      // Act
      await app.orderCheckout.selectPaymentMethod('Financiamento')
      await app.orderCheckout.acceptTerms()
      await app.orderCheckout.submit()

      // Assert
      await app.orderCheckout.expectResult('Pedido em Análise!')

      await app.database.deleteOrderByEmail(customer.email)
    })

    test('deve reprovar o crédito quando o score do CPF for menor ou igual a 500 no financiamento sem entrada', async ({ app }) => {
      const customer = {
        name: 'Clark',
        surname: 'Kent',
        email: 'clark.e2e@dailyplanet.com',
        phone: '(11) 99999-9999',
        cpf: '529.982.247-25',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      await app.database.deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(500)

      // Arrange
      await app.configurator.proceedToCheckout()
      await app.orderCheckout.expectLoaded()

      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)

      // Act
      await app.orderCheckout.selectPaymentMethod('Financiamento')
      await app.orderCheckout.acceptTerms()
      await app.orderCheckout.submit()

      // Assert
      await app.orderCheckout.expectResult('Pedido Reprovado!')

      await app.database.deleteOrderByEmail(customer.email)
    })

    test('deve reprovar o crédito quando o score do CPF for baixo e a entrada for menor que 50%', async ({ app }) => {
      const customer = {
        name: 'Diana',
        surname: 'Prince',
        email: 'diana.e2e@themiscira.com',
        phone: '(11) 99999-9999',
        cpf: '111.444.777-35',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      await app.database.deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(500)

      // Arrange
      await app.configurator.proceedToCheckout()
      await app.orderCheckout.expectLoaded()

      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)

      // Act
      await app.orderCheckout.selectPaymentMethod('Financiamento')
      await app.orderCheckout.fillDownPayment('10000')
      await app.orderCheckout.acceptTerms()
      await app.orderCheckout.submit()

      // Assert
      await app.orderCheckout.expectResult('Pedido Reprovado!')

      await app.database.deleteOrderByEmail(customer.email)
    })

    test('deve aprovar o crédito quando o score do CPF for baixo mas a entrada for igual a 50%', async ({ app }) => {
      const customer = {
        name: 'Richard',
        surname: 'Fortus',
        email: 'richard.e2e@gmail.com',
        phone: '(11) 99999-9999',
        cpf: '394.347.450-04',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      await app.database.deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(450)

      // Arrange
      await app.configurator.proceedToCheckout()
      await app.orderCheckout.expectLoaded()

      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)

      // Act
      await app.orderCheckout.selectPaymentMethod('Financiamento')
      await app.orderCheckout.fillDownPayment('20000')
      await app.orderCheckout.acceptTerms()
      await app.orderCheckout.submit()

      // Assert
      await app.orderCheckout.expectResult('Pedido Aprovado!')

      await app.database.deleteOrderByEmail(customer.email)
    })

    test('deve aprovar o crédito quando o score do CPF for baixo mas a entrada for maior que 50%', async ({ app }) => {
      const customer = {
        name: 'Axl',
        surname: 'Rose',
        email: 'axl.e2e@gnr.com',
        phone: '(11) 99999-9999',
        cpf: '793.275.570-00',
        store: 'Velô Paulista - Av. Paulista, 1000',
      }

      await app.database.deleteOrderByEmail(customer.email)
      await app.mock.creditAnalysis(300)

      // Arrange
      await app.configurator.proceedToCheckout()
      await app.orderCheckout.expectLoaded()

      await app.orderCheckout.fillCustomerData(customer)
      await app.orderCheckout.selectStore(customer.store)

      // Act
      await app.orderCheckout.selectPaymentMethod('Financiamento')
      await app.orderCheckout.fillDownPayment('30000')
      await app.orderCheckout.acceptTerms()
      await app.orderCheckout.submit()

      // Assert
      await app.orderCheckout.expectResult('Pedido Aprovado!')

      await app.database.deleteOrderByEmail(customer.email)
    })
  })
})
