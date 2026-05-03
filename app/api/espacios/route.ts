import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import pool from "@/lib/db"
import { v4 as uuidv4 } from "uuid"
import type { ResultSetHeader } from "mysql2/promise"

export async function GET() {
  try {
    const espacios = await query(
      "SELECT id, nombre, descripcion, capacidad_maxima, created_at FROM espacios ORDER BY created_at DESC"
    )

    return NextResponse.json({ data: espacios || [] })
  } catch (error) {
    console.error("Error al obtener espacios:", error)
    return NextResponse.json(
      { error: "Error al obtener espacios" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const id = uuidv4()

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

    await pool.execute<ResultSetHeader>(
      `INSERT INTO espacios (id, nombre, descripcion, capacidad_maxima) 
       VALUES (?, ?, ?, ?)`,
      [id, nombre, descripcion || null, capacidad_maxima]
    )

    return NextResponse.json(
      {
        success: true,
        message: "Espacio creado exitosamente",
        id: id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error al crear espacio:", error)
    return NextResponse.json(
      { success: false, error: "Error al crear el espacio" },
      { status: 500 }
    )
  }
}
