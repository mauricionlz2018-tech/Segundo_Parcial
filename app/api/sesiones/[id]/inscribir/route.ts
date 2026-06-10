import { NextResponse } from "next/server"
import supabase from "@/lib/db"

// GET: Verificar si el usuario esta inscrito
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sesionId } = await params
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId || !sesionId) {
    return NextResponse.json({ error: "Parametros faltantes" }, { status: 400 })
  }

  const { count, error } = await supabase
    .from("user_sesiones")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("sesion_id", sesionId)

  if (error) {
    return NextResponse.json({ error: "Error al verificar inscripcion" }, { status: 500 })
  }

  return NextResponse.json({ inscrito: (count ?? 0) > 0 })
}

// POST: Inscribirse en sesion
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sesionId } = await params
  const body = await request.json().catch(() => ({}))
  const userId = body.userId

  if (!userId || !sesionId) {
    return NextResponse.json({ error: "Parametros faltantes" }, { status: 400 })
  }

  // Verificar si ya esta inscrito
  const { count: yaInscrito } = await supabase
    .from("user_sesiones")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("sesion_id", sesionId)

  if ((yaInscrito ?? 0) > 0) {
    return NextResponse.json({ error: "Ya estas inscrito en esta sesion" }, { status: 409 })
  }

  // Verificar que la sesion existe y tiene cupos
  const { data: sesion, error: sesionError } = await supabase
    .from("sesiones")
    .select("id, cupos_total, cupos_ocupados")
    .eq("id", sesionId)
    .single()

  if (sesionError || !sesion) {
    return NextResponse.json({ error: "Sesion no encontrada" }, { status: 404 })
  }

  if (sesion.cupos_ocupados >= sesion.cupos_total) {
    return NextResponse.json({ error: "No hay cupos disponibles en esta sesion" }, { status: 409 })
  }

  // Inscribir usuario
  const { data: inscripcion, error: insError } = await supabase
    .from("user_sesiones")
    .insert({ user_id: userId, sesion_id: sesionId })
    .select("id")
    .single()

  if (insError) {
    return NextResponse.json({ error: "Error al inscribirse", details: insError.message }, { status: 500 })
  }

  // Actualizar cupos
  await supabase
    .from("sesiones")
    .update({ cupos_ocupados: sesion.cupos_ocupados + 1 })
    .eq("id", sesionId)

  return NextResponse.json({ success: true, message: "Inscripcion exitosa", inscripcionId: inscripcion.id })
}

// DELETE: Desinscribirse
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sesionId } = await params
  const url = new URL(request.url)
  const userId = url.searchParams.get("userId")

  if (!userId || !sesionId) {
    return NextResponse.json({ error: "Parametros faltantes" }, { status: 400 })
  }

  await supabase
    .from("user_sesiones")
    .delete()
    .eq("user_id", userId)
    .eq("sesion_id", sesionId)

  // Decrementar cupos
  const { data: sesion } = await supabase
    .from("sesiones")
    .select("cupos_ocupados")
    .eq("id", sesionId)
    .single()

  if (sesion) {
    await supabase
      .from("sesiones")
      .update({ cupos_ocupados: Math.max(0, sesion.cupos_ocupados - 1) })
      .eq("id", sesionId)
  }

  return NextResponse.json({ success: true, message: "Desinscripcion exitosa" })
}
