"use client"

import { useEffect, useState, useCallback } from "react"
import { Clock, MapPin, User, CheckCircle2, Circle, Bell, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import type { Sesion } from "@/types"

export default function CronogramaInteractivo() {
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [misSesiones, setMisSesiones] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [registrando, setRegistrando] = useState<string | null>(null)

  // Cargar usuario actual
  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    }
    loadUser()
  }, [])

  // Cargar sesiones
  useEffect(() => {
    async function loadSesiones() {
      try {
        const res = await fetch("/api/sesiones")
        if (res.ok) {
          const data = await res.json()
          setSesiones(data.data || [])
        }
      } catch (error) {
        console.error("Error cargando sesiones:", error)
      } finally {
        setLoading(false)
      }
    }
    loadSesiones()
  }, [])

  // Cargar mis sesiones registradas
  useEffect(() => {
    if (!user) return

    async function loadMisSesiones() {
      try {
        const res = await fetch("/api/sesiones/registro")
        if (res.ok) {
          const data = await res.json()
          setMisSesiones((data.data || []).map((s: any) => s.id))
        }
      } catch (error) {
        console.error("Error cargando mis sesiones:", error)
      }
    }
    loadMisSesiones()
  }, [user])

  // Notificaciones para sesiones próximas
  useEffect(() => {
    if (misSesiones.length === 0) return

    const interval = setInterval(() => {
      const ahora = new Date()
      const misSesionesData = sesiones.filter((s) => misSesiones.includes(s.id))

      misSesionesData.forEach((sesion) => {
        const [año, mes, día] = sesion.dia.split("-").map(Number)
        const [hora, minuto] = sesion.hora_inicio.split(":").map(Number)

        const sesionStart = new Date(año, mes - 1, día, hora, minuto)
        const tiempoRestante = sesionStart.getTime() - ahora.getTime()
        const minutosRestantes = Math.floor(tiempoRestante / 60000)

        // Notificar 15 minutos antes
        if (minutosRestantes === 15) {
          toast.info(
            `La sesión "${sesion.titulo}" comienza en 15 minutos en ${sesion.lugar}`,
            {
              icon: <Bell className="w-5 h-5" />,
              duration: 5000,
            }
          )
        }

        // Notificar 5 minutos antes
        if (minutosRestantes === 5) {
          toast.warning(
            `¡La sesión "${sesion.titulo}" comienza en 5 minutos!`,
            {
              icon: <AlertCircle className="w-5 h-5" />,
              duration: 5000,
            }
          )
        }
      })
    }, 60000) // Revisar cada minuto

    return () => clearInterval(interval)
  }, [misSesiones, sesiones])

  const handleRegistro = useCallback(
    async (sesionId: string) => {
      if (!user) {
        toast.error("Debes iniciar sesión primero")
        return
      }

      setRegistrando(sesionId)
      try {
        const res = await fetch("/api/sesiones/registro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sesionId }),
        })

        if (res.ok) {
          setMisSesiones([...misSesiones, sesionId])
          toast.success("¡Te has registrado en la sesión!")
        } else {
          const error = await res.json()
          toast.error(error.error || "Error al registrar")
        }
      } catch (error) {
        toast.error("Error al registrar")
      } finally {
        setRegistrando(null)
      }
    },
    [user, misSesiones]
  )

  const handleDesregistro = useCallback(
    async (sesionId: string) => {
      setRegistrando(sesionId)
      try {
        const res = await fetch(`/api/sesiones/${sesionId}/registro`, {
          method: "DELETE",
        })

        if (res.ok) {
          setMisSesiones(misSesiones.filter((id) => id !== sesionId))
          toast.success("Te has desregistrado de la sesión")
        } else {
          toast.error("Error al desregistrar")
        }
      } catch (error) {
        toast.error("Error al desregistrar")
      } finally {
        setRegistrando(null)
      }
    },
    [misSesiones]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#065F46]"></div>
      </div>
    )
  }

  // Agrupar sesiones por día
  const sesionePorDia = sesiones.reduce(
    (acc, sesion) => {
      const fecha = sesion.dia
      if (!acc[fecha]) acc[fecha] = []
      acc[fecha].push(sesion)
      return acc
    },
    {} as Record<string, Sesion[]>
  )

  const diasOrdenados = Object.keys(sesionePorDia).sort()

  return (
    <section id="cronograma" className="py-24 bg-white dark:bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#065F46] dark:text-[#10B981] px-4 py-1.5 bg-[#EAFBE2] dark:bg-[#10B981]/20 rounded-full mb-4">
            Programa del Evento
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1B22] dark:text-white text-balance">
            Cronograma 2026
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            Selecciona las sesiones a las que deseas asistir
          </p>
        </div>

        {/* Sesiones por día */}
        <div className="space-y-12">
          {diasOrdenados.map((dia) => (
            <div key={dia}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#065F46] dark:border-[#10B981]">
                <div className="bg-[#065F46] dark:bg-[#10B981] text-white px-4 py-2 rounded-lg font-bold">
                  {new Date(dia + "T00:00:00").toLocaleDateString("es-ES", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <h3 className="text-xl font-bold text-[#1A1B22] dark:text-white">{dia}</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {sesionePorDia[dia]
                  .sort(
                    (a, b) =>
                      a.hora_inicio.localeCompare(b.hora_inicio)
                  )
                  .map((sesion) => {
                    const isRegistered = misSesiones.includes(sesion.id)
                    const isRegistering = registrando === sesion.id
                    const cuposDisponibles = sesion.cupos_total - sesion.cupos_ocupados

                    return (
                      <div
                        key={sesion.id}
                        className="bg-white dark:bg-[#1E293B] border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-[#065F46] dark:hover:border-[#10B981] transition-all"
                      >
                        {/* Título */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-[#1A1B22] dark:text-white">
                              {sesion.titulo}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-[#065F46]/10 dark:bg-[#10B981]/20 text-[#065F46] dark:text-[#10B981]">
                                {sesion.tipo}
                              </span>
                            </div>
                          </div>
                          {isRegistered && (
                            <div className="flex-shrink-0">
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                          )}
                        </div>

                        {/* Detalles */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {sesion.hora_inicio} - {sesion.hora_fin}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{sesion.lugar}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <User className="w-4 h-4" />
                            <span className="text-sm">{sesion.ponente}</span>
                          </div>
                          {sesion.descripcion && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {sesion.descripcion}
                            </p>
                          )}
                        </div>

                        {/* Cupos */}
                        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 dark:text-gray-400">Cupos disponibles</span>
                            <span className={`font-bold ${cuposDisponibles > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                              {cuposDisponibles}/{sesion.cupos_total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                cuposDisponibles > 0
                                  ? "bg-[#065F46] dark:bg-[#10B981]"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${((sesion.cupos_total - cuposDisponibles) / sesion.cupos_total) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Botón */}
                        {user ? (
                          <button
                            onClick={() =>
                              isRegistered
                                ? handleDesregistro(sesion.id)
                                : handleRegistro(sesion.id)
                            }
                            disabled={
                              isRegistering || (cuposDisponibles === 0 && !isRegistered)
                            }
                            className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                              isRegistered
                                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                                : "bg-[#065F46] dark:bg-[#10B981] text-white hover:bg-[#054F3A] dark:hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed"
                            }`}
                          >
                            {isRegistering
                              ? "Procesando..."
                              : isRegistered
                                ? "Cancelar asistencia"
                                : cuposDisponibles === 0
                                  ? "Sin cupos"
                                  : "Registrarme"}
                          </button>
                        ) : (
                          <div className="text-sm text-center text-gray-500 dark:text-gray-400 py-2">
                            Inicia sesión para registrarte
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
