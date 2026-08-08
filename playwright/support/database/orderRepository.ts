import { supabaseAdmin } from './supabaseAdmin'

export async function deleteOrderByEmail(email: string) {
  const { error } = await supabaseAdmin.from('orders').delete().eq('customer_email', email)
  if (error) {
    throw error
  }
}
