import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import pool from "@/lib/db"
import type { ResultSetHeader } from "mysql2/promise"

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
      "SELECT id FROM espacios WHERE id = ?",
      [id]
    )

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: "Espacio no encontrado" },
        { status: 404 }
      )
    }

    await pool.execute<ResultSetHeader>(
      `UPDATE espacios 
       SET nombre = ?, descripcion = ?, capacidad_maxima = ?
       WHERE id = ?`,
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
      "SELECT id FROM espacios WHERE id = ?",
      [id]
    )

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { error: "Espacio no encontrado" },
        { status: 404 }
      )
    }

    await pool.execute<ResultSetHeader>(
      "DELETE FROM espacios WHERE id = ?",
      [id]
    )

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
