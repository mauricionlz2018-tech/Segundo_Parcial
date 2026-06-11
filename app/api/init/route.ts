import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sesiones (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        sesion_id TEXT NOT NULL,
        registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_id, sesion_id)
      )
    `)

    await pool.query(`
      CREATE TABLE IF NOT EXISTS espacios (
        id TEXT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT DEFAULT NULL,
        capacidad_maxima INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `)

    return NextResponse.json({
      ok: true,
      message: "Tablas creadas o verificadas exitosamente",
    })
  } catch (error) {
    console.error("Error en inicialización:", error)
    return NextResponse.json(
      { error: "Error al inicializar BD", details: String(error) },
      { status: 500 }
    )
  }
}