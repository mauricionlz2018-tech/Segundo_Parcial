CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  carrera VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'alumno',
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sesiones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  titulo VARCHAR(255) NOT NULL,
  ponente VARCHAR(255) NOT NULL,
  perfil_profesional VARCHAR(255),
  afiliacion VARCHAR(255),
  biografia TEXT,
  foto_ponente VARCHAR(500),
  logo_institucion VARCHAR(500),
  dia DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'Conferencia',
  lugar VARCHAR(255) NOT NULL,
  cupos_total INT NOT NULL,
  cupos_ocupados INT NOT NULL DEFAULT 0,
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS espacios (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  capacidad_maxima INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sesiones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sesion_id TEXT NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, sesion_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sesiones_dia ON sesiones(dia);

ALTER TABLE password_resets ADD CONSTRAINT password_resets_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS password_resets_user_id_idx ON password_resets(user_id);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS notificaciones_enviadas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(100) NOT NULL,
  enviado_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sistema_notificaciones_config (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
