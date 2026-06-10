import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  // Las tablas ya fueron creadas via migración de Supabase.
  // Este endpoint se mantiene por compatibilidad.
  return NextResponse.json({ ok: true, message: "Base de datos inicializada con Supabase." })
}
