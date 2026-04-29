"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutGrid, CalendarDays, Users, MapPin, Settings, Sun, Bell, Search,
  LogOut, Pencil, Trash2, X, Clock, Filter
} from "lucide-react"

type View = "panel" | "sesiones" | "ponentes" | "configuracion"

type SessionRow = {
  titulo: string
  fecha: string
  hora: string
  escenario: string
  conferencista: string
}

const SESSION_TABLE: SessionRow[] = [
  { titulo: "Documental Batsi", fecha: "1 Dic", hora: "10:10", escenario: "Aula Magna", conferencista: "Dra. Aracely Rojas" },
  { titulo: "Declamación Vals sin fin", fecha: "1 Dic", hora: "12:00", escenario: "Explanada", conferencista: "Liliana Sánchez" },
  { titulo: "Abejas y Maíz", fecha: "2 Dic", hora: "10:00", escenario: "Aula Magna", conferencista: "Ing. Víctor Zúñiga" },
  { titulo: "Mosca Soldado", fecha: "2 Dic", hora: "11:00", escenario: "Aula Magna", conferencista: "Brisanda Solorzano" },
  { titulo: "Taller Manualidades", fecha: "3 Dic", hora: "12:00", escenario: "Explanada", conferencista: "Mtra. Jazmín Martínez" },
]

const CONFERENCISTAS = [
  { nombre: "Dra. Aracely Rojas López", grado: "Ph.D. en Bioética", area: "Universidad Intercultural del Estado de México" },
  { nombre: "Dra. Adriana Tapia Hernández", grado: "Investigadora Senior", area: "" },
  { nombre: "I.C. Víctor Manuel Zúñiga Aguilar", grado: "Ingeniero en Computación", area: "" },
  { nombre: "Dra. Brisanda Yaret Solorzano Tello", grado: "Especialista en Neuropsicología", area: "" },
  { nombre: "Dr. Fernando Soler", grado: "Catedrático de Humanidades", area: "" },
  { nombre: "Ph.D. María Velázquez", grado: "Directora de Posgrados", area: "" },
]

const PROXIMAS = [
  { hora: "09:00", titulo: "Documental Batsi: Memoria y Territorio", ponente: "Dra. Carmen J. Sánchez", tipo: "Conferencia", asistentes: "2,730 registrados" },
  { hora: "11:30", titulo: "Declamación y Lírica Contemporánea", ponente: "Mtra. Rocío de la Riva", tipo: "Taller", asistentes: "4,580 registrados" },
  { hora: "02:00", titulo: "Inteligencia Artificial en la Academia", ponente: "Ing. Sofía Mendoza", tipo: "Conferencia", asistentes: "3,210 registrados" },
]

const OCUPACION = [
  { label: "Aula Magna", value: 80, color: "#0F6B44" },
  { label: "Explanada Institucional", value: 45, color: "#C78B2A" },
  { label: "Explanada Municipal", value: 30, color: "#0F6B44" },
]

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<View>("panel")
  const [logoutVariant, setLogoutVariant] = useState<"admin" | "usuario" | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showSaveAlert, setShowSaveAlert] = useState(false)

  useEffect(() => {
    async function init() {
      const response = await fetch("/api/auth/me")
      if (!response.ok) {
        router.push("/auth/login")
        return
      }

      const payload = await response.json().catch(() => null)
      if (!payload?.user || payload.user.role !== "admin") {
        router.push("/")
        return
      }

      setLoading(false)
    }

    init()
  }, [])

  const searchPlaceholder = useMemo(() => {
    if (active === "sesiones") return "Buscar sesión..."
    if (active === "ponentes") return "Buscar ponente..."
    return "Buscar en el panel..."
  }, [active])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FBF8FF" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0F6B44", borderTopColor: "transparent" }} />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FBF8FF]">
      <div className="flex min-h-screen">
        <aside className="w-[240px] bg-white border-r border-gray-100 flex flex-col justify-between">
          <div className="px-6 pt-6">
            <div className="text-xs font-bold uppercase text-black leading-tight">
              UES SAN JOSÉ DEL
              <br />
              RINCÓN
            </div>
            <nav className="mt-6 flex flex-col gap-2 text-sm">
              <button
                onClick={() => setActive("panel")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "panel" ? "bg-[#EAFBE2] text-[#0F6B44]" : "text-gray-500 hover:text-[#0F6B44]"}`}
              >
                <LayoutGrid size={14} />
                Panel de Control
              </button>
              <button
                onClick={() => setActive("sesiones")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "sesiones" ? "bg-[#EAFBE2] text-[#0F6B44]" : "text-gray-500 hover:text-[#0F6B44]"}`}
              >
                <CalendarDays size={14} />
                Sesiones
              </button>
              <button
                onClick={() => setActive("ponentes")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "ponentes" ? "bg-[#EAFBE2] text-[#0F6B44]" : "text-gray-500 hover:text-[#0F6B44]"}`}
              >
                <Users size={14} />
                Ponentes
              </button>
              <button
                onClick={() => setActive("sesiones")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-[#0F6B44]"
              >
                <MapPin size={14} />
                Espacios
              </button>
            </nav>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={() => setShowEdit(true)}
              className="w-full bg-[#53F000] text-black text-xs font-semibold py-2 rounded-md mb-4"
            >
              Nueva Sesión
            </button>
            <button
              onClick={() => setActive("configuracion")}
              className="flex items-center gap-2 text-xs text-gray-500 mb-2"
            >
              <Settings size={12} />
              Ajustes
            </button>
            <button
              onClick={(event) => setLogoutVariant(event.altKey ? "usuario" : "admin")}
              className="flex items-center gap-2 text-xs text-red-600"
            >
              <LogOut size={12} />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <section className="flex-1">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 text-xs text-gray-400 w-[280px]">
              <Search size={14} />
              <input
                placeholder={searchPlaceholder}
                className="w-full bg-transparent outline-none text-xs text-gray-500"
              />
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Sun size={16} />
              <Bell size={16} />
              <img
                src="/images/Umb_logo.png"
                alt="UMB"
                className="h-5 w-auto"
              />
            </div>
          </div>

          {active === "panel" && (
            <div className="px-8 pb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-semibold text-[#0F6B44] uppercase">12va Jornada Académica</div>
                  <h1 className="text-2xl font-bold text-[#1A1B22]">Panel de Control</h1>
                </div>
                <div className="bg-[#F8EBD0] text-[#735B24] text-[11px] px-3 py-1 rounded-full">
                  Hoy: Lunes 1 de Diciembre, 2025
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-2xl font-bold text-[#1A1B22]">24</p>
                  <p className="text-xs text-gray-400 font-semibold">Total sesiones</p>
                  <p className="text-[10px] text-[#0F6B44] mt-1">+12% vs 2024</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-2xl font-bold text-[#1A1B22]">18</p>
                  <p className="text-xs text-gray-400 font-semibold">Conferencistas</p>
                  <p className="text-[10px] text-[#0F6B44] mt-1">100% Confirmados</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-2xl font-bold text-[#1A1B22]">80</p>
                  <p className="text-xs text-gray-400 font-semibold">Estudiantes registrados</p>
                  <p className="text-[10px] text-[#0F6B44] mt-1">+15 nuevos hoy</p>
                </div>
              </div>

              <div className="grid grid-cols-[1.6fr_1fr] gap-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-[#1A1B22]">
                      Próximas Sesiones del Día / <span className="text-gray-400">Lunes 1 Dic</span>
                    </div>
                    <button className="text-xs text-[#0F6B44] font-semibold">Ver agenda completa</button>
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {PROXIMAS.map((s, index) => (
                      <div key={s.titulo} className={`flex items-center gap-4 px-5 py-4 ${index !== PROXIMAS.length - 1 ? "border-b border-gray-100" : ""}`}>
                        <div className="flex flex-col items-center w-12">
                          <span className="text-xs text-gray-400">{s.hora}</span>
                          <Clock size={12} className="text-gray-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#1A1B22]">{s.titulo}</p>
                          <p className="text-[11px] text-gray-400">Ponente: {s.ponente}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${s.tipo === "Conferencia" ? "bg-[#EAFBE2] text-[#0F6B44]" : "bg-[#F8EBD0] text-[#735B24]"}`}>
                            {s.tipo}
                          </span>
                          <p className="text-[10px] text-gray-400 mt-1">{s.asistentes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="text-sm font-semibold text-[#1A1B22] mb-4">Ocupación por Escenario</div>
                    {OCUPACION.map((o) => (
                      <div key={o.label} className="mb-4 last:mb-0">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                          <span>{o.label}</span>
                          <span>{o.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#EDF0F3] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${o.value}%`, backgroundColor: o.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-[#E0D6C8] p-4">
                    <p className="text-xs font-semibold text-[#1A1B22]">Recomendación</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      El Aula Magna está por alcanzar su capacidad máxima. Considere los eventos con menor demanda para
                      distribuir el flujo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-md">Descargar PDF</button>
              </div>
            </div>
          )}

          {active === "sesiones" && (
            <div className="px-8 pb-10">
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-bold text-[#1A1B22]">Administración de Sesiones</h1>
                <button
                  onClick={() => setShowEdit(true)}
                  className="bg-[#53F000] text-black text-xs font-semibold px-3 py-2 rounded-md"
                >
                  Nueva Sesión
                </button>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr_1.1fr] gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 font-semibold">Total Sesiones</p>
                  <p className="text-xl font-bold text-[#1A1B22]">24</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 font-semibold">Escenarios</p>
                  <p className="text-xl font-bold text-[#1A1B22]">04</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 font-semibold">Ponentes</p>
                  <p className="text-xl font-bold text-[#1A1B22]">18</p>
                </div>
                <div className="bg-[#FFF7E5] rounded-2xl border border-[#F3D9A4] p-4">
                  <p className="text-[10px] text-[#735B24] font-semibold">Próxima Sesión</p>
                  <p className="text-xs font-semibold text-[#1A1B22]">En 15 min</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#F6F6F9] text-gray-400">
                    <tr>
                      <th className="text-left px-5 py-3 font-semibold">Nombre de Sesión</th>
                      <th className="text-left px-5 py-3 font-semibold">Fecha</th>
                      <th className="text-left px-5 py-3 font-semibold">Hora</th>
                      <th className="text-left px-5 py-3 font-semibold">Escenario</th>
                      <th className="text-left px-5 py-3 font-semibold">Conferencista</th>
                      <th className="text-right px-5 py-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-600">
                    {SESSION_TABLE.map((row) => (
                      <tr key={row.titulo} className="border-b border-gray-50">
                        <td className="px-5 py-3 font-semibold text-[#1A1B22]">{row.titulo}</td>
                        <td className="px-5 py-3">{row.fecha}</td>
                        <td className="px-5 py-3">{row.hora}</td>
                        <td className="px-5 py-3">
                          <span className="bg-[#EEF2F7] text-[#475569] px-2 py-1 rounded-full text-[10px]">
                            {row.escenario}
                          </span>
                        </td>
                        <td className="px-5 py-3">{row.conferencista}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setShowEdit(true)} className="text-gray-400 hover:text-[#0F6B44]">
                              <Pencil size={14} />
                            </button>
                            <button className="text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex items-center justify-between px-5 py-3 text-[10px] text-gray-400">
                  <span>Mostrando 5 de 24 sesiones académicas</span>
                  <div className="flex items-center gap-2">
                    <button>Anterior</button>
                    <span className="bg-[#53F000] text-black px-2 py-0.5 rounded">1</span>
                    <span>2</span>
                    <span>3</span>
                    <button className="text-[#1A1B22] font-semibold">Siguiente</button>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-[#1A1B22] mb-3">Ocupación de Escenarios</p>
                {OCUPACION.slice(0, 2).map((o) => (
                  <div key={o.label} className="mb-4 last:mb-0">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                      <span>{o.label.toUpperCase()}</span>
                      <span>{o.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EDF0F3] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${o.value}%`, backgroundColor: o.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "ponentes" && (
            <div className="px-8 pb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">DIRECTORIO ACADÉMICO</p>
                  <h1 className="text-xl font-bold text-[#1A1B22]">Gestión de Conferencistas</h1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-3 py-2 text-xs text-gray-400">
                    <Search size={12} />
                    <input placeholder="Buscar ponente..." className="bg-transparent outline-none text-xs text-gray-500" />
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                    <Filter size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                {CONFERENCISTAS.map((c) => (
                  <div key={c.nombre} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-[#0F6B44] mx-auto mb-3 flex items-center justify-center text-xs font-semibold text-[#0F6B44]">
                      {c.nombre.split(" ").slice(0, 2).map(p => p[0]).join("")}
                    </div>
                    <p className="text-xs font-semibold text-[#1A1B22]">{c.nombre}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{c.grado}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{c.area}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-md">ver todos los conferencistas</button>
              </div>
            </div>
          )}

          {active === "configuracion" && (
            <div className="px-8 pb-10">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-[#0F6B44]">Configuración del Sistema</h1>
                <p className="text-xs text-gray-400">Administra los parámetros globales y tu perfil de identidad institucional.</p>
              </div>

              <div className="grid grid-cols-[1.4fr_1fr] gap-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1B22] mb-4">
                    <span className="bg-[#F8EBD0] text-[#735B24] px-2 py-1 rounded">Perfil del Administrador</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <div className="bg-[#F8F9FB] rounded-xl border border-gray-100 flex items-center justify-center h-24">
                      <img src="/images/Umb_logo.png" alt="UMB" className="h-10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold">NOMBRE COMPLETO</p>
                        <p className="text-xs font-semibold">Lic. F. Luis Ramón Vega Ramírez</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold">CORREO INSTITUCIONAL</p>
                        <p className="text-xs font-semibold">luisramonvega@umb.edu.mx</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 font-semibold">CARGO</p>
                        <div className="bg-[#F8F9FB] border border-gray-100 rounded-md px-3 py-2 text-xs font-semibold">
                          Coordinador General de Jornadas Académicas
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button className="bg-[#0F6B44] text-white text-xs font-semibold px-4 py-2 rounded-md">Guardar Cambios</button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold text-[#1A1B22] mb-4">Seguridad</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">CONTRASEÑA ACTUAL</p>
                      <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs" placeholder="••••••" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">NUEVA CONTRASEÑA</p>
                      <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs" placeholder="Nueva" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">CONFIRMAR</p>
                      <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs" placeholder="Confirmar" />
                    </div>
                    <button className="bg-[#8C6A1B] text-white text-xs font-semibold px-4 py-2 rounded-md w-fit">Actualizar Seguridad</button>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-xs font-semibold text-[#1A1B22] mb-4">Notificaciones del Sistema</p>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 border border-gray-100 rounded-xl p-3 text-xs">
                    <input type="checkbox" defaultChecked className="mt-1" />
                    <div>
                      <p className="font-semibold">Nuevos Registros</p>
                      <p className="text-[10px] text-gray-400">Notificar cuando un estudiante o docente se inscriba.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 border border-gray-100 rounded-xl p-3 text-xs">
                    <input type="checkbox" defaultChecked className="mt-1" />
                    <div>
                      <p className="font-semibold">Conflictos de Horario</p>
                      <p className="text-[10px] text-gray-400">Alertas inmediatas sobre traslape de eventos.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 border border-gray-100 rounded-xl p-3 text-xs">
                    <input type="checkbox" className="mt-1" />
                    <div>
                      <p className="font-semibold">Reportes Diarios</p>
                      <p className="text-[10px] text-gray-400">Resumen ejecutivo enviado por correo cada mañana.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-40 bg-black/20">
          <div className="absolute inset-y-0 right-0 w-[420px] bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">PANEL ADMINISTRATIVO</p>
                <h2 className="text-base font-bold text-[#1A1B22]">Editar Sesión Académica</h2>
                <p className="text-xs text-gray-400">Asegúrese de verificar la disponibilidad de espacios.</p>
              </div>
              <button onClick={() => setShowEdit(false)} className="text-gray-400">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">NOMBRE DE LA SESIÓN</p>
                <input className="w-full bg-[#F6F2FF] border border-gray-200 rounded-md px-3 py-2" defaultValue="Documental Batsi" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">TIPO DE SESIÓN</p>
                  <select className="w-full border border-gray-200 rounded-md px-3 py-2">
                    <option>Conferencia Magistral</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">CUPO MÁXIMO</p>
                  <input className="w-full border border-gray-200 rounded-md px-3 py-2" defaultValue="80" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">FECHA DEL EVENTO</p>
                <input className="w-full border border-gray-200 rounded-md px-3 py-2" defaultValue="10/24/2025" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">HORA INICIO</p>
                  <input className="w-full border border-gray-200 rounded-md px-3 py-2" defaultValue="10:00 AM" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">HORA FIN</p>
                  <input className="w-full border border-gray-200 rounded-md px-3 py-2" defaultValue="11:30 AM" />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">ESCENARIO</p>
                <select className="w-full border border-red-400 rounded-md px-3 py-2 text-red-600">
                  <option>Aula Magna</option>
                </select>
                <div className="mt-2 bg-[#FFEAEA] border border-red-300 text-red-600 text-[10px] rounded-md px-3 py-2">
                  Conflicto detectado: El Aula Magna ya está ocupada de 10:00 a 11:00 hrs. Seleccione otro horario o escenario.
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">CONFERENCISTA ASIGNADO</p>
                <select className="w-full border border-gray-200 rounded-md px-3 py-2">
                  <option>Dr. Alejandro Vázquez</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">DESCRIPCIÓN DE LA SESIÓN (OPCIONAL)</p>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-md px-3 py-2"
                  defaultValue="Exploración de las aplicaciones prácticas de modelos de lenguaje extensos en la tutoría académica y el desarrollo de currículos de nivel maestría y doctorado en la Universidad Manuel de María." />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowSaveAlert(true)} className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-md">Guardar Cambios</button>
                <button onClick={() => setShowEdit(false)} className="text-xs font-semibold text-gray-400">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSaveAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white rounded-xl shadow-xl w-[360px] px-5 py-4 text-xs">
            <h3 className="text-sm font-bold text-[#1A1B22]">¿Guardar cambios?</h3>
            <p className="text-[11px] text-gray-500 mt-1">¿Estás seguro de que deseas aplicar las modificaciones a esta sesión?</p>
            <div className="flex items-center gap-2 mt-4">
              <button className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-md">Guardar Cambios</button>
              <button onClick={() => setShowSaveAlert(false)} className="border border-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded-md">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {logoutVariant === "admin" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "#3B3B3B" }}>
          <div className="bg-white rounded-xl shadow-xl w-[320px] px-6 py-5 text-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <LogOut size={14} />
              <p className="text-sm font-bold text-[#1A1B22]">¿Cerrar Sesión?</p>
            </div>
            <p className="text-[11px] text-gray-500">¿Estás seguro de que deseas salir?</p>
            <div className="flex flex-col gap-2 mt-4">
              <button className="bg-[#C40000] text-white text-xs font-semibold py-2 rounded-md">CERRAR SESIÓN</button>
              <button onClick={() => setLogoutVariant(null)} className="border border-gray-200 text-gray-500 text-xs font-semibold py-2 rounded-md">CANCELAR</button>
            </div>
          </div>
        </div>
      )}

      {logoutVariant === "usuario" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-[320px] px-6 py-5 text-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <LogOut size={14} />
              <p className="text-sm font-bold text-[#1A1B22]">¿Cerrar Sesión?</p>
            </div>
            <p className="text-[11px] text-gray-500">¿Estás seguro de que deseas salir del sistema de gestión de eventos?</p>
            <div className="flex flex-col gap-2 mt-4">
              <button className="bg-[#C40000] text-white text-xs font-semibold py-2 rounded-md">CERRAR SESIÓN</button>
              <button onClick={() => setLogoutVariant(null)} className="border border-gray-200 text-gray-500 text-xs font-semibold py-2 rounded-md">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
