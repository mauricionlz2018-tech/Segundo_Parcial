import { NextResponse } from "next/server"
import supabase from "@/lib/db"
import { sendUpcomingSessionAlert } from "@/lib/email"

export const runtime = "nodejs"

// Este endpoint puede ser llamado por un cron job o manualmente
export async function POST() {
  try {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    const todayStr = today.toISOString().split("T")[0]
    const nextWeekStr = nextWeek.toISOString().split("T")[0]

    // Obtener inscripciones con datos de sesion y usuario para sesiones próximas
    const { data: inscripciones, error } = await supabase
      .from("user_sesiones")
      .select("users(id, email, full_name), sesiones(id, titulo, dia, hora_inicio, lugar)")
      .gte("sesiones.dia", todayStr)
      .lte("sesiones.dia", nextWeekStr)

    if (error) throw error

    const sessions = (inscripciones ?? []).filter(
      (i) => i.users && i.sesiones
    )

    let sent = 0
    for (const item of sessions) {
      const user = item.users as { email: string; full_name: string | null }
      const sesion = item.sesiones as { id: string; titulo: string; dia: string; hora_inicio: string }

      try {
        await sendUpcomingSessionAlert(
          user.email,
          user.full_name ?? user.email,
          sesion.titulo,
          new Date(sesion.dia),
          sesion.hora_inicio
        )
        sent++
      } catch (err) {
        console.error(`Error enviando alerta para sesion ${sesion.id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Se enviaron ${sent} alertas de sesiones proximas`,
      sessionsFound: sessions.length,
      sent,
    })
  } catch (error) {
    console.error("Error en send-session-alerts:", error)
    return NextResponse.json({ error: "Error enviando alertas" }, { status: 500 })
  }
}
