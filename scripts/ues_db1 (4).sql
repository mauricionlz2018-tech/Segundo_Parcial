-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 10-06-2026 a las 06:16:40
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
-- Estructura de tabla para la tabla `notificaciones_enviadas`
--

CREATE TABLE `notificaciones_enviadas` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `sesion_id` char(36) NOT NULL,
  `tipo` enum('dia_antes','minutos_antes') NOT NULL,
  `enviado_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
('0b53c2a3-663b-456f-80dd-66dd5b8b1cf5', '5cfed381-9bf1-47ad-adfe-3eef553be573', '8e4a91fb6450234d17cc53d48f310784491d1618fabb559af1cfe200e9cf7332', '2026-05-22 20:10:46', '2026-05-22 15:10:46'),
('0dbce1dc-29c1-489c-b97b-56fe40f9180c', '527826fe-2ae6-44f5-b49b-fd88c2e377a6', '449b93784cc299c71dd78df6a6251708ac3191e3669bc28305f78f49cc43ea06', '2026-06-01 23:07:51', '2026-06-01 18:07:51'),
('36811de5-969f-4963-a42b-c24b2d41187d', '5cfed381-9bf1-47ad-adfe-3eef553be573', 'a5aa12fbbcf4fcf082366babd6629d39ec478635bd9317125f4ed6f8246d3e01', '2026-06-01 05:02:05', '2026-06-01 00:02:05'),
('5e9b36a9-aecd-461b-8216-aa4ae1d1e0ec', '5cfed381-9bf1-47ad-adfe-3eef553be573', 'd692014f3f7c7b468cb08d18e7a7e150b4c719965f4864684805aa288c028951', '2026-05-22 20:40:10', '2026-05-22 15:40:10'),
('62bb49a5-c9ec-4123-9362-39cae94f1396', '5cfed381-9bf1-47ad-adfe-3eef553be573', 'd669cf5a1dc64b5237a764d2aec3608686c73eda6626f096929b35743547649d', '2026-06-01 17:50:09', '2026-06-01 12:50:09'),
('6bd03b9c-5f61-404f-8292-5e4b26e764e7', '5cfed381-9bf1-47ad-adfe-3eef553be573', '8864933a6af60093299dc0c0ae348d03454bf29e3649bdbf72776a6fccb8f21c', '2026-05-22 20:07:57', '2026-05-22 15:07:57'),
('c2b2765e-9796-40f9-9029-37475d21f18f', '5cfed381-9bf1-47ad-adfe-3eef553be573', 'af6c2a7525f048ab3425646f613eae9d812da3dd5046f6469e8287b4682513b6', '2026-06-01 17:45:31', '2026-06-01 12:45:31'),
('e026d13b-ea2d-4085-8c0b-d2bcdba7991f', '5cfed381-9bf1-47ad-adfe-3eef553be573', 'fa844daa9136d3ce08377e1628295fec6485403d20b060acb05e5e2afe5ba11a', '2026-05-22 20:03:50', '2026-05-22 15:03:50'),
('e4e93eca-e69d-4927-8c29-488da82c40e5', '34b6c6fe-46f0-45c8-a888-c28dce80c0f5', 'ae88faa1667224b7f131f92d5197a72c710b2321ba35c8a817c5669fb0008103', '2026-05-11 23:22:46', '2026-05-11 18:22:46'),
('fd467746-f6e3-4483-b6cc-9a0b18b41850', '5cfed381-9bf1-47ad-adfe-3eef553be573', '3484668b75db815006d6563fb61ca04167fcb7bcef2cda867d1f0f0b3ddf1b77', '2026-06-01 18:06:45', '2026-06-01 13:06:45');

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
('1ffc9f3e-b8bc-450f-b44c-12cd0a2c99cd', 'Flor silvestre para la preservación de especies', 'Alan Fernando Sanchez Cruz', NULL, NULL, NULL, NULL, NULL, '2026-05-11', '10:00:00', '11:00:00', 'Taller', 'Aula Magna', 100, 1, 'Para el progreso del bienestar', '2026-05-11 21:46:41', '2026-06-08 17:22:18'),
('3ef300a3-de25-48e7-bb49-2cfc9387e774', 'Taller basico de bash con linux desde Fedora', 'Marco Romero Cruz', NULL, NULL, NULL, NULL, NULL, '2026-05-11', '00:00:00', '14:00:00', 'Taller', 'Sala de computo', 20, 2, 'Programacion basica con bash', '2026-05-11 22:33:42', '2026-06-08 23:29:03'),
('a8bf8179-673d-482f-a984-9f6045d002e8', 'Programación Web Moderna', 'Juan Adrián López', 'Maestro en Desarrollo Web', 'Tecnológico Nacional de México', 'Desarrollador full-stack especializado en tecnologías web modernas.', NULL, NULL, '2026-05-16', '09:00:00', '11:00:00', 'Conferencia', 'Aula Magna', 80, 1, 'Programación para todo el mundo con las últimas tecnologías web', '2026-04-29 20:39:49', '2026-06-03 16:20:00');

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
('83f67558-ce33-4b28-a38e-fee7b66c6a50', '6ee409dc-4409-11f1-9cb8-202b2030804e', 'fba6cc07058efb3908279a0748ee75d79813a50d7bcf9fef15df743e39a0a62d', '2026-05-02 03:11:12', '2026-05-31 21:11:12'),
('8d015185-d453-4e3a-b2cb-1f565b8b7bf8', '37de3dea-c190-4d82-9b34-67faf59051e5', 'f2c6fdf3fee0ffaa989ab0a70a9340f3b7349a8a00602848d686218befcd2d43', '2026-05-25 22:28:34', '2026-06-24 16:28:34'),
('bf2f6e56-bc94-4ed1-b2d9-68329dbff4ec', '6ee409dc-4409-11f1-9cb8-202b2030804e', 'd01ad10c6fe6a5362cc604b331be4f7374ba20ca580fbc250d646e31be3c9fc3', '2026-05-25 22:29:27', '2026-06-24 16:29:27'),
('c8e00cba-c157-418d-bb4a-52d0498d9325', '37de3dea-c190-4d82-9b34-67faf59051e5', '951f8c7f63925ff9f36c153d702a0291e775ad84cd7b4e787cc6abda689f5afb', '2026-05-25 22:11:30', '2026-06-24 16:11:30'),
('f4fb2dfe-25ae-4f31-ac91-50d0b489479d', '37de3dea-c190-4d82-9b34-67faf59051e5', '64909060a5efec07279300a4b2e41af8adff9c54dbc1871ed13f7f2fe5d865de', '2026-05-25 22:28:03', '2026-06-24 16:28:03'),
('fb41f760-1676-4a88-bcfb-26d8281725cb', '37de3dea-c190-4d82-9b34-67faf59051e5', '51c8cdcaaffab4146beca6f7d2cf6c87186172d6f51075cd9c8c5da9e1658382', '2026-05-25 22:29:10', '2026-06-24 16:29:10');

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
('29e868f4-b299-4fae-a281-688dc33b71f8', 'admin_2@umb.edu.mx', 'admin_2', 'Juan Eduardo Fuentes Cruz', NULL, 'admin', '$2a$10$q8v0Uyn6brqAFkI6quXbn.V8HLQe.70EdktShDO.kzAmt7gOoSX8q', '2026-06-05 22:25:45'),
('34b6c6fe-46f0-45c8-a888-c28dce80c0f5', 'juan1320002@umb.edu.mx', 'juan.cruz720', 'Juan Cruz Sanzhez', 'Ingeniería en Innovación Agrícola Sustentable', 'alumno', '$2a$10$8GDNzgVIyVJ4w5SzI0pTTuMIUub1KlZERzpCSlhPT0PJ4so5SnlbC', '2026-05-11 23:22:20'),
('37de3dea-c190-4d82-9b34-67faf59051e5', 'santiago@umb.edu.mx', 'santiago.cruz452', 'Santiago Cruz', 'Ingeniería en Innovación Agrícola Sustentable', 'alumno', '$2a$10$/JjWmAzzIwvysZQDr5VRrenzfiJHJLBWjvwKGS1./a4ipA7ao/cUm', '2026-04-29 22:56:29'),
('40bc0e67-118b-483d-af9b-b94e6aad5ff7', 'mauricionlz2018@gmail.com', 'mauricio.nolazco471', 'Mauricio Nolazco Lonjino', 'Ingeniería en Sistemas Computacionales', 'alumno', '$2a$10$Xb9JOveOi0O2D8s4wc3fv.e.0reCqhsKucZj84.okloHvUl0NmvO2', '2026-06-08 23:27:29'),
('527826fe-2ae6-44f5-b49b-fd88c2e377a6', 'genesisyz2025@gmail.com', 'alejandro.snchez797', 'Alejandro Sánchez García', 'Ingeniería en Sistemas Computacionales', 'alumno', '$2a$10$TSiJZambS3boZC1v0lXRpOQ5aOE1qjdY4kQZ0o.uwxA6Te85uscma', '2026-06-01 23:05:29'),
('5cfed381-9bf1-47ad-adfe-3eef553be573', 'karensofiaherrera205@gmail.com', 'karen.sofia645', 'Karen Sofia Herrera Mendoza', 'Ingeniería en Sistemas Computacionales', 'alumno', '$2a$10$s26FTeRurCWtulPTpEgSGer.2fxKAQVsxFRCOfylG7Aw4ThDkbWV.', '2026-05-18 22:59:40'),
('6e9ea990-ba35-4d6a-b9ff-d2bef7b89c32', 'jesus13210015@umb.edu.mx', 'jesus.cruz659', 'Jesus Cruz Martinez', 'Ingeniería en Sistemas Computacionales', 'alumno', '$2a$10$tvlMfagbmfcniCoBOCJ9huq5jHHavaeeB1xzBXaY4tiOvg1CZ6Xd2', '2026-05-11 23:26:55'),
('6ee409dc-4409-11f1-9cb8-202b2030804e', 'admin.ues', 'admin.ues', 'Administrador UES', NULL, 'admin', '$2a$10$3g1rvLaoYvWKSp.VH1nEjuRDp5Fza0wdiSLzoNrnDrOpEverWvwTS', '2026-04-29 20:24:33'),
('d4c690a1-0676-4972-ab87-afebef6bc46e', 'crissdani01@gmail.com', 'cristiana.cruz361', 'Cristiana Cruz Roman', 'Licenciatura en Contaduría', 'alumno', '$2a$10$LDmgIHfTaYBgBHfdqEiRgeiIz5JOBGlGqeCrENwPJJ/uOyaiuq0a2', '2026-05-27 20:28:56');

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

--
-- Volcado de datos para la tabla `user_sesiones`
--

INSERT INTO `user_sesiones` (`id`, `user_id`, `sesion_id`, `registered_at`) VALUES
('836d3a66-9e80-4118-9d41-3ae826f95563', '37de3dea-c190-4d82-9b34-67faf59051e5', 'a8bf8179-673d-482f-a984-9f6045d002e8', '2026-05-29 22:30:31'),
('9d93fe32-2da5-4f84-91a2-ced8771ec9cd', 'd4c690a1-0676-4972-ab87-afebef6bc46e', '1ffc9f3e-b8bc-450f-b44c-12cd0a2c99cd', '2026-06-01 22:27:47'),
('b5d87636-120c-448e-97db-142f11050d2c', '40bc0e67-118b-483d-af9b-b94e6aad5ff7', '3ef300a3-de25-48e7-bb49-2cfc9387e774', '2026-06-08 23:29:03');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `notificaciones_enviadas`
--
ALTER TABLE `notificaciones_enviadas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notificaciones_user_sesion` (`user_id`,`sesion_id`,`tipo`),
  ADD KEY `sesion_id` (`sesion_id`);

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
  ADD KEY `user_sesiones_user_fk` (`user_id`),
  ADD KEY `sesion_id` (`sesion_id`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `notificaciones_enviadas`
--
ALTER TABLE `notificaciones_enviadas`
  ADD CONSTRAINT `notificaciones_enviadas_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notificaciones_enviadas_ibfk_2` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `user_sesiones_ibfk_1` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_sesiones_sesion_fk` FOREIGN KEY (`sesion_id`) REFERENCES `sesiones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_sesiones_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
