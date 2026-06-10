import { createClient } from "@supabase/supabase-js"

type GlobalSupabase = typeof globalThis & { supabaseAdmin?: ReturnType<typeof createClient> }

const globalForSupabase = globalThis as GlobalSupabase

/**
 * Cliente de Supabase con la service_role key para operaciones del servidor
 * (bypassa RLS, solo usar en API routes y server actions)
 */
export const supabase =
  globalForSupabase.supabaseAdmin ??
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

if (process.env.NODE_ENV !== "production") {
  globalForSupabase.supabaseAdmin = supabase
}

export default supabase
