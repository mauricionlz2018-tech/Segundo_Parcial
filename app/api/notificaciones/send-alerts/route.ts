import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendUpcomingSessionAlert } from "@/lib/email"

export const runtime = "nodejs"

// Este endpoint puede ser llamado por un cron job o manualmente
export async function POST(request: Request) {
  try {
    console.log("🔔 Iniciando envío de alertas de sesiones próximas...")

    // Obtener la fecha actual y dentro de 7 días
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Obtener todas las sesiones que están próximas
    const [sessions] = await db.execute(
      `SELECT s.*, u.email, u.full_name
       FROM sesiones s
       JOIN usuarios u ON s.user_id = u.id
       WHERE s.fecha >= DATE(?) AND s.fecha <= DATE(?)
       AND s.notificacion_enviada = 0`,
      [today.toISOString().split("T")[0], nextWeek.toISOString().split("T")[0]]
    ) as any

    console.log(`📋 Se encontraron ${sessions.length} sesiones próximas`)

    let sent = 0
    for (const session of sessions) {
      try {
        console.log(`📧 Enviando alerta para: ${session.full_name} (${session.email})`)
        await sendUpcomingSessionAlert(
          session.email,
          session.full_name || session.username,
          session.nombre_sesion || "Sesión",
          new Date(session.fecha),
          session.hora
        )

        // Marcar como enviada
        await db.execute(
          `UPDATE sesiones SET notificacion_enviada = 1 WHERE id = ?`,
          [session.id]
        )

        sent++
      } catch (error) {
        console.error(`❌ Error enviando alerta para sesión ${session.id}:`, error)
      }
    }

    console.log(`✅ Se enviaron ${sent} alertas exitosamente`)
    return NextResponse.json({ 
      success: true, 
      message: `Se enviaron ${sent} alertas de sesiones próximas`,
      sessionsFound: sessions.length,
      sent
    })
  } catch (error) {
    console.error("❌ Error en send-session-alerts:", error)
    return NextResponse.json(
      { error: "Error enviando alertas" },
      { status: 500 }
    )
  }
}
