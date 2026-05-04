import { test } from '../support/fixtures'

test.describe('Configuração do Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('deve atualizar a imagem do veículo sem alterar o preço ao modificar a cor', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')
    
    await app.configurator.selectColor('Midnight Black')
    await app.configurator.expectTotalPrice('R$ 40.000,00')
    await app.configurator.expectVehicleImageSrc('/src/assets/midnight-black-aero-wheels.png')
  })

  test('deve atualizar a imagem e o preço do veículo ao modificar as rodas', async ({ app }) => {
    await app.configurator.expectTotalPrice('R$ 40.000,00')

    await app.configurator.selectWheels(/Sport Wheels/)
    await app.configurator.expectTotalPrice('R$ 42.000,00')
    await app.configurator.expectVehicleImageSrc('/src/assets/glacier-blue-sport-wheels.png')

    await app.configurator.selectWheels(/Aero Wheels/)
    await app.configurator.expectTotalPrice('R$ 40.000,00')
    await app.configurator.expectVehicleImageSrc('/src/assets/glacier-blue-aero-wheels.png')
  })
})