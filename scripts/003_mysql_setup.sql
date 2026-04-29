-- MySQL schema for UES app

create table if not exists users (
  id char(36) primary key,
  email varchar(255) not null unique,
  username varchar(100) not null unique,
  full_name varchar(255) null,
  carrera varchar(255) null,
  role enum('alumno','admin') not null default 'alumno',
  password_hash varchar(255) not null,
  created_at timestamp not null default current_timestamp
);

create table if not exists sesiones (
  id char(36) primary key,
  titulo varchar(255) not null,
  ponente varchar(255) not null,
  dia varchar(8) not null,
  hora_inicio time not null,
  hora_fin time not null,
  tipo varchar(50) not null,
  lugar varchar(255) not null,
  cupos_total int not null,
  cupos_ocupados int not null default 0,
  descripcion text null,
  created_at timestamp not null default current_timestamp
);

create table if not exists sessions (
  id char(36) primary key,
  user_id char(36) not null,
  token_hash char(64) not null unique,
  created_at timestamp not null default current_timestamp,
  expires_at datetime not null,
  index sessions_user_id_idx (user_id),
  constraint sessions_user_fk foreign key (user_id) references users(id) on delete cascade
);

create table if not exists password_resets (
  id char(36) primary key,
  user_id char(36) not null,
  token_hash char(64) not null unique,
  created_at timestamp not null default current_timestamp,
  expires_at datetime not null,
  index password_resets_user_id_idx (user_id),
  constraint password_resets_user_fk foreign key (user_id) references users(id) on delete cascade
);
