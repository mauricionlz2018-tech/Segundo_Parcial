-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-05-2026 a las 05:12:47
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
-- Estructura de tabla para la tabla `password_resets`
--

CREATE TABLE `password_resets` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
('69b631a0-8f28-40e8-a2b8-5f178a580cfd', 'Programación Avanzada', 'Juan Pérez', 'Doctor en Ciencias Computacionales', 'Universidad Autónoma Metropolitana', 'Investigador en el área de inteligencia artificial con más de 15 años de experiencia.', NULL, NULL, '2026-05-15', '08:00:00', '10:00:00', 'Conferencia', 'Aula Magna', 50, 0, 'Conferencia sobre programación avanzada y nuevas tecnologías', '2026-04-29 22:58:31', '2026-04-30 18:15:00'),
('a8bf8179-673d-482f-a984-9f6045d002e8', 'Programación Web Moderna', 'Juan Adrián López', 'Maestro en Desarrollo Web', 'Tecnológico Nacional de México', 'Desarrollador full-stack especializado en tecnologías web modernas.', NULL, NULL, '2026-05-16', '09:00:00', '11:00:00', 'Conferencia', 'Aula Magna', 80, 0, 'Programación para todo el mundo con las últimas tecnologías web', '2026-04-29 20:39:49', '2026-04-30 18:15:00'),
('d32d840b-876c-4396-b35a-1efb49b9393d', 'La Vida en el Aire', 'Jesús Pérez', 'Biólogo Investigador', 'CONABIO', 'Especialista en biodiversidad aérea y conservación de ecosistemas.', NULL, NULL, '2026-05-18', '09:20:00', '10:30:00', 'Conferencia', 'Auditorio Principal', 20, 0, 'Exploración de la biodiversidad en los ecosistemas aéreos', '2026-04-29 22:19:51', '2026-04-30 18:15:00'),
('e77d9e27-f693-4762-ae1c-516a2b01460e', 'Inglés Básico', 'Iván Martínez', 'Licenciado en Enseñanza del Inglés', 'Harmon Hall', 'Profesor certificado con 10 años de experiencia en enseñanza del inglés.', NULL, NULL, '2026-05-20', '10:00:00', '12:00:00', 'Taller', 'Sala 3', 80, 0, 'Taller de inglés básico para principiantes', '2026-04-30 17:58:13', '2026-04-30 18:15:00');

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
('37de3dea-c190-4d82-9b34-67faf59051e5', 'santiago@umb.edu.mx', 'santiago.cruz452', 'Santiago Cruz', 'Ingeniería en Innovación Agrícola Sustentable', 'alumno', '$2a$10$/JjWmAzzIwvysZQDr5VRrenzfiJHJLBWjvwKGS1./a4ipA7ao/cUm', '2026-04-29 22:56:29'),
('6ee409dc-4409-11f1-9cb8-202b2030804e', 'admin.ues', 'admin.ues', 'Administrador UES', NULL, 'admin', '$2a$10$3g1rvLaoYvWKSp.VH1nEjuRDp5Fza0wdiSLzoNrnDrOpEverWvwTS', '2026-04-29 20:24:33'),
('777b5521-5597-4cd7-92f0-954b378e3adc', 'mauricionolazco@umb.edu.mx', 'mauricio.nolazco155', 'Mauricio Nolazco Lonjino', 'Ingeniería en Sistemas Computacionales', 'alumno', '$2a$10$u/xccCaPtT.laFfIEsnun.dPhSw8bGsyXMKXz0WvjYxCfWLMja1Gq', '2026-04-29 20:17:40');

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
