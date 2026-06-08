import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserBySessionToken, SESSION_COOKIE, hashPassword } from "@/lib/auth"
import pool from "@/lib/db"
import type { ResultSetHeader } from "mysql2/promise"

export const runtime = "nodejs"

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const user = await getUserBySessionToken(token)
  if (!user || user.role !== "admin") return null
  return user
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 })
  }

  const userId = params.id
  const body = await request.json().catch(() => null)
  const { email, username, full_name, carrera, role, password } = body

  if (!userId) {
    return NextResponse.json({ error: "ID de usuario requerido." }, { status: 400 })
  }

  if (role !== "admin" && role !== "alumno") {
    return NextResponse.json(
      { error: "El rol debe ser 'admin' o 'alumno'." },
      { status: 400 }
    )
  }

  const [existing] = await pool.execute("SELECT id FROM users WHERE id = ? LIMIT 1", [userId])
  if (!Array.isArray(existing) || (existing as any).length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 })
  }

  if (email) {
    const [emailTaken] = await pool.execute(
      "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
      [email, userId]
    )
    if (Array.isArray(emailTaken) && emailTaken.length > 0) {
      return NextResponse.json({ error: "El email ya está registrado." }, { status: 400 })
    }
  }

  if (username) {
    const [usernameTaken] = await pool.execute(
      "SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1",
      [username, userId]
    )
    if (Array.isArray(usernameTaken) && usernameTaken.length > 0) {
      return NextResponse.json({ error: "El usuario ya está registrado." }, { status: 400 })
    }
  }

  try {
    const updateFields: string[] = []
    const values: any[] = []

    updateFields.push("email = ?")
    values.push(email)
    updateFields.push("username = ?")
    values.push(username)
    updateFields.push("full_name = ?")
    values.push(full_name)
    updateFields.push("carrera = ?")
    values.push(carrera || null)
    updateFields.push("role = ?")
    values.push(role)

    if (password && String(password).trim().length > 0) {
      const pwd = String(password).trim()
      if (pwd.length < 6) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 6 caracteres." },
          { status: 400 }
        )
      }
      updateFields.push("password_hash = ?")
      values.push(await hashPassword(pwd))
    }

    values.push(userId)

    await pool.execute(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      values
    )

    return NextResponse.json({
      ok: true,
      message: "Usuario actualizado exitosamente.",
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return NextResponse.json(
      { error: "Error al actualizar el usuario." },
      { status: 500 }
    )
  }
}
