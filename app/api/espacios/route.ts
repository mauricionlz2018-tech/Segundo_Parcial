import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import pool from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const nombre = String(body?.nombre ?? "").trim()
    const descripcion = String(body?.descripcion ?? "").trim()
    const capacidad_maxima = Number(body?.capacidad_maxima ?? 50)

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre del espacio es requerido." },
        { status: 400 }
      )
    }

    if (capacidad_maxima < 1) {
      return NextResponse.json(
        { error: "La capacidad debe ser mayor a 0." },
        { status: 400 }
      )
    }

    // Verificar que existe
    const existing = await query<{ id: string }[]>(
      "SELECT id FROM espacios WHERE id = $1",
      [id]
    )

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: "Espacio no encontrado" },
        { status: 404 }
      )
    }

    await pool.query(
      `UPDATE espacios 
       SET nombre = $1, descripcion = $2, capacidad_maxima = $3
       WHERE id = $4`,
      [nombre, descripcion || null, capacidad_maxima, id]
    )

    return NextResponse.json({
      success: true,
      message: "Espacio actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar espacio:", error)
    return NextResponse.json(
      { success: false, error: "Error al actualizar el espacio" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await query<{ id: string }[]>(
      "SELECT id FROM espacios WHERE id = $1",
      [id]
    )

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: "Espacio no encontrado" },
        { status: 404 }
      )
    }

    await pool.query("DELETE FROM espacios WHERE id = $1", [id])

    return NextResponse.json({
      success: true,
      message: "Espacio eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar espacio:", error)
    return NextResponse.json(
      { success: false, error: "Error al eliminar el espacio" },
      { status: 500 }
    )
  }
}
