CREATE TABLE sesiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_sesion VARCHAR(255) NOT NULL,
    tipo_sesion VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    cupo_maximo INT NOT NULL,
    resumen TEXT,
    objetivos TEXT,
    aula VARCHAR(100) NOT NULL,
    fotografia_ponente VARCHAR(255),
    nombre_ponente VARCHAR(255) NOT NULL,
    titulo_ponente VARCHAR(255) NOT NULL,
    institucion_ponente VARCHAR(255),
    logo_institucion VARCHAR(255)
);