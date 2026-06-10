import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE } from "@/lib/auth"
import supabase from "@/lib/db"

export const runtime = "nodejs"

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  return await getUserBySessionToken(token)
}

// DELETE - desregistrarse de una sesion
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { id: sesionId } = await params

  const { count } = await supabase
    .from("user_sesiones")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("sesion_id", sesionId)

  if (!count || count === 0) {
    return NextResponse.json({ error: "No estas registrado en esta sesion." }, { status: 404 })
  }

  await supabase
    .from("user_sesiones")
    .delete()
    .eq("user_id", user.id)
    .eq("sesion_id", sesionId)

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

  return NextResponse.json({ ok: true })
}
