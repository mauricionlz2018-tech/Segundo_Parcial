import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE, hashPassword } from "@/lib/auth"
import { query } from "@/lib/db"
import pool from "@/lib/db"
import type { ResultSetHeader } from "mysql2/promise"
import { randomUUID } from "crypto"

export const runtime = "nodejs"

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await getUserBySessionToken(token)
  if (!user || user.role !== "admin") return null
  return user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const rows = await query(
    "select id, email, username, full_name, carrera, role, created_at from users order by created_at desc"
  )

  return NextResponse.json({ data: rows })
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const userId = body?.id

  if (!userId) {
    return NextResponse.json({ error: "ID de usuario requerido." }, { status: 400 })
  }

  // No permitir eliminar al admin actual
  if (userId === admin.id) {
    return NextResponse.json(
      { error: "No puedes eliminar tu propia cuenta." },
      { status: 400 }
    )
  }

  // Eliminar sesiones del usuario
  await pool.execute<ResultSetHeader>("DELETE FROM sessions WHERE user_id = ?", [userId])

  // Eliminar usuario
  await pool.execute<ResultSetHeader>("DELETE FROM users WHERE id = ?", [userId])

  return NextResponse.json({
    ok: true,
    message: "Usuario eliminado exitosamente.",
  })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const { email, username, full_name, carrera, password, role } = body

  // Validaciones
  if (!email || !username || !full_name || !password || !role) {
    return NextResponse.json(
      { error: "Email, usuario, nombre, contraseña y rol son requeridos." },
      { status: 400 }
    )
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 }
    )
  }

  if (role !== "admin" && role !== "alumno") {
    return NextResponse.json(
      { error: "El rol debe ser 'admin' o 'alumno'." },
      { status: 400 }
    )
  }

  // Verificar si el email ya existe
  const [existingEmail] = await pool.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email]
  )
  if (Array.isArray(existingEmail) && existingEmail.length > 0) {
    return NextResponse.json(
      { error: "El email ya está registrado." },
      { status: 400 }
    )
  }

  // Verificar si el username ya existe
  const [existingUsername] = await pool.execute(
    "SELECT id FROM users WHERE username = ? LIMIT 1",
    [username]
  )
  if (Array.isArray(existingUsername) && existingUsername.length > 0) {
    return NextResponse.json(
      { error: "El usuario ya está registrado." },
      { status: 400 }
    )
  }

  try {
    // Hashear la contraseña
    const passwordHash = await hashPassword(password)

    // Generar ID único
    const userId = randomUUID()

    // Crear el usuario
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (id, email, username, full_name, carrera, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [userId, email, username, full_name, carrera || null, passwordHash, role]
    )

    return NextResponse.json(
      {
        ok: true,
        message: "Usuario creado exitosamente.",
        user: {
          id: userId,
          email,
          username,
          full_name,
          carrera,
          role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json(
      { error: "Error al crear el usuario." },
      { status: 500 }
    )
  }
}
