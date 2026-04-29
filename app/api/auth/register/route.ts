import { NextResponse } from "next/server"
import {
  createUser,
  hashPassword,
  isEmailTaken,
  isUsernameTaken,
} from "@/lib/auth"

export const runtime = "nodejs"

function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 50)
}

async function buildUniqueUsername(base: string) {
  let candidate = base
  for (let i = 0; i < 5; i += 1) {
    const taken = await isUsernameTaken(candidate)
    if (!taken) return candidate
    const suffix = Math.floor(100 + Math.random() * 900)
    candidate = `${base}${suffix}`
  }
  return null
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const email = String(body?.email ?? "").trim().toLowerCase()
  const password = String(body?.password ?? "")
  const fullName = String(body?.fullName ?? "").trim()
  const carrera = String(body?.carrera ?? "").trim()
  const rawUsername = String(body?.username ?? "").trim()

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Completa todos los campos requeridos." }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "La contrasena debe tener al menos 6 caracteres." }, { status: 400 })
  }

  if (await isEmailTaken(email)) {
    return NextResponse.json({ error: "Este correo ya esta registrado." }, { status: 409 })
  }

  const baseUsername = normalizeUsername(rawUsername || fullName)
  const username = await buildUniqueUsername(baseUsername)
  if (!username) {
    return NextResponse.json({ error: "No se pudo generar un usuario unico. Intenta de nuevo." }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser({
    email,
    username,
    fullName,
    carrera,
    passwordHash,
    role: "alumno",
  })

  if (!user) {
    return NextResponse.json({ error: "No se pudo crear la cuenta." }, { status: 500 })
  }

  return NextResponse.json({ user })
}
