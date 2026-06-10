import { createClient } from "@supabase/supabase-js"

/**
 * Cliente de Supabase con service_role key para operaciones de servidor.
 * Se crea en tiempo de ejecucion para garantizar que las variables de entorno
 * esten disponibles en el contexto serverless de Vercel.
 */
function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      `Faltan variables de entorno de Supabase: ${!url ? "NEXT_PUBLIC_SUPABASE_URL" : ""} ${!key ? "SUPABASE_SERVICE_ROLE_KEY" : ""}`.trim()
    )
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export const supabase = createSupabaseAdmin()

export default supabase
