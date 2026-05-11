import nodemailer from "nodemailer"

// Configurar el transporte de email
// Para desarrollo, usar Mailtrap o similar
// Para producción, usar Gmail, Sendgrid, AWS SES, etc.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true", // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset?token=${resetToken}`

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
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 4px;
            text-decoration: none;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background: #764ba2;
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
            <h1>Recuperación de Contraseña</h1>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>Recibimos una solicitud para recuperar tu contraseña. Si no fuiste tú, puedes ignorar este correo.</p>
            
            <p>Para establecer una nueva contraseña, haz clic en el siguiente botón:</p>
            
            <center>
              <a href="${resetUrl}" class="button">Recuperar Contraseña</a>
            </center>
            
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>⚠️ Este enlace expira en 1 hora.</strong> Si no lo usas dentro de este tiempo, deberás solicitar un nuevo reset de contraseña.
            </div>
            
            <div class="footer">
              <p>Este es un mensaje automático, por favor no responders a este correo.</p>
              <p>&copy; ${new Date().getFullYear()} Universidad. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const textContent = `
Hola ${userName},

Recibimos una solicitud para recuperar tu contraseña. Si no fuiste tú, puedes ignorar este correo.

Para establecer una nueva contraseña, accede a este enlace:
${resetUrl}

Este enlace expira en 1 hora. Si no lo usas dentro de este tiempo, deberás solicitar un nuevo reset de contraseña.

Este es un mensaje automático, por favor no respondas a este correo.
  `

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Recuperación de Contraseña - UES",
      html: htmlContent,
      text: textContent,
    })

    console.log(`Email enviado: ${info.messageId}`)
    return true
  } catch (error) {
    console.error("Error enviando email:", error)
    // En desarrollo, no fallar si no está configurado el email
    if (process.env.NODE_ENV === "production") {
      throw error
    }
    return true
  }
}

export async function sendWelcomeEmail(email: string, userName: string, username: string) {
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
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            border-radius: 4px;
            text-decoration: none;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background: #764ba2;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .credentials {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
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
            
            <p>Tu cuenta ha sido creada exitosamente. Aquí están tus datos de acceso:</p>
            
            <div class="credentials">
              <p><strong>Usuario:</strong> ${username}</p>
              <p><strong>Email:</strong> ${email}</p>
            </div>
            
            <p>Ahora puedes acceder a tu cuenta:</p>
            
            <center>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" class="button">Ir a Login</a>
            </center>
            
            <div class="footer">
              <p>Si tienes problemas para acceder, contacta al administrador.</p>
              <p>&copy; ${new Date().getFullYear()} Universidad. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const textContent = `
Hola ${userName},

Tu cuenta ha sido creada exitosamente. Aquí están tus datos de acceso:

Usuario: ${username}
Email: ${email}

Ahora puedes acceder a tu cuenta en:
${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login

Si tienes problemas para acceder, contacta al administrador.
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "Bienvenido a UES - Acceso a tu Cuenta",
      html: htmlContent,
      text: textContent,
    })
    return true
  } catch (error) {
    console.error("Error enviando email de bienvenida:", error)
    if (process.env.NODE_ENV === "production") {
      throw error
    }
    return true
  }
}
