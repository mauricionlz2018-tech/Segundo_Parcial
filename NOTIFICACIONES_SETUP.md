# Sistema de Notificaciones por Correo

## Configuración

1. **Actualiza el `.env.local`** con una clave segura:
```env
NOTIF_API_KEY=tu-clave-super-secreta-aqui
```

## Cómo funciona

### Envío de notificaciones
La API `/api/notificaciones/enviar` envía dos tipos de notificaciones:

1. **Un día antes**: Si una sesión comienza mañana, envía recordatorio hoy
2. **15 minutos antes**: Si una sesión va a empezar en los próximos 15 minutos

### Ejecutar manualmente (desde browser o Postman)

```bash
# GET desde tu navegador O POST con Postman/curl
curl -X POST http://localhost:3000/api/notificaciones/enviar \
  -H "Authorization: Bearer tu-clave-super-secreta-aqui"
```

### Ejecutar automáticamente con Cron Job

**OPCIÓN 1: Usar Vercel Cron (recomendado para producción)**

Crea `app/api/notificaciones/cron/route.ts`:

```typescript
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  try {
    const apiKey = process.env.NOTIF_API_KEY
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const res = await fetch(`${baseUrl}/api/notificaciones/enviar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error en cron:", error)
    return NextResponse.json({ error: "Cron error" }, { status: 500 })
  }
}

// Para Vercel, agregar esto al next.config.mjs:
// export const crons = [
//   {
//     path: '/api/notificaciones/cron',
//     schedule: '*/5 * * * *' // Cada 5 minutos
//   }
// ]
```

**OPCIÓN 2: Script Node.js en local**

Crea `scripts/send-notifications.js`:

```javascript
import fetch from 'node-fetch'

async function sendNotifications() {
  const apiKey = process.env.NOTIF_API_KEY
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  try {
    const res = await fetch(`${baseUrl}/api/notificaciones/enviar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    const data = await res.json()
    console.log("Notificaciones:", data)
  } catch (error) {
    console.error("Error:", error)
  }
}

sendNotifications()
```

Ejecutar: `node scripts/send-notifications.js`

## Flujo de inscripción del alumno

### 1. **Registrarse** (`/auth/register`)
- Nombre, email, carrera
- Se crea usuario en `users` tabla

### 2. **Ver sesiones** (`/sesiones`)
- Obtiene lista de sesiones disponibles con `/api/sesiones/disponibles`
- Muestra cupos disponibles y detalles

### 3. **Inscribirse**
- Click en botón "Inscribirse"
- POST a `/api/sesiones/{id}/inscribir`
- Se inserta en `user_sesiones`
- Se actualiza contador de cupos

### 4. **Recibir notificaciones**
- Sistema verifica cada X minutos
- Envía email 1 día antes
- Envía email 15 minutos antes
- Marca en `notificaciones_enviadas` para evitar duplicados

### 5. **Ver mis sesiones**
- Tab "Mis Sesiones" en `/sesiones`
- Lista las sesiones donde está inscrito
- Puede desinscribirse (elimina de `user_sesiones` y libera cupo)

## Tablas de BD involucradas

- `users`: Alumnos registrados
- `sesiones`: Sesiones disponibles
- `user_sesiones`: Relación alumno-sesión (inscripciones)
- `notificaciones_enviadas`: Control de notificaciones enviadas

## Testing

**Crear sesión de prueba para mañana:**

```sql
INSERT INTO sesiones (id, titulo, ponente, dia, hora_inicio, hora_fin, tipo, lugar, cupos_total, cupos_ocupados, descripcion)
VALUES (UUID(), 'Prueba Mañana', 'Dr. Test', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:00:00', 'Conferencia', 'Aula 1', 30, 0, 'Sesión de prueba');
```

**Inscribir usuario de prueba:**

```sql
INSERT INTO user_sesiones (id, user_id, sesion_id)
VALUES (UUID(), (SELECT id FROM users LIMIT 1), (SELECT id FROM sesiones ORDER BY id DESC LIMIT 1));
```

**Ejecutar notificaciones:**
```bash
curl -X POST http://localhost:3000/api/notificaciones/enviar \
  -H "Authorization: Bearer tu-clave-aqui"
```
