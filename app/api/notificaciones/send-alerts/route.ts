import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { sendUpcomingSessionAlert } from "@/lib/email"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    console.log("Iniciando envío de alertas de sesiones próximas...")

    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const sessions = await pool.query<any>(
      `SELECT s.*, u.email, u.full_name
       FROM sesiones s
       JOIN users u ON s.id = u.id
       WHERE s.dia >= $1 AND s.dia <= $2`,
      [today.toISOString().split("T")[0], nextWeek.toISOString().split("T")[0]]
    )

    console.log(`Se encontraron ${sessions.length} sesiones próximas`)

    let sent = 0
    for (const session of sessions) {
      try {
        console.log(`Enviando alerta para: ${session.full_name || session.username} (${session.email})`)
        await sendUpcomingSessionAlert(
          session.email,
          session.full_name || session.username,
          session.titulo || "Sesión",
          new Date(session.dia),
          session.hora_inicio
        )

        sent++
      } catch (error) {
        console.error(`Error enviando alerta para sesión ${session.id}:`, error)
      }
    }

    console.log(`Se enviaron ${sent} alertas exitosamente`)
    return NextResponse.json({
      success: true,
      message: `Se enviaron ${sent} alertas de sesiones próximas`,
      sessionsFound: sessions.length,
      sent
    })
  } catch (error) {
    console.error("Error en send-session-alerts:", error)
    return NextResponse.json(
      { error: "Error enviando alertas" },
      { status: 500 }
    )
  }
}
