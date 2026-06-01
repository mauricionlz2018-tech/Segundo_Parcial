import { NextResponse } from "next/server"
import { findUserByEmailOrUsername } from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null)
    const identifier = String(body?.identifier ?? "").trim().toLowerCase()

    if (!identifier) {
      return NextResponse.json({ exists: false })
    }

    const user = await findUserByEmailOrUsername(identifier)
    
    console.log(`🔍 Verificando existencia de: ${identifier} - ${user ? "✅ Existe" : "❌ No existe"}`)
    
    return NextResponse.json({ 
      exists: !!user
    })
  } catch (error) {
    console.error("Error en check-email:", error)
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
