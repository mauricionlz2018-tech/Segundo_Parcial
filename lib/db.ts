import { createClient, SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

/**
 * Devuelve el cliente admin de Supabase con service_role key.
 * Se inicializa de forma lazy para que no falle durante el build de Next.js,
 * cuando las variables de entorno aun no estan disponibles.
 * Solo usar en API routes y server-side code (bypasa RLS).
 */
export function getDb(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY")
  }
  _client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return _client
}

// Proxy lazy: el cliente se crea la primera vez que se usa (en runtime, no en build-time)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export default supabase
