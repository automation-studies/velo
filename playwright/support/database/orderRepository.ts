import { db } from './database'

export async function deleteOrderByEmail(email: string) {
  await db.deleteFrom('orders').where('customer_email', '=', email).execute()
}
