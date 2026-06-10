import { NextResponse } from "next/server"
import supabase from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId requerido" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("user_sesiones")
    .select("registered_at, sesiones(id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion, perfil_profesional, afiliacion, biografia)")
    .eq("user_id", userId)
    .order("sesiones(dia)", { ascending: true })

  if (error) {
    return NextResponse.json({ error: "Error al obtener sesiones inscritas" }, { status: 500 })
  }

  const sesiones = (data ?? []).map((row: any) => ({
    ...row.sesiones,
    registered_at: row.registered_at,
  }))

  return NextResponse.json({ data: sesiones, total: sesiones.length })
}
