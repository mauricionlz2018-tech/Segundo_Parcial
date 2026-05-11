# Guía de Configuración de Recuperación de Contraseña

## Descripción General

Se ha implementado un sistema completo de recuperación de contraseña con:
- ✅ Página para solicitar recuperación de contraseña (`/auth/request-reset`)
- ✅ Envío de email con token de recuperación
- ✅ Página para restablecer contraseña (`/auth/reset`)
- ✅ Validación y actualización de contraseña

## Configuración de Email

### Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-app
EMAIL_FROM=noreply@ues.edu.sv
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Opciones de Configuración de Email

#### 1. **Gmail** (Recomendado para desarrollo)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-app  # Usa App Password, no tu contraseña normal
```

**Pasos:**
1. Habilita la verificación de dos factores en tu cuenta de Google
2. Crea una "App Password" en https://myaccount.google.com/apppasswords
3. Usa esta contraseña de aplicación en `EMAIL_PASSWORD`

#### 2. **Mailtrap** (Para testing sin enviar emails reales)
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-username
EMAIL_PASSWORD=tu-password
```

**Pasos:**
1. Crea una cuenta en https://mailtrap.io
2. Obtén tus credenciales del dashboard
3. Todos los emails se capturan en Mailtrap para testing

#### 3. **SendGrid**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.xxxxxxxxxx  # Tu API Key de SendGrid
```

#### 4. **AWS SES**
```env
EMAIL_HOST=email-smtp.region.amazonaws.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-usuario-ses
EMAIL_PASSWORD=tu-contraseña-ses
```

## Flujo de Funcionamiento

### 1. Usuario Solicita Recuperación
- Usuario accede a `/auth/request-reset`
- Ingresa su usuario o email
- Se genera un token y se envía por email
- Token válido por 1 hora

### 2. Email Recibido
- Usuario recibe email con botón "Recuperar Contraseña"
- Email contiene:
  - Botón directo a la página de reset
  - Link directo (respaldo)
  - Advertencia sobre expiración del token (1 hora)

### 3. Restablecer Contraseña
- Usuario hace clic en el link del email
- Se redirige a `/auth/reset?token=TOKEN`
- Usuario ingresa nueva contraseña
- Se valida y se actualiza en la BD

## Archivos Modificados/Creados

### Creados
- `lib/email.ts` - Funciones para enviar emails
- `app/auth/request-reset/page.tsx` - Página de solicitud
- `SETUP_EMAIL.md` - Este archivo

### Modificados
- `app/api/auth/request-reset/route.ts` - Agregó envío de email
- `app/auth/reset/page.tsx` - Mejorada UI y UX
- `app/auth/login/page.tsx` - Agregó enlace a recuperación

### Base de Datos
- Tabla `password_resets` ya existe (ver scripts/ues_db1.sql)
- Estructura:
  ```sql
  CREATE TABLE `password_resets` (
    `id` char(36) NOT NULL,
    `user_id` char(36) NOT NULL,
    `token_hash` char(64) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
    `expires_at` datetime NOT NULL
  )
  ```

## Características de Seguridad

✅ **Tokens hasheados** - Los tokens se guardan hasheados en BD
✅ **Expiración** - Tokens válidos solo por 1 hora
✅ **Rate limiting** - Implementa en producción
✅ **Email seguro** - No revela si cuenta existe
✅ **Contraseñas** - Hasheadas con bcrypt (al menos 6 caracteres)
✅ **HTTPS** - Requerido en producción

## Testing

### En Desarrollo
En desarrollo, la respuesta incluye el token en el JSON:
```json
{
  "ok": true,
  "resetToken": "tu-token-aqui"
}
```

Puedes usarlo directamente: `/auth/reset?token=tu-token-aqui`

### Con Mailtrap
1. Usa Mailtrap para testing
2. Verifica los emails en el dashboard de Mailtrap
3. Copia el link del email para testing

### Curl para Testing
```bash
# Solicitar reset
curl -X POST http://localhost:3000/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"identifier":"usuario@email.com"}'

# Restablecer con token
curl -X POST http://localhost:3000/api/auth/reset \
  -H "Content-Type: application/json" \
  -d '{"token":"TOKEN_AQUI","password":"nueva-contraseña"}'
```

## Troubleshooting

### "Error enviando email"
- Verifica que `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` estén configurados
- Comprueba que las credenciales sean correctas
- En Gmail, asegúrate de usar App Password, no la contraseña normal
- Verifica que el firewall no bloquee el puerto SMTP

### "Token inválido o expirado"
- El token debe usarse dentro de 1 hora
- Solicita un nuevo reset si el token expiró

### "Email no llega"
- Revisa carpeta de spam
- Usa Mailtrap para verificar que se envía
- Verifica la dirección de email del usuario

### En desarrollo sin email configurado
- El sistema seguirá funcionando sin error
- Verifica la consola para ver los logs

## Próximas Mejoras

- [ ] Rate limiting en endpoints de reset
- [ ] Notificación de cambio de contraseña
- [ ] Confirmación de cambio por email
- [ ] Recovery codes de emergencia
- [ ] Integración con 2FA
- [ ] Logs de acceso/cambios

## Contacto

Para más información sobre la configuración, contacta al administrador del sistema.
