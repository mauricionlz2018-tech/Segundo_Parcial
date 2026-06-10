import { NextResponse } from "next/server"
import supabase from "@/lib/db"

export async function GET() {
  const { data, error } = await supabase
    .from("espacios")
    .select("id, nombre, descripcion, capacidad_maxima, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Error al obtener espacios" }, { status: 500 })
  }

  return NextResponse.json({ data: data ?? [] })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const nombre = String(body?.nombre ?? "").trim()
  const descripcion = String(body?.descripcion ?? "").trim()
  const capacidad_maxima = Number(body?.capacidad_maxima ?? 50)

  if (!nombre) {
    return NextResponse.json({ error: "El nombre del espacio es requerido." }, { status: 400 })
  }

  if (capacidad_maxima < 1) {
    return NextResponse.json({ error: "La capacidad debe ser mayor a 0." }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("espacios")
    .insert({ nombre, descripcion: descripcion || null, capacidad_maxima })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ success: false, error: "Error al crear el espacio" }, { status: 500 })
  }

  return NextResponse.json(
    { success: true, message: "Espacio creado exitosamente", id: data.id },
    { status: 201 }
  )
}
