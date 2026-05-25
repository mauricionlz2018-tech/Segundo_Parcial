import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { v4 as uuid } from "uuid"

export const runtime = "nodejs"

// GET: Verificar si el usuario está inscrito
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sesionId } = await params
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId || !sesionId) {
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 })
    }

    const [result] = await pool.query<any>(
      `SELECT COUNT(*) as inscrito FROM user_sesiones 
       WHERE user_id = ? AND sesion_id = ?`,
      [userId, sesionId]
    )

    const inscrito = (result as any[])[0]?.inscrito === 1

    return NextResponse.json({
      inscrito,
    })
  } catch (error) {
    console.error("Error verificando inscripción:", error)
    return NextResponse.json({ error: "Error al verificar inscripción" }, { status: 500 })
  }
}

// POST: Inscribirse en sesión
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sesionId } = await params
    const body = await request.json().catch(() => ({}))
    const userId = body.userId

    console.log("📋 POST /inscribir:", { userId, sesionId })

    if (!userId || !sesionId) {
      console.log("❌ Parámetros faltantes:", { userId, sesionId })
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 })
    }

    // Verificar si ya está inscrito
    const [existing] = await pool.query(
      `SELECT id FROM user_sesiones 
       WHERE user_id = ? AND sesion_id = ?`,
      [userId, sesionId]
    )

    console.log("🔍 Ya inscrito?:", (existing as any[]).length > 0)

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { error: "Ya estás inscrito en esta sesión" },
        { status: 409 }
      )
    }

    // Verificar que la sesión existe y tiene cupos
    const sesion = await pool.query<any>(
      `SELECT id, titulo, cupos_total, cupos_ocupados, dia, hora_inicio 
       FROM sesiones WHERE id = ?`,
      [sesionId]
    )

    console.log("📊 Sesión encontrada:", sesion[0] ? "Sí" : "No")

    if (sesion.length === 0) {
      console.log("❌ Sesión no encontrada")
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    const { cupos_total, cupos_ocupados } = sesion[0]
    if (cupos_ocupados >= cupos_total) {
      console.log("❌ Sin cupos disponibles")
      return NextResponse.json(
        { error: "No hay cupos disponibles en esta sesión" },
        { status: 409 }
      )
    }

    // Inscribir usuario
    const inscripcionId = uuid()
    console.log("📝 Insertando inscripción:", { inscripcionId, userId, sesionId })
    
    await pool.query(
      `INSERT INTO user_sesiones (id, user_id, sesion_id) 
       VALUES (?, ?, ?)`,
      [inscripcionId, userId, sesionId]
    )

    console.log("✅ Inscripción insertada")

    // Actualizar cupos
    await pool.query(
      `UPDATE sesiones SET cupos_ocupados = cupos_ocupados + 1 
       WHERE id = ?`,
      [sesionId]
    )

    console.log("✅ Cupos actualizados")

    return NextResponse.json({
      success: true,
      message: "Inscripción exitosa",
      inscripcionId,
    })
  } catch (error) {
    console.error("❌ ERROR EN POST /inscribir:", error)
    return NextResponse.json({ error: "Error al inscribirse", details: String(error) }, { status: 500 })
  }
}

// DELETE: Desinscribirse
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sesionId } = await params
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId || !sesionId) {
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 })
    }

    // Eliminar inscripción
    const result = await pool.query(
      `DELETE FROM user_sesiones 
       WHERE user_id = ? AND sesion_id = ?`,
      [userId, sesionId]
    )

    // Reducir cupos
    await pool.query(
      `UPDATE sesiones SET cupos_ocupados = GREATEST(0, cupos_ocupados - 1) 
       WHERE id = ?`,
      [sesionId]
    )

    return NextResponse.json({
      success: true,
      message: "Desinscripción exitosa",
    })
  } catch (error) {
    console.error("Error al desinscribirse:", error)
    return NextResponse.json({ error: "Error al desinscribirse" }, { status: 500 })
  }
}
