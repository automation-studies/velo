import { test as base } from '@playwright/test'

import { createConfiguratorActions } from './actions/configuratorActions'
import { createOrderCheckoutActions } from './actions/orderCheckoutActions'
import { createOrderLookupActions } from './actions/orderLookupActions'

import { deleteOrderByEmail } from './database/orderRepository'

type App = {
  configurator: ReturnType<typeof createConfiguratorActions>
  orderCheckout: ReturnType<typeof createOrderCheckoutActions>
  orderLookup: ReturnType<typeof createOrderLookupActions>
  database: {
    deleteOrderByEmail: (email: string) => Promise<void>
  }
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      configurator: createConfiguratorActions(page),
      orderCheckout: createOrderCheckoutActions(page),
      orderLookup: createOrderLookupActions(page),
      database: {
        deleteOrderByEmail,
      },
    }
    await use(app)
  },
})

export { expect } from '@playwright/test'
