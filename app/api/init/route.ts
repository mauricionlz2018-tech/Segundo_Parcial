import { NextResponse } from "next/server"
import pool from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    // Crear tabla user_sesiones si no existe
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user_sesiones (
        id char(36) NOT NULL PRIMARY KEY,
        user_id char(36) NOT NULL,
        sesion_id char(36) NOT NULL,
        registered_at timestamp NOT NULL DEFAULT current_timestamp(),
        UNIQUE KEY unique_user_sesion (user_id, sesion_id),
        KEY idx_user_id (user_id),
        KEY idx_sesion_id (sesion_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)

    // Crear tabla espacios si no existe
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS espacios (
        id char(36) NOT NULL PRIMARY KEY,
        nombre varchar(255) NOT NULL,
        descripcion text DEFAULT NULL,
        capacidad_maxima int(11) NOT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp()
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)

    return NextResponse.json({ 
      ok: true, 
      message: "Tablas creadas o verificadas exitosamente" 
    })
  } catch (error) {
    console.error("Error en inicialización:", error)
    return NextResponse.json(
      { error: "Error al inicializar BD", details: String(error) },
      { status: 500 }
    )
  }
}
