import nodemailer from "nodemailer"

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const result = await getTransporter().sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      html,
    })
    return result
  } catch (error) {
    console.error("Error enviando email:", error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const resetPageUrl = `${appUrl}/auth/reset`

  console.log(" [sendPasswordResetEmail] Iniciando...")
  console.log(`   Email destino: ${email}`)
  console.log(`   Usuario Gmail: ${process.env.GMAIL_USER}`)

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .token-box {
            background: #f8f9fa;
            border: 2px solid #667eea;
            padding: 16px;
            border-radius: 8px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            word-break: break-all;
            font-size: 14px;
            color: #333;
          }
          .steps {
            background: #e7f3ff;
            border-left: 4px solid #667eea;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .steps ol {
            margin: 10px 0;
            padding-left: 20px;
          }
          .steps li {
            margin: 8px 0;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 12px;
            border-radius: 4px;
            margin-top: 20px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> Recuperación de Contraseña</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>Recibimos una solicitud para recuperar tu contraseña.</p>
            
            <div class="steps">
              <strong>Sigue estos pasos:</strong>
              <ol>
                <li>Copia el token que aparece abajo</li>
                <li>Ve a: <strong>${resetPageUrl}</strong></li>
                <li>Pega el token en el campo correspondiente</li>
                <li>Ingresa tu nueva contraseña</li>
                <li>¡Listo! Tu contraseña será actualizada</li>
              </ol>
            </div>
            
            <p><strong>Tu Token de Recuperación:</strong></p>
            <div class="token-box">
              ${resetToken}
            </div>
            
            <div class="warning">
              <strong> Este token expira en 1 hora.</strong> Si necesitas recuperar tu contraseña después de este tiempo, deberás solicitar un nuevo token.
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Si <strong>no solicitaste</strong> esta recuperación de contraseña, puedes ignorar este correo con seguridad. Tu cuenta no será afectada.
            </p>
            
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>&copy; ${new Date().getFullYear()} UES San José del Rincón. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    console.log(" Intentando enviar email con Gmail SMTP...")
    console.log(`   FROM: ${process.env.GMAIL_USER}`)
    console.log(`   TO: ${email}`)
    
    const result = await getTransporter().sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Recuperación de Contraseña - UES",
      html: htmlContent,
    })

    console.log(` Email enviado exitosamente: ${result.messageId}`)
    return true
  } catch (error) {
    console.error(" Error enviando email:", error)
    console.error(" Detalles del error:", JSON.stringify(error, null, 2))
    return false
  }
}

export async function sendWelcomeEmail(email: string, userName: string, username: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .button {
            display: inline-block;
            background: #10B981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .credentials {
            background: #ecfdf5;
            border: 2px solid #10B981;
            padding: 16px;
            margin: 20px 0;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
          }
          .credential-item {
            margin: 12px 0;
            padding: 8px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #10B981;
            padding-left: 12px;
          }
          .credential-label {
            font-size: 12px;
            color: #059669;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .credential-value {
            font-size: 16px;
            font-weight: bold;
            color: #065F46;
            margin-top: 4px;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            padding: 12px;
            border-radius: 4px;
            margin: 20px 0;
            color: #92400e;
            font-size: 13px;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a UES!</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>¡Felicidades! Tu cuenta ha sido creada exitosamente en la plataforma de UES San José del Rincón.</p>
            
            <p><strong>Tus datos de acceso son:</strong></p>
            
            <div class="credentials">
              <div class="credential-item">
                <div class="credential-label"> Usuario</div>
                <div class="credential-value">${username}</div>
              </div>
              <div class="credential-item">
                <div class="credential-label"> Correo</div>
                <div class="credential-value">${email}</div>
              </div>
            </div>
            
            <div class="warning">
              <strong> IMPORTANTE:</strong> Guarda estos datos en un lugar seguro. Por tu seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.
            </div>
            
            <p>Ahora puedes acceder a tu cuenta para consultar información sobre eventos, conferencias y sesiones académicas:</p>
            
            <center>
              <a href="${loginUrl}" class="button">Ir a Iniciar Sesión</a>
            </center>
            
            <p style="color: #666; font-size: 14px;">
              Si no creaste esta cuenta, contáctanos inmediatamente al correo de soporte.
            </p>
            
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>&copy; ${new Date().getFullYear()} UES San José del Rincón. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const textContent = `
Hola ${userName},

¡Felicidades! Tu cuenta ha sido creada exitosamente en la plataforma de UES San José del Rincón.

Tus datos de acceso son:

Usuario: ${username}
Correo: ${email}

IMPORTANTE: Guarda estos datos en un lugar seguro. Por tu seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.

Ahora puedes acceder a tu cuenta en:
${loginUrl}

Si no creaste esta cuenta, contáctanos inmediatamente.
  `

  try {
    console.log("Enviando email de bienvenida con Gmail SMTP...")
    console.log(`   FROM: ${process.env.GMAIL_USER}`)
    console.log(`   TO: ${email}`)
    
    const result = await getTransporter().sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Bienvenido a UES - Tus credenciales de acceso",
      html: htmlContent,
      text: textContent,
    })
    
    console.log(`Email de bienvenida enviado: ${result.messageId}`)
    return true
  } catch (error) {
    console.error("Error enviando email de bienvenida:", error)
    if (process.env.NODE_ENV === "production") {
      throw error
    }
    return true
  }
}

export async function sendUpcomingSessionAlert(
  email: string,
  userName: string,
  sessionName: string,
  sessionDate: Date,
  sessionTime: string
) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
          }
          .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 20px;
            border-radius: 8px 8px 0 0;
            text-align: center;
          }
          .content {
            padding: 20px;
          }
          .session-details {
            background: #ecfdf5;
            border-left: 4px solid #10B981;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .session-details p {
            margin: 8px 0;
          }
          .session-time {
            font-size: 18px;
            font-weight: bold;
            color: #059669;
          }
          .button {
            display: inline-block;
            background: #10B981;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Recordatorio de Sesión Próxima!</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>Te recordamos que tienes una sesión próxima en tu agenda:</p>
            
            <div class="session-details">
              <p><strong>Sesión:</strong> ${sessionName}</p>
              <p><strong>Fecha:</strong> ${formatDate(sessionDate)}</p>
              <p class="session-time"><strong>Hora:</strong> ${sessionTime}</p>
            </div>
            
            <p>Asegúrate de estar preparado para la sesión. Si tienes preguntas o problemas para acceder, no dudes en contactar al soporte.</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/sesiones" class="button">Ver Mi Cronograma</a>
            </center>
            
            <div class="footer">
              <p>Este es un recordatorio automático. Por favor no respondas a este correo.</p>
              <p>&copy; ${new Date().getFullYear()} UES San José del Rincón. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    console.log(" Enviando alerta de sesión próxima...")
    console.log(`   FROM: ${process.env.GMAIL_USER}`)
    console.log(`   TO: ${email}`)
    console.log(`   Sesión: ${sessionName} - ${formatDate(sessionDate)} ${sessionTime}`)
    
    const result = await getTransporter().sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Recordatorio: Sesión próxima - ${sessionName}`,
      html: htmlContent,
    })
    
    console.log(` Alerta de sesión enviada: ${result.messageId}`)
    return true
  } catch (error) {
    console.error(" Error enviando alerta de sesión:", error)
    throw error
  }
}
