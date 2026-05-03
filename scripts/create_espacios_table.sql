-- Crear tabla de espacios/sedes si no existe
CREATE TABLE IF NOT EXISTS espacios (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  capacidad_maxima INT NOT NULL DEFAULT 50,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos espacios de ejemplo (opcional)
-- INSERT INTO espacios (id, nombre, descripcion, capacidad_maxima) 
-- VALUES 
-- ('uuid1', 'Aula Magna', 'Auditorio principal con capacidad amplia', 500),
-- ('uuid2', 'Explanada Institucional', 'Área abierta para eventos', 1000),
-- ('uuid3', 'Explanada Municipal', 'Espacio municipal anexo', 750);
