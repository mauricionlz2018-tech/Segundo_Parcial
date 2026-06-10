import { createClient, SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

/**
 * Devuelve el cliente admin de Supabase con service_role key.
 * Se inicializa de forma lazy para que no falle durante el build de Next.js.
 * Solo usar en API routes y server-side code (bypasa RLS).
 */
export function getSupabase(): SupabaseClient {
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

// Para compatibilidad: supabase = getSupabase(), pero esto lo hacemos en cada ruta
export const supabase = getSupabase

export default getSupabase
