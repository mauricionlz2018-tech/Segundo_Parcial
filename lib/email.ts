import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = "onboarding@resend.dev"
const APP_NAME = "UES San José del Rincón"

export async function sendEmail(to: string, subject: string, html: string) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })
  if (error) throw new Error(error.message)
  return data
}

export async function sendPasswordResetEmail(
  email: string,
  code: string,
  userName: string
) {
  console.log(`[sendPasswordResetEmail] Enviando código a: ${email}`)

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Código de recuperación de contraseña - UES",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Recuperación de Contraseña</h1>
          </div>
          <div style="border: 1px solid #ddd; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Recibimos una solicitud para recuperar tu contraseña. Usa el siguiente código:</p>
            <div style="background: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #666; font-size: 14px;">Tu código de verificación</p>
              <p style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #667eea; margin: 0;">${code}</p>
            </div>
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 12px; border-radius: 4px; color: #856404;">
              ⏰ <strong>Este código expira en 15 minutos.</strong>
            </div>
            <p style="color: #666; font-size: 13px; margin-top: 20px;">
              Si no solicitaste esto, ignora este correo. Tu cuenta está segura.
            </p>
            <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 12px;">
              © ${new Date().getFullYear()} ${APP_NAME}
            </p>
          </div>
        </body>
      </html>
    `,
  })

  if (error) {
    console.error("[sendPasswordResetEmail] Error:", error)
    throw new Error(error.message)
  }

  console.log(`[sendPasswordResetEmail] Enviado: ${data?.id}`)
  return true
}

export async function sendWelcomeEmail(
  email: string,
  userName: string,
  username: string
) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Bienvenido a UES - Tus credenciales de acceso",
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Bienvenido a UES!</h1>
          </div>
          <div style="border: 1px solid #ddd; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>¡Tu cuenta ha sido creada exitosamente!</p>
            <div style="background: #ecfdf5; border: 2px solid #10B981; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0 0 8px;"><strong>Usuario:</strong> ${username}</p>
              <p style="margin: 0;"><strong>Correo:</strong> ${email}</p>
            </div>
            <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 12px; border-radius: 4px; color: #92400e; margin-bottom: 20px;">
              ⚠️ <strong>Guarda tus datos en un lugar seguro.</strong>
            </div>
            <div style="text-align: center;">
              <a href="${loginUrl}" style="background: #10B981; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                Iniciar Sesión
              </a>
            </div>
            <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 12px; margin-top: 20px;">
              © ${new Date().getFullYear()} ${APP_NAME}
            </p>
          </div>
        </body>
      </html>
    `,
  })

  if (error) {
    console.error("[sendWelcomeEmail] Error:", error)
    return false
  }

  console.log(`[sendWelcomeEmail] Enviado: ${data?.id}`)
  return true
}

export async function sendUpcomingSessionAlert(
  email: string,
  userName: string,
  sessionName: string,
  sessionDate: Date,
  sessionTime: string
) {
  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Recordatorio: ${sessionName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">¡Sesión Próxima!</h1>
          </div>
          <div style="border: 1px solid #ddd; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
            <p>Hola <strong>${userName}</strong>,</p>
            <p>Tienes una sesión próxima en tu agenda:</p>
            <div style="background: #ecfdf5; border-left: 4px solid #10B981; padding: 16px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px;"><strong>Sesión:</strong> ${sessionName}</p>
              <p style="margin: 0 0 8px;"><strong>Fecha:</strong> ${formatDate(sessionDate)}</p>
              <p style="margin: 0; color: #059669; font-size: 18px; font-weight: bold;"><strong>Hora:</strong> ${sessionTime}</p>
            </div>
            <p style="color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 12px;">
              © ${new Date().getFullYear()} ${APP_NAME}
            </p>
          </div>
        </body>
      </html>
    `,
  })

  if (error) {
    console.error("[sendUpcomingSessionAlert] Error:", error)
    throw new Error(error.message)
  }

  return true
}