-- Crear tabla de inscripciones de usuarios en sesiones
CREATE TABLE IF NOT EXISTS `user_sesiones` (
  `id` char(36) NOT NULL PRIMARY KEY,
  `user_id` char(36) NOT NULL,
  `sesion_id` char(36) NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  UNIQUE KEY `unique_user_sesion` (`user_id`, `sesion_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_sesion_id` (`sesion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Crear tabla de espacios si no existe
CREATE TABLE IF NOT EXISTS `espacios` (
  `id` char(36) NOT NULL PRIMARY KEY,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `capacidad_maxima` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
