// TypeScript interfaces based on 003_mysql_setup.sql schema

export interface Sesion {
  id: string
  titulo: string
  ponente: string
  dia: string
  hora_inicio: string
  hora_fin: string
  tipo: string
  lugar: string
  cupos_total: number
  cupos_ocupados: number
  descripcion: string | null
  foto_ponente: string | null
  created_at: string
}

export interface Usuario {
  id: string
  email: string
  username: string
  full_name: string | null
  carrera: string | null
  role: "alumno" | "admin"
  created_at: string
}

export interface Espacio {
  id: string
  nombre: string
  descripcion: string | null
  capacidad_maxima: number
  created_at: string
}

export interface SesionFormData {
  titulo: string
  ponente: string
  dia: string
  hora_inicio: string
  hora_fin: string
  tipo: string
  lugar: string
  cupos_total: number
  descripcion: string
  foto_ponente?: string | null
}
