-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-05-2026 a las 01:14:26
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ues_db1`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `espacios`
--

CREATE TABLE `espacios` (
  `id` char(36) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `capacidad_maxima` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `espacios`
--

INSERT INTO `espacios` (`id`, `nombre`, `descripcion`, `capacidad_maxima`, `created_at`) VALUES
('0c43b99f-4b6c-433a-94f3-2fcf3324a2a3', 'Aula Magna', 'Para todo tipo de eventos', 100, '2026-05-11 21:43:26'),
('e57da0a0-b33b-4ca0-a242-643cdc85e8c7', 'Sala de computo', 'Para actividades de programación', 50, '2026-05-11 21:43:43'),
('dd74b6d5-a005-4add-aa3b-1369e83a37a7', 'Salon 1', 'Para pequeñas actividades', 50, '2026-05-11 21:43:55'),
('2c0fb132-29c1-4444-abdc-6058f6238ed8', 'Salon 2', 'Para actividades pequeñas', 50, '2026-05-11 21:44:09'),
('0046fd21-898d-45dd-9ad4-89d09c891228', 'Aula 3', 'Actividades pequeñas', 20, '2026-05-11 22:17:48');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_resets`
--

CREATE TABLE `password_resets` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `token_hash`, `created_at`, `expires_at`) VALUES
('e4e93eca-e69d-4927-8c29-488da82c40e5', '34b6c6fe-46f0-45c8-a888-c28dce80c0f5', 'ae88faa1667224b7f131f92d5197a72c710b2321ba35c8a817c5669fb0008103', '2026-05-11 23:22:46', '2026-05-11 18:22:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones`
--

CREATE TABLE `sesiones` (
  `id` char(36) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `ponente` varchar(255) NOT NULL,
  `perfil_profesional` varchar(255) DEFAULT NULL,
  `afiliacion` varchar(255) DEFAULT NULL,
  `biografia` text DEFAULT NULL,
  `foto_ponente` varchar(500) DEFAULT NULL,
  `logo_institucion` varchar(500) DEFAULT NULL,
  `dia` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `tipo` enum('Conferencia','Taller','Panel','Seminario','Mesa redonda') NOT NULL DEFAULT 'Conferencia',
  `lugar` varchar(255) NOT NULL,
  `cupos_total` int(11) NOT NULL,
  `cupos_ocupados` int(11) NOT NULL DEFAULT 0,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sesiones`
--

INSERT INTO `sesiones` (`id`, `titulo`, `ponente`, `perfil_profesional`, `afiliacion`, `biografia`, `foto_ponente`, `logo_institucion`, `dia`, `hora_inicio`, `hora_fin`, `tipo`, `lugar`, `cupos_total`, `cupos_ocupados`, `descripcion`, `created_at`, `updated_at`) VALUES
('1ffc9f3e-b8bc-450f-b44c-12cd0a2c99cd', 'Flor silvestre para la preservación de especies', 'Alan Fernando Sanchez Cruz', NULL, NULL, NULL, NULL, NULL, '2026-05-11', '10:00:00', '11:00:00', 'Conferencia', 'Aula Magna', 100, 0, 'Para el progreso del bienestar', '2026-05-11 21:46:41', '2026-05-11 21:47:10'),
('3ef300a3-de25-48e7-bb49-2cfc9387e774', 'Taller basico de bash con linux desde Fedora', 'Marco Romero Guillermo', NULL, NULL, NULL, NULL, NULL, '2026-05-11', '00:00:00', '14:00:00', 'Taller', 'Sala de computo', 20, 0, 'Programacion basica con bash', '2026-05-11 22:33:42', '2026-05-11 23:34:25'),
('a8bf8179-673d-482f-a984-9f6045d002e8', 'Programación Web Moderna', 'Juan Adrián López', 'Maestro en Desarrollo Web', 'Tecnológico Nacional de México', 'Desarrollador full-stack especializado en tecnologías web modernas.', NULL, NULL, '2026-05-16', '09:00:00', '11:00:00', 'Conferencia', 'Aula Magna', 80, 0, 'Programación para todo el mundo con las últimas tecnologías web', '2026-04-29 20:39:49', '2026-04-30 18:15:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `token_hash`, `created_at`, `expires_at`) VALUES
('42372aa5-ed8c-4cb7-a6fc-813ea045557b', '5cfed381-9bf1-47ad-adfe-3eef553be573', 'e0915d193648ab29aa8482a50096fa9470f750e3aa95539c1a12f4cc7c03c617', '2026-05-18 22:59:56', '2026-06-17 16:59:56'),
('4503de40-9ad2-4609-b3fd-e0730727c5b2', '6ee409dc-4409-11f1-9cb8-202b2030804e', '67cd1f479bee0e44387a625186d1fcb5cd4b7b47f60f09653857f973f07f0f75', '2026-05-02 02:45:08', '2026-05-31 20:45:08'),
('83f67558-ce33-4b28-a38e-fee7b66c6a50', '6ee409dc-4409-11f1-9cb8-202b2030804e', 'fba6cc07058efb3908279a0748ee75d79813a50d7bcf9fef15df743e39a0a62d', '2026-05-02 03:11:12', '2026-05-31 21:11:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(100) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `carrera` varchar(255) DEFAULT NULL,
  `role` enum('alumno','admin') NOT NULL DEFAULT 'alumno',
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `email`, `username`, `full_name`, `carrera`, `role`, `password_hash`, `created_at`) VALUES
('34b6c6fe-46f0-45c8-a888-c28dce80c0f5', 'juan1320002@umb.edu.mx', 'juan.cruz720', 'Juan Cruz Sanzhez', 'Ingeniería en Innovación Agrícola Sustentable', 'alumno', '$2a$10$8GDNzgVIyVJ4w5SzI0pTTuMIUub1KlZERzpCSlhPT0PJ4so5SnlbC', '2026-05-11 23:22:20'),
('37de3dea-c190-4d82-9b34-67faf59051e5', 'santiago@umb.edu.mx', 'santiago.cruz452', 'Santiago Cruz', 'Ingeniería en Innovación Agrícola Sustentable', 'alumno', '$2a$10$/JjWmAzzIwvysZQDr5VRrenzfiJHJLBWjvwKGS1./a4ipA7ao/cUm', '2026-04-29 22:56:29'),
('5cfed381-9bf1-47ad-adfe-3eef553be573', 'karensofiaherrera205@gmail.com', 'karen.sofia645', 'Karen Sofia Herrera Mendoza', 'Ingeniería en Sistemas Computacionales', 'alumno', '$2a$10$s26FTeRurCWtulPTpEgSGer.2fxKAQVsxFRCOfylG7Aw4ThDkbWV.', '2026-05-18 22:59:40'),
('6e9ea990-ba35-4d6a-b9ff-d2bef7b89c32', 'jesus13210015@umb.edu.mx', 'jesus.cruz659', 'Jesus Cruz Martinez', 'Ingeniería en Sistemas Computacionales', 'alumno', '$2a$10$tvlMfagbmfcniCoBOCJ9huq5jHHavaeeB1xzBXaY4tiOvg1CZ6Xd2', '2026-05-11 23:26:55'),
('6ee409dc-4409-11f1-9cb8-202b2030804e', 'admin.ues', 'admin.ues', 'Administrador UES', NULL, 'admin', '$2a$10$3g1rvLaoYvWKSp.VH1nEjuRDp5Fza0wdiSLzoNrnDrOpEverWvwTS', '2026-04-29 20:24:33'),
('777b5521-5597-4cd7-92f0-954b378e3adc', 'mauricionolazco@umb.edu.mx', 'mauricio.nolazco155', 'Mauricio Nolazco Lonjino', 'Ingeniería en Sistemas Computacionales', 'alumno', '$2a$10$u/xccCaPtT.laFfIEsnun.dPhSw8bGsyXMKXz0WvjYxCfWLMja1Gq', '2026-04-29 20:17:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_sesiones`
--

CREATE TABLE `user_sesiones` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `sesion_id` char(36) NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones_enviadas`
--

CREATE TABLE `notificaciones_enviadas` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `sesion_id` char(36) NOT NULL,
  `tipo` enum('dia_antes','minutos_antes') NOT NULL,
  `enviado_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `password_resets_user_id_idx` (`user_id`);

--
-- Indices de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sesiones_dia` (`dia`),
  ADD KEY `idx_sesiones_lugar` (`lugar`),
  ADD KEY `idx_sesiones_hora` (`dia`,`hora_inicio`,`hora_fin`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `sessions_user_id_idx` (`user_id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indices de la tabla `user_sesiones`
--
ALTER TABLE `user_sesiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_sesiones_user_id_idx` (`user_id`),
  ADD KEY `user_sesiones_sesion_id_idx` (`sesion_id`);

--
-- Indices de la tabla `notificaciones_enviadas`
--
ALTER TABLE `notificaciones_enviadas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notificaciones_user_sesion` (`user_id`, `sesion_id`, `tipo`),
  ADD KEY `notificaciones_sesion_id_idx` (`sesion_id`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_sesiones`
--
ALTER TABLE `user_sesiones`
  ADD CONSTRAINT `user_sesiones_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_sesiones_sesion_fk` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notificaciones_enviadas`
--
ALTER TABLE `notificaciones_enviadas`
  ADD CONSTRAINT `notificaciones_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notificaciones_sesion_fk` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
