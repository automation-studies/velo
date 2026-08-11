import { test } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('deve atualizar a imagem do veículo sem alterar o preço ao modificar a cor', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')
    
    await app.configurator.selectColor('Midnight Black')
    await app.configurator.expectTotalPrice('R$ 40.000,00')
    await app.configurator.expectVehicleImageSrc('midnight-black-aero-wheels')
  })

  test('deve atualizar a imagem e o preço do veículo ao modificar as rodas', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.expectTotalPrice('R$ 42.000,00')
    await app.configurator.expectVehicleImageSrc('glacier-blue-sport-wheels')

    await app.configurator.selectWheels(/Aero Wheels/)
    await app.configurator.expectTotalPrice('R$ 40.000,00')
    await app.configurator.expectVehicleImageSrc('glacier-blue-aero-wheels')
  })

  test('deve atualizar o preço com opcionais e persistir o resumo ao ir para o checkout', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.setOptional(true, /Precision Park/)
    await app.configurator.expectTotalPrice('R$ 45.500,00')

    await app.configurator.setOptional(true, /Flux Capacitor/)
    await app.configurator.expectTotalPrice('R$ 50.500,00')

    await app.configurator.setOptional(false, /Precision Park/)
    await app.configurator.setOptional(false, /Flux Capacitor/)
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.proceedToCheckout()
    await app.orderCheckout.expectSummaryTotalPrice('R$ 40.000,00')
  })

  test('deve somar e restaurar o preço apenas com Precision Park ao marcar e desmarcar', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.setOptional(true, /Precision Park/)
    await app.configurator.expectTotalPrice('R$ 45.500,00')

    await app.configurator.setOptional(false, /Precision Park/)
    await app.configurator.expectTotalPrice('R$ 40.000,00')
  })

  test('deve somar e restaurar o preço apenas com Flux Capacitor ao marcar e desmarcar', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.setOptional(true, /Flux Capacitor/)
    await app.configurator.expectTotalPrice('R$ 45.000,00')

    await app.configurator.setOptional(false, /Flux Capacitor/)
    await app.configurator.expectTotalPrice('R$ 40.000,00')
  })

  test('deve refletir o preço ao adicionar os dois opcionais e removê-los um por vez', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.setOptional(true, /Precision Park/)
    await app.configurator.setOptional(true, /Flux Capacitor/)
    await app.configurator.expectTotalPrice('R$ 50.500,00')

    await app.configurator.setOptional(false, /Precision Park/)
    await app.configurator.expectTotalPrice('R$ 45.000,00')

    await app.configurator.setOptional(false, /Flux Capacitor/)
    await app.configurator.expectTotalPrice('R$ 40.000,00')
  })
})