import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { v4 as uuid } from "uuid"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    const apiKey = process.env.NOTIF_API_KEY || "secret-key"

    // Verificar que sea una llamada autorizada
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const ahora = new Date()
    const mananaHoras = new Date(ahora.getTime() + 24 * 60 * 60 * 1000)
    const proximosMinutos = new Date(ahora.getTime() + 15 * 60 * 1000)

    let enviadas = 0

    // ===== NOTIFICACIÓN 1: UN DÍA ANTES =====
    const sesionesManana = await pool.query<any>(
      `SELECT s.id, s.titulo, s.ponente, s.dia, s.hora_inicio, s.lugar,
              u.id as user_id, u.email, u.full_name
       FROM sesiones s
       INNER JOIN user_sesiones us ON s.id = us.sesion_id
       INNER JOIN users u ON us.user_id = u.id
       WHERE DATE(s.dia) = DATE(?)
       AND NOT EXISTS(
         SELECT 1 FROM notificaciones_enviadas ne
         WHERE ne.user_id = u.id 
         AND ne.sesion_id = s.id 
         AND ne.tipo = 'dia_antes'
       )`,
      [mananaHoras]
    )

    for (const registro of sesionesManana) {
      try {
        const mensaje = `
          <h2>¡Recordatorio de Sesión Mañana!</h2>
          <p>Hola ${registro.full_name},</p>
          <p>Te recordamos que mañana a las <strong>${registro.hora_inicio}</strong> 
          comienza la sesión:</p>
          <h3>${registro.titulo}</h3>
          <p><strong>Ponente:</strong> ${registro.ponente}</p>
          <p><strong>Lugar:</strong> ${registro.lugar}</p>
          <p>No olvides asistir! 😊</p>
        `

        await sendEmail(registro.email, "Recordatorio: Sesión Mañana", mensaje)

        // Marcar como enviada
        const notifId = uuid()
        await pool.query(
          `INSERT INTO notificaciones_enviadas (id, user_id, sesion_id, tipo)
           VALUES (?, ?, ?, 'dia_antes')`,
          [notifId, registro.user_id, registro.id]
        )

        enviadas++
      } catch (err) {
        console.error(`Error enviando notificación a ${registro.email}:`, err)
      }
    }

    // ===== NOTIFICACIÓN 2: 15 MINUTOS ANTES =====
    const sesionesProximas = await pool.query<any>(
      `SELECT s.id, s.titulo, s.ponente, s.dia, s.hora_inicio, s.lugar,
              u.id as user_id, u.email, u.full_name
       FROM sesiones s
       INNER JOIN user_sesiones us ON s.id = us.sesion_id
       INNER JOIN users u ON us.user_id = u.id
       WHERE CONCAT(s.dia, ' ', s.hora_inicio) BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 20 MINUTE)
       AND NOT EXISTS(
         SELECT 1 FROM notificaciones_enviadas ne
         WHERE ne.user_id = u.id 
         AND ne.sesion_id = s.id 
         AND ne.tipo = 'minutos_antes'
       )`
    )

    for (const registro of sesionesProximas) {
      try {
        const mensaje = `
          <h2>¡La sesión comienza en 15 minutos!</h2>
          <p>Hola ${registro.full_name},</p>
          <p>Te recordamos que en <strong>15 minutos</strong> comienza:</p>
          <h3>${registro.titulo}</h3>
          <p><strong>Ponente:</strong> ${registro.ponente}</p>
          <p><strong>Lugar:</strong> ${registro.lugar}</p>
          <p><strong>Hora:</strong> ${registro.hora_inicio}</p>
          <p>¡Corre a reunirte con nosotros! 🏃</p>
        `

        await sendEmail(registro.email, "¡Sesión en 15 minutos!", mensaje)

        // Marcar como enviada
        const notifId = uuid()
        await pool.query(
          `INSERT INTO notificaciones_enviadas (id, user_id, sesion_id, tipo)
           VALUES (?, ?, ?, 'minutos_antes')`,
          [notifId, registro.user_id, registro.id]
        )

        enviadas++
      } catch (err) {
        console.error(`Error enviando notificación a ${registro.email}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${enviadas} notificaciones enviadas`,
      enviadas,
    })
  } catch (error) {
    console.error("Error en envío de notificaciones:", error)
    return NextResponse.json(
      { error: "Error al enviar notificaciones" },
      { status: 500 }
    )
  }
}
