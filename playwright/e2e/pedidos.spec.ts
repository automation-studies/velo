import { test, expect } from '@playwright/test'

test('deve consultar um pedido aprovado', async ({ page }) => {
  // Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint')
  
  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  // Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-PGDLY8')
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  //Assert
  await expect(page.getByText('Pedido', { exact: true })).toBeVisible()
  await expect(page.getByText('VLO-PGDLY8', { exact: true })).toBeVisible()

  await expect(page.getByText('APROVADO')).toBeVisible()
  await expect(page.getByTestId(`order-result-VLO-PGDLY8`)).toBeVisible()
})