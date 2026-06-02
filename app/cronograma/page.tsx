"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { BookOpen } from "lucide-react"
import { formatTime12Hour, formatDate } from "@/lib/utils"

type Sesion = {
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
  created_at: string
}

const tipoBadge: Record<string, { bg: string; text: string }> = {
  Conferencia: { bg: "#064E3B", text: "#ffffff" },
  Cultural: { bg: "#FDDC98", text: "#735B24" },
  Taller: { bg: "#1A1B22", text: "#ffffff" },
  Inauguración: { bg: "#3F4942", text: "#ffffff" },
  Cierre: { bg: "#785F28", text: "#ffffff" },
}

const diasSemana: Record<string, string> = {
  "1": "Lunes",
  "2": "Martes",
  "3": "Miércoles",
  "4": "Jueves",
  "5": "Viernes",
  "Lunes": "Lunes",
  "Martes": "Martes",
  "Miércoles": "Miércoles",
  "Jueves": "Jueves",
  "Viernes": "Viernes",
}

function getNombreDia(dia: string): string {
  // Si es un número (1-5), usar el mapeo directo
  if (diasSemana[dia]) {
    return diasSemana[dia]
  }
  
  // Si es una fecha ISO, extraer el día de la semana
  try {
    const date = new Date(dia)
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const dayName = days[date.getUTCDay()]
    const dayNum = date.getUTCDate()
    return `${dayName} ${dayNum}`
  } catch {
    return dia
  }
}

export default function CronogramaPage() {
  const [sesiones, setSesiones] = useState<Record<string, Sesion[]>>({})
  const [diaActivo, setDiaActivo] = useState<string>("todos")
  const [sesionesInscritas, setSesionesInscritas] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [inscribiendo, setInscribiendo] = useState<string | null>(null)

  // Obtener usuario actual
  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.user && data.user.id) {
          setUserId(data.user.id)
        }
      } catch (err) {
        console.error("Error obteniendo usuario:", err)
      }
    }
    getUser()
  }, [])

  async function downloadPDF() {
    try {
      const response = await fetch("/api/sesiones/pdf")
      if (!response.ok) throw new Error("Error al descargar PDF")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "cronograma-jornada-2025.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  useEffect(() => {
    async function loadSesiones() {
      try {
        const res = await fetch("/api/sesiones/grouped")
        if (!res.ok) throw new Error("Error al cargar sesiones")
        const data = await res.json()
        setSesiones(data.data || {})
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }
    loadSesiones()
  }, [])

  // Cargar sesiones inscritas del usuario desde BD
  useEffect(() => {
    if (!userId) return

    async function loadSesionesInscritas() {
      try {
        const res = await fetch(`/api/usuarios/mis-sesiones?userId=${userId}`)
        const data = await res.json()
        const inscritasIds = new Set<string>(
          (data.data || []).map((s: Sesion) => s.id)
        )
        setSesionesInscritas(inscritasIds)
      } catch (error) {
        console.error("Error cargando sesiones inscritas:", error)
      }
    }

    loadSesionesInscritas()
  }, [userId])

  async function toggleAgenda(sesionId: string, sesionTitulo: string) {
    if (!userId) {
      alert("Debes iniciar sesión para agendar sesiones")
      return
    }

    setInscribiendo(sesionId)
    try {
      if (sesionesInscritas.has(sesionId)) {
        // Desinscribir
        const res = await fetch(`/api/sesiones/${sesionId}/inscribir?userId=${userId}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setSesionesInscritas(prev => {
            const next = new Set(prev)
            next.delete(sesionId)
            return next
          })
        } else {
          alert("Error al desinscribirse")
        }
      } else {
        // Inscribir
        const res = await fetch(`/api/sesiones/${sesionId}/inscribir`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
        if (res.ok) {
          setSesionesInscritas(prev => new Set([...prev, sesionId]))
        } else {
          const error = await res.json()
          alert(`Error: ${error.error}`)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar agenda")
    } finally {
      setInscribiendo(null)
    }
  }

  const dias = Object.keys(sesiones).sort()
  const eventosFiltrados =
    diaActivo === "todos"
      ? Object.values(sesiones).flat()
      : sesiones[diaActivo] || []

  const col1 = eventosFiltrados.filter((_, i) => i % 2 === 0)
  const col2 = eventosFiltrados.filter((_, i) => i % 2 === 1)

  const totalSesiones = Object.values(sesiones).flat().length
  const totalPonentes = new Set(
    Object.values(sesiones)
      .flat()
      .map((s) => s.ponente)
  ).size

  if (loading) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#FBF8FF" }}>
        <Navbar />
        <div className="pt-20 flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0F6B44", borderTopColor: "transparent" }} />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="pt-14">
        {/* Top two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Left: hero panel */}
          <div
            className="lg:col-span-2 px-8 py-10 flex flex-col justify-between min-h-[240px]"
            style={{ background: "linear-gradient(135deg, #64FC05 0%, #6CEA1D 100%)" }}
          >
            <div>
              <p className="text-xs font-semibold tracking-widest text-white/70 uppercase mb-2">
                Bienvenido al evento
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                12va Jornada<br />Académica y<br />Cultural
              </h1>
              <p className="text-black/150 text-sm leading-relaxed max-w-sm">
                Explora la frontera del conocimiento. Gestiona tu asistencia a las sesiones más innovadoras de la Universidad Mexiquense del Bicentenario.
              </p>
            </div>
            <div className="mt-6">
              <button
                onClick={downloadPDF}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white border border-white/40 hover:bg-white/10 transition"
                style={{ backgroundColor: "#006341" }}
              >
                Descargar Programa PDF
              </button>
            </div>
          </div>

          {/* Right: Mi Agenda */}
          <div className="bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-gray-800 px-6 py-8 flex flex-col gap-6">
            <h2 className="text-sm font-bold text-[#1A1B22] dark:text-white">Mi Agenda Personal</h2>

            {!userId || sesionesInscritas.size === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-6">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                  <BookOpen size={16} className="text-gray-300 dark:text-gray-700" />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed max-w-[160px]">
                  {!userId ? "Inicia sesión para agregar tus sesiones preferidas." : "Aún no has agendado sesiones."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                {Object.values(sesiones)
                  .flat()
                  .filter((s) => sesionesInscritas.has(s.id))
                  .map((sesion) => (
                    <div key={sesion.id} className="text-xs text-[#065F46] dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded-lg px-3 py-2 font-medium">
                      {sesion.titulo}
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-auto">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-wider font-semibold">Sesiones Registradas</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-600">{sesionesInscritas.size}/{totalSesiones}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${totalSesiones > 0 ? (sesionesInscritas.size / totalSesiones) * 100 : 0}%`,
                    backgroundColor: "#64FC05",
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-[#735B24] dark:text-yellow-500">{totalSesiones}</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5 font-semibold">Sesiones</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#64FC05" }}>
                <p className="text-2xl font-black text-black">{totalPonentes}</p>
                <p className="text-[10px] text-black/60 uppercase tracking-wider mt-0.5 font-semibold">Ponentes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions section */}
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
          {/* Title + filter */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-[#1A1B22] dark:text-white">Agenda de Sesiones</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setDiaActivo("todos")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  diaActivo === "todos"
                    ? "text-white"
                    : "text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800"
                }`}
                style={{
                  backgroundColor: diaActivo === "todos" ? "#064E3B" : undefined,
                }}
              >
                Todos
              </button>
              {dias.map((dia) => (
                <button
                  key={dia}
                  onClick={() => setDiaActivo(dia)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    diaActivo === dia
                      ? "text-white"
                      : "text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-800"
                  }`}
                  style={{
                    backgroundColor: diaActivo === dia ? "#064E3B" : undefined,
                  }}
                >
                  {getNombreDia(dia)}
                </button>
              ))}
            </div>
          </div>

          {/* Eventos en dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Columna 1 */}
            <div className="flex flex-col gap-4">
              {col1.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(evento.dia)}</p>
                      <h3 className="text-sm font-bold text-[#1A1B22] dark:text-white leading-snug">
                        {evento.titulo}
                      </h3>
                    </div>
                    <div
                      className="px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: tipoBadge[evento.tipo]?.bg || "#1A1B22",
                        color: tipoBadge[evento.tipo]?.text || "#fff",
                      }}
                    >
                      {evento.tipo}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold"></span> {formatTime12Hour(evento.hora_inicio)} - {formatTime12Hour(evento.hora_fin)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold"></span> {evento.ponente}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold"></span> {evento.lugar}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {evento.cupos_ocupados} / {evento.cupos_total} cupos
                    </div>
                    <button
                      onClick={() => toggleAgenda(evento.id, evento.titulo)}
                      disabled={inscribiendo === evento.id}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                        sesionesInscritas.has(evento.id)
                          ? "text-white"
                          : "text-[#065F46] border border-[#065F46] hover:bg-green-50 dark:hover:bg-green-950/30"
                      }`}
                      style={{
                        backgroundColor: sesionesInscritas.has(evento.id) ? "#065F46" : undefined,
                      }}
                    >
                      {inscribiendo === evento.id ? "..." : sesionesInscritas.has(evento.id) ? "Agendado" : "+ Agendar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Columna 2 */}
            <div className="flex flex-col gap-4">
              {col2.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(evento.dia)}</p>
                      <h3 className="text-sm font-bold text-[#1A1B22] dark:text-white leading-snug">
                        {evento.titulo}
                      </h3>
                    </div>
                    <div
                      className="px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: tipoBadge[evento.tipo]?.bg || "#1A1B22",
                        color: tipoBadge[evento.tipo]?.text || "#fff",
                      }}
                    >
                      {evento.tipo}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold"></span> {formatTime12Hour(evento.hora_inicio)} - {formatTime12Hour(evento.hora_fin)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold"></span> {evento.ponente}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-semibold"></span> {evento.lugar}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {evento.cupos_ocupados} / {evento.cupos_total} cupos
                    </div>
                    <button
                      onClick={() => toggleAgenda(evento.id, evento.titulo)}
                      disabled={inscribiendo === evento.id}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                        sesionesInscritas.has(evento.id)
                          ? "text-white"
                          : "text-[#065F46] border border-[#065F46] hover:bg-green-50 dark:hover:bg-green-950/30"
                      }`}
                      style={{
                        backgroundColor: sesionesInscritas.has(evento.id) ? "#065F46" : undefined,
                      }}
                    >
                      {inscribiendo === evento.id ? "..." : sesionesInscritas.has(evento.id) ? "Agendado" : "+ Agendar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {eventosFiltrados.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No hay sesiones para este día</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
