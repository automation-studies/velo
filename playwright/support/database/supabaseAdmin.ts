import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// Cliente admin (service role) usado apenas em setup/cleanup de testes.
// Usa a API REST do Supabase (HTTPS) em vez de conexão Postgres direta,
// porque os runners do GitHub Actions não têm rota IPv6 e o add-on de
// IPv4 do Supabase é pago.
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
