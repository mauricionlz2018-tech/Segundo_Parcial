-- Agregar columna para foto del ponente
ALTER TABLE sesiones ADD COLUMN foto_ponente LONGTEXT NULL AFTER ponente;

-- Si la tabla ya existe y tiene datos, esta query no afectará los registros existentes
