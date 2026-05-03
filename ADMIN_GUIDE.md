# Guía de Administración - UES San José del Rincón

## 📋 Tabla de Contenidos
1. [Agregar Nuevos Administradores](#agregar-nuevos-administradores)
2. [Gestionar Usuarios](#gestionar-usuarios)
3. [Gestionar Sesiones](#gestionar-sesiones)
4. [Gestionar Espacios](#gestionar-espacios)
5. [Notificaciones](#notificaciones)
6. [Dark Mode](#dark-mode)

---

## 🔐 Agregar Nuevos Administradores

Hay **3 formas** de agregar nuevos administradores al sistema:

### Opción 1: Usando el Script Node.js (Recomendado)

**Pasos:**

1. Edita el archivo `scripts/seed_admin.mjs`:

```javascript
const email = "nuevo.admin@ues.edu.mx"  // Cambiar email
const password = "Password123!"         // Cambiar contraseña segura
const username = "nuevo.admin"          // Cambiar username
const fullName = "Nombre del Admin"     // Cambiar nombre
```

2. Ejecuta el script:
```bash
npm run seed:admin
```

3. Verifica que se creó correctamente. Deberías ver:
```
Admin user created: nuevo.admin
```

---

### Opción 2: Mediante phpmyadmin o MySQLWorkbench

1. Conéctate a tu base de datos `ues_db1`

2. Ejecuta esta consulta SQL:

```sql
-- Primero, necesitas generar el hash de la contraseña
-- Usa bcrypt para generar: bcrypt.hash("TuContraseña", 10)
-- O usa un generador online: https://bcrypt-generator.com/

INSERT INTO users (id, email, username, full_name, role, password_hash, created_at)
VALUES (
    UUID(),
    'nuevo.admin@ues.edu.mx',
    'nuevo.admin',
    'Nombre del Nuevo Admin',
    'admin',
    '$2a$10$[HASH_AQUI]',  -- Reemplaza con el hash bcrypt generado
    NOW()
);
```

**Ejemplo con contraseña "Admin2025!":**
```sql
INSERT INTO users (id, email, username, full_name, role, password_hash, created_at)
VALUES (
    UUID(),
    'admin2@ues.edu.mx',
    'admin2',
    'Administrador Dos',
    'admin',
    '$2a$10$JrP4gZRq.XqL1H8.K4s6KuRjQMZb3Z8K4F5Y3W1Q0P9M8N7B6V5U4',
    NOW()
);
```

---

### Opción 3: Mediante Endpoint REST API (Si tienes acceso directo)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo.admin@ues.edu.mx",
    "username": "nuevo.admin",
    "fullName": "Nombre del Admin",
    "password": "TuContraseña",
    "role": "admin"
  }'
```

⚠️ **Nota:** Este endpoint actualmente crea usuarios con rol "alumno". Para usar esta opción, primero necesitas modificar el endpoint de registro en `/app/api/auth/register/route.ts`.

---

## 👥 Gestionar Usuarios

### Acceder al Panel de Usuarios

1. Inicia sesión como administrador
2. Ve al **Panel de Administración** → **Usuarios**

### Ver Todos los Usuarios

- Aquí verás una tabla con todos los usuarios registrados
- Información disponible:
  - 📧 Email
  - 👤 Nombre completo
  - 🎓 Carrera
  - 🔐 Rol (Admin/Alumno)
  - 📅 Fecha de registro

### Eliminar un Usuario

1. En la tabla de usuarios, haz clic en el ícono 🗑️ (Trash) del usuario
2. Confirma la eliminación
3. El usuario será eliminado permanentemente junto con todas sus sesiones

⚠️ **No puedes eliminar administradores** - Solo se pueden eliminar usuarios con rol "alumno"

---

## 📚 Gestionar Sesiones

### Crear una Nueva Sesión

1. En el Panel de Admin → **Sesiones**
2. Haz clic en "+ Nueva Sesión"
3. Completa el formulario:
   - **Nombre de Sesión:** Título de la conferencia/taller
   - **Conferencista:** Nombre del ponente
   - **Tipo:** Conferencia / Cultural / Taller / Inauguración / Cierre
   - **Día:** Fecha (ej: "2025-12-01" o "Lunes 1")
   - **Hora Inicio/Fin:** Horario en formato HH:MM
   - **Escenario/Lugar:** Ej: Aula Magna, Explanada, etc.
   - **Cupo Máximo:** Cantidad máxima de asistentes
   - **Descripción:** Detalles adicionales (opcional)

4. Haz clic en "Crear Sesión"

### Editar una Sesión

1. En la tabla de sesiones, haz clic en el ícono ✏️ (Editar)
2. Modifica los datos necesarios
3. Haz clic en "Guardar Cambios"
4. Confirma los cambios

### Eliminar una Sesión

1. Haz clic en el ícono 🗑️ del sesión
2. Confirma la eliminación
3. La sesión se eliminará permanentemente

### Ver Estadísticas

En el tab de **Sesiones** verás:
- 📊 Total de sesiones
- 🎤 Cantidad de ponentes únicos
- 🏛️ Escenarios disponibles
- 👥 Cupos ocupados

---

## 🏛️ Gestionar Espacios

### Acceder a Espacios

1. Inicia sesión como administrador
2. Ve al **Panel de Administración** → **Espacios**

### Crear un Nuevo Espacio

1. Haz clic en "+ Agregar Espacio"
2. Completa el formulario:
   - **Nombre:** Nombre del espacio (Ej: "Aula Magna", "Explanada Institucional")
   - **Descripción:** Detalles del espacio (opcional)
   - **Capacidad Máxima:** Número máximo de personas

3. Haz clic en "Crear"
4. Recibirás una notificación de éxito

### Editar un Espacio

1. En la tabla de espacios, haz clic en el ícono ✏️ (Lápiz)
2. Modifica los datos necesarios
3. Haz clic en "Actualizar"
4. Recibirás una confirmación

### Eliminar un Espacio

1. En la tabla de espacios, haz clic en el ícono 🗑️ (Trash)
2. Se abrirá una ventana de confirmación
3. Confirma la eliminación
4. El espacio se eliminará permanentemente

### Información de Espacios

Cada espacio muestra:
- 📍 Nombre del espacio
- 📝 Descripción (si existe)
- 👥 Capacidad máxima

---

## 🔔 Notificaciones

### Sistema de Notificaciones

El sistema utiliza **Sonner** para mostrar notificaciones en tiempo real:

- ✅ **Success:** Operación completada correctamente
- ❌ **Error:** Algo salió mal
- ℹ️ **Info:** Información importante
- ⚠️ **Warning:** Advertencias

### Dónde Aparecen

Las notificaciones aparecen en la **esquina inferior derecha** de la pantalla.

### Ejemplos Activados

- Guardar cambios en sesiones ✅
- Eliminar usuarios ✅
- Actualizar perfil de usuario ✅
- Errores de red ❌

---

## 🌓 Dark Mode (Modo Oscuro)

### Activar/Desactivar

1. Haz clic en el ícono **☀️ (Sol) o 🌙 (Luna)** en la navbar
2. El tema cambiará automáticamente
3. Tu preferencia se guarda en el navegador

### Temas Disponibles

- **Light (Claro):** Fondo blanco, texto oscuro
- **Dark (Oscuro):** Fondo gris oscuro, texto claro
- **System:** Sigue la preferencia del sistema operativo

---

## 📱 Perfil de Usuario

### Editar Tu Perfil

1. Inicia sesión
2. Haz clic en tu **email** en la navbar (arriba a la derecha)
3. Serás redirigido a `/perfil`
4. Haz clic en "Editar Perfil"

### Información Editable

- ✏️ Nombre Completo
- ✏️ Carrera/Programa

### Información No Editable

- 🔒 Email
- 🔒 Username
- 🔒 Rol

### Eliminar Cuenta

⚠️ **Acción Irreversible**

1. En tu perfil, baja a "Zona de Peligro"
2. Haz clic en "Eliminar Mi Cuenta"
3. Confirma ingresando tu email
4. Tu cuenta y todos sus datos se eliminarán permanentemente

---

## 🔑 Contraseñas Seguras

### Requisitos de Seguridad

Se recomienda usar contraseñas con:
- ✅ Mínimo 8 caracteres
- ✅ Letras mayúsculas y minúsculas
- ✅ Números
- ✅ Caracteres especiales (!@#$%^&*)

### Ejemplo de Contraseña Segura

```
Admin@2025UES!Segura
```

---

## 🐛 Solución de Problemas

### "No puedo crear un usuario"

- Verifica que el email no esté registrado
- Verifica que el username sea único
- Asegúrate de estar autenticado como admin

### "Las sesiones no aparecen en el cronograma"

- Las sesiones deben tener una **fecha (dia)** válida
- Verifica que el formato sea correcto (ej: "2025-12-01")
- Recarga la página

### "No veo el dark mode"

- Limpia el cache del navegador
- Verifica que JavaScript esté habilitado
- Intenta en otro navegador

---

## 📞 Contacto y Soporte

Para reportar problemas o solicitar ayuda:
- 📧 Email: admin@ues.edu.mx
- 💬 Chat: Sistema de mensajería del admin

---

**Última actualización:** 2025-05-02
**Versión:** 1.0
