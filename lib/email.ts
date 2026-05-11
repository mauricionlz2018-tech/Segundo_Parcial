import nodemailer from "nodemailer"

let transporter: any

// Configurar el transporte de email
if (process.env.NODE_ENV === "production") {
  // Producción: usar credenciales reales
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
} else {
  // Desarrollo: transporte de prueba que no requiere credenciales
  transporter = {
    sendMail: async (mailOptions: any) => {
      console.log("📧 Email de prueba (no se envía realmente):")
      console.log(`  Para: ${mailOptions.to}`)
      console.log(`  Asunto: ${mailOptions.subject}`)
      console.log(`  Token: ${mailOptions.html?.match(/token-box[^>]*>(.*?)<\/div>/s)?.[1]?.replace(/<[^>]*>/g, "").trim() || "N/A"}`)
      return { messageId: "test-" + Date.now() }
    },
  }
}

export async function sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const resetPageUrl = `${appUrl}/auth/reset`

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
            <h1>🔐 Recuperación de Contraseña</h1>
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
              <strong>⚠️ Este token expira en 1 hora.</strong> Si necesitas recuperar tu contraseña después de este tiempo, deberás solicitar un nuevo token.
            </div>
            
            <p style="color: #666; font-size: 14px;">
              Si <strong>no solicitaste</strong> esta recuperación de contraseña, puedes ignorar este correo con seguridad. Tu cuenta no será afectada.
            </p>
            
            <div class="footer">
              <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
              <p>&copy; ${new Date().getFullYear()} Universidad Especializada de El Salvador. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `

  const textContent = `
RECUPERACIÓN DE CONTRASEÑA
=========================

Hola ${userName},

Recibimos una solicitud para recuperar tu contraseña.

Sigue estos pasos:
1. Copia el token que aparece abajo
2. Ve a: ${resetPageUrl}
3. Pega el token en el campo correspondiente
4. Ingresa tu nueva contraseña
5. ¡Listo! Tu contraseña será actualizada

Tu Token de Recuperación:
${resetToken}

Este token expira en 1 hora. Si necesitas recuperar tu contraseña después de este tiempo, deberás solicitar un nuevo token.

Si NO solicitaste esta recuperación de contraseña, puedes ignorar este correo con seguridad. Tu cuenta no será afectada.

Este es un mensaje automático, por favor no respondas a este correo.
  `

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: "🔐 Recuperación de Contraseña - UES",
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
