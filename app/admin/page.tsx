"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutGrid, CalendarDays, Users, MapPin, Settings, Sun, Bell, Search,
  LogOut, Pencil, Trash2, X, Clock, Filter, Plus
} from "lucide-react"
import type { Sesion, SesionFormData, Usuario } from "@/types"
import NuevaSesion from '@/components/NuevaSesion'

type View = "panel" | "sesiones" | "ponentes" | "configuracion"

const EMPTY_FORM: SesionFormData = {
  titulo: "",
  ponente: "",
  dia: "",
  hora_inicio: "",
  hora_fin: "",
  tipo: "Conferencia",
  lugar: "",
  cupos_total: 50,
  descripcion: "",
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<View>("panel")
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)

  // Sessions state
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [sesionesLoading, setSesionesLoading] = useState(false)

  // Create/Edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editForm, setEditForm] = useState<SesionFormData>(EMPTY_FORM)
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Search
  const [searchQuery, setSearchQuery] = useState("")


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

      setCurrentUser(payload.user)
      setLoading(false)
    }

    init()
  }, [router])

  const fetchSesiones = useCallback(async () => {
    setSesionesLoading(true)
    try {
      const res = await fetch("/api/admin/sesiones")
      if (res.ok) {
        const data = await res.json()
        setSesiones(data.data ?? [])
      }
    } finally {
      setSesionesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchSesiones()
    }
  }, [loading, fetchSesiones])

  // Derived data from real DB
  const uniquePonentes = useMemo(() => {
    const map = new Map<string, number>()
    sesiones.forEach((s) => {
      map.set(s.ponente, (map.get(s.ponente) ?? 0) + 1)
    })
    return [...map.entries()].map(([nombre, sesionesCount]) => ({ nombre, sesionesCount }))
  }, [sesiones])

  const ocupacionPorLugar = useMemo(() => {
    const map = new Map<string, { ocupados: number; total: number }>()
    sesiones.forEach((s) => {
      const cur = map.get(s.lugar) ?? { ocupados: 0, total: 0 }
      map.set(s.lugar, {
        ocupados: cur.ocupados + s.cupos_ocupados,
        total: cur.total + s.cupos_total,
      })
    })
    return [...map.entries()].map(([label, { ocupados, total }]) => ({
      label,
      value: total > 0 ? Math.round((ocupados / total) * 100) : 0,
      color: "#0F6B44",
    }))
  }, [sesiones])

  const totalRegistrados = useMemo(
    () => sesiones.reduce((acc, s) => acc + s.cupos_ocupados, 0),
    [sesiones]
  )

  const searchPlaceholder = useMemo(() => {
    if (active === "sesiones") return "Buscar sesión..."
    if (active === "ponentes") return "Buscar ponente..."
    return "Buscar en el panel..."
  }, [active])

  const filteredSesiones = useMemo(() => {
    if (!searchQuery.trim()) return sesiones
    const q = searchQuery.toLowerCase()
    return sesiones.filter(
      (s) =>
        s.titulo.toLowerCase().includes(q) ||
        s.ponente.toLowerCase().includes(q) ||
        s.lugar.toLowerCase().includes(q)
    )
  }, [sesiones, searchQuery])

  const filteredPonentes = useMemo(() => {
    if (!searchQuery.trim()) return uniquePonentes
    const q = searchQuery.toLowerCase()
    return uniquePonentes.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [uniquePonentes, searchQuery])

  function openCreateForm() {
    setEditingId(null)
    setFormError(null)
    setShowCreateForm(true)
  }

  function openEditForm(sesion: Sesion) {
    setEditingId(sesion.id)
    setEditForm({
      titulo: sesion.titulo,
      ponente: sesion.ponente,
      dia: sesion.dia,
      hora_inicio: sesion.hora_inicio,
      hora_fin: sesion.hora_fin,
      tipo: sesion.tipo,
      lugar: sesion.lugar,
      cupos_total: sesion.cupos_total,
      descripcion: sesion.descripcion ?? "",
    })
    setFormError(null)
    setShowEditForm(true)
  }

  async function handleSaveNewSession(data: SesionFormData) {
    setFormSaving(true)
    setFormError(null)
    try {
      const url = "/api/admin/sesiones"
      const method = "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al guardar." }))
        throw new Error(err.error ?? "Error al guardar.")
      }
      setShowCreateForm(false)
      await fetchSesiones()
    } catch (err) {
      throw err
    } finally {
      setFormSaving(false)
    }
  }

  async function handleUpdateSession() {
    if (!editingId) return
    setFormSaving(true)
    setFormError(null)
    try {
      const url = `/api/admin/sesiones/${editingId}`
      const method = "PUT"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al guardar." }))
        setFormError(err.error ?? "Error al guardar.")
        return
      }
      setShowEditForm(false)
      setShowSaveConfirm(false)
      await fetchSesiones()
    } catch {
      setFormError("Error de red. Intenta de nuevo.")
    } finally {
      setFormSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/sesiones/${id}`, { method: "DELETE" })
    if (res.ok) {
      await fetchSesiones()
    }
    setDeleteId(null)
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
  }

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
                onClick={() => { setActive("sesiones"); setSearchQuery("") }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-[#0F6B44]`}
              >
                <MapPin size={14} />
                Espacios
              </button>
            </nav>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={openCreateForm}
              className="w-full bg-[#53F000] text-black text-xs font-semibold py-2 rounded-md mb-4 flex items-center justify-center gap-1"
            >
              <Plus size={12} />
              Nueva Sesión
            </button>
            <button
              onClick={() => setActive("configuracion")}
              className={`flex items-center gap-2 text-xs mb-2 ${active === "configuracion" ? "text-[#0F6B44]" : "text-gray-500"}`}
            >
              <Settings size={12} />
              Ajustes
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 text-xs text-red-600"
            >
              <LogOut size={12} />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <section className="flex-1 overflow-auto">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 text-xs text-gray-400 w-[280px]">
              <Search size={14} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* PANEL PRINCIPAL */}
          {active === "panel" && (
            <div className="px-8 pb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-semibold text-[#0F6B44] uppercase">12va Jornada Académica</div>
                  <h1 className="text-2xl font-bold text-[#1A1B22]">Panel de Control</h1>
                </div>
              </div>

              {sesionesLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#0F6B44", borderTopColor: "transparent" }} />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <p className="text-2xl font-bold text-[#1A1B22]">{sesiones.length}</p>
                      <p className="text-xs text-gray-400 font-semibold">Total sesiones</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <p className="text-2xl font-bold text-[#1A1B22]">{uniquePonentes.length}</p>
                      <p className="text-xs text-gray-400 font-semibold">Conferencistas</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <p className="text-2xl font-bold text-[#1A1B22]">{totalRegistrados}</p>
                      <p className="text-xs text-gray-400 font-semibold">Cupos ocupados</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.6fr_1fr] gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-[#1A1B22]">
                          Sesiones Registradas
                        </div>
                        <button onClick={() => setActive("sesiones")} className="text-xs text-[#0F6B44] font-semibold">Ver todas</button>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        {sesiones.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-8">No hay sesiones registradas aún.</p>
                        ) : (
                          sesiones.slice(0, 5).map((s, index) => (
                            <div key={s.id} className={`flex items-center gap-4 px-5 py-4 ${index !== Math.min(sesiones.length, 5) - 1 ? "border-b border-gray-100" : ""}`}>
                              <div className="flex flex-col items-center w-12">
                                <span className="text-xs text-gray-400">{s.hora_inicio}</span>
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
                                <p className="text-[10px] text-gray-400 mt-1">{s.cupos_ocupados} / {s.cupos_total} cupos</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {ocupacionPorLugar.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 p-5">
                          <div className="text-sm font-semibold text-[#1A1B22] mb-4">Ocupación por Escenario</div>
                          {ocupacionPorLugar.map((o) => (
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
                      )}
                      <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <p className="text-xs font-semibold text-[#1A1B22]">Acceso rápido</p>
                        <button
                          onClick={openCreateForm}
                          className="mt-3 w-full bg-[#53F000] text-black text-xs font-semibold py-2 rounded-md flex items-center justify-center gap-1"
                        >
                          <Plus size={12} /> Nueva Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* SESIONES */}
          {active === "sesiones" && (
            <div className="px-8 pb-10">
              <div className="flex items-center justify-between mb-5">
                <h1 className="text-xl font-bold text-[#1A1B22]">Administración de Sesiones</h1>
                <button
                  onClick={openCreateForm}
                  className="bg-[#53F000] text-black text-xs font-semibold px-3 py-2 rounded-md flex items-center gap-1"
                >
                  <Plus size={12} /> Nueva Sesión
                </button>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr_1.1fr] gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 font-semibold">Total Sesiones</p>
                  <p className="text-xl font-bold text-[#1A1B22]">{sesiones.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 font-semibold">Escenarios</p>
                  <p className="text-xl font-bold text-[#1A1B22]">{ocupacionPorLugar.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 font-semibold">Ponentes</p>
                  <p className="text-xl font-bold text-[#1A1B22]">{uniquePonentes.length}</p>
                </div>
                <div className="bg-[#FFF7E5] rounded-2xl border border-[#F3D9A4] p-4">
                  <p className="text-[10px] text-[#735B24] font-semibold">Cupos ocupados</p>
                  <p className="text-xl font-bold text-[#1A1B22]">{totalRegistrados}</p>
                </div>
              </div>

              {sesionesLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#0F6B44", borderTopColor: "transparent" }} />
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F6F6F9] text-gray-400">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold">Nombre de Sesión</th>
                        <th className="text-left px-5 py-3 font-semibold">Día</th>
                        <th className="text-left px-5 py-3 font-semibold">Hora</th>
                        <th className="text-left px-5 py-3 font-semibold">Escenario</th>
                        <th className="text-left px-5 py-3 font-semibold">Conferencista</th>
                        <th className="text-left px-5 py-3 font-semibold">Cupos</th>
                        <th className="text-right px-5 py-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      {filteredSesiones.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-400">
                            {searchQuery ? "No se encontraron resultados." : "No hay sesiones registradas aún."}
                          </td>
                        </tr>
                      ) : (
                        filteredSesiones.map((row) => (
                          <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-5 py-3 font-semibold text-[#1A1B22]">{row.titulo}</td>
                            <td className="px-5 py-3">{row.dia}</td>
                            <td className="px-5 py-3">{row.hora_inicio}</td>
                            <td className="px-5 py-3">
                              <span className="bg-[#EEF2F7] text-[#475569] px-2 py-1 rounded-full text-[10px]">
                                {row.lugar}
                              </span>
                            </td>
                            <td className="px-5 py-3">{row.ponente}</td>
                            <td className="px-5 py-3">{row.cupos_ocupados}/{row.cupos_total}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditForm(row)}
                                  className="text-gray-400 hover:text-[#0F6B44]"
                                  title="Editar"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteId(row.id)}
                                  className="text-gray-400 hover:text-red-500"
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between px-5 py-3 text-[10px] text-gray-400">
                    <span>Mostrando {filteredSesiones.length} de {sesiones.length} sesiones</span>
                  </div>
                </div>
              )}

              {ocupacionPorLugar.length > 0 && (
                <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-sm font-semibold text-[#1A1B22] mb-3">Ocupación de Escenarios</p>
                  {ocupacionPorLugar.map((o) => (
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
              )}
            </div>
          )}

          {/* PONENTES */}
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
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar ponente..."
                      className="bg-transparent outline-none text-xs text-gray-500"
                    />
                  </div>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center"
                    title="Limpiar búsqueda"
                  >
                    <Filter size={14} className="text-gray-400" />
                  </button>
                </div>
              </div>

              {sesionesLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#0F6B44", borderTopColor: "transparent" }} />
                </div>
              ) : filteredPonentes.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">
                  {searchQuery ? "No se encontraron ponentes." : "No hay ponentes registrados aún."}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-5">
                  {filteredPonentes.map((c) => (
                    <div key={c.nombre} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
                      <div className="w-14 h-14 rounded-full border-2 border-[#0F6B44] mx-auto mb-3 flex items-center justify-center text-xs font-semibold text-[#0F6B44]">
                        {c.nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                      </div>
                      <p className="text-xs font-semibold text-[#1A1B22]">{c.nombre}</p>
                      <p className="text-[10px] text-[#0F6B44] mt-1">{c.sesionesCount} sesión{c.sesionesCount !== 1 ? "es" : ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONFIGURACIÓN */}
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
                        <p className="text-xs font-semibold">{currentUser?.full_name ?? currentUser?.username ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-semibold">CORREO INSTITUCIONAL</p>
                        <p className="text-xs font-semibold">{currentUser?.email ?? "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 font-semibold">ROL</p>
                        <div className="bg-[#F8F9FB] border border-gray-100 rounded-md px-3 py-2 text-xs font-semibold capitalize">
                          {currentUser?.role ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p className="text-xs font-semibold text-[#1A1B22] mb-4">Seguridad</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">CONTRASEÑA ACTUAL</p>
                      <input type="password" className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs" placeholder="••••••" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">NUEVA CONTRASEÑA</p>
                      <input type="password" className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs" placeholder="Nueva" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold">CONFIRMAR</p>
                      <input type="password" className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs" placeholder="Confirmar" />
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

      {/* FORMULARIO CREAR NUEVA SESIÓN - Componente NuevaSesion */}
      {showCreateForm && (
        <NuevaSesion
          onClose={() => setShowCreateForm(false)}
          onSave={handleSaveNewSession}
          sesiones={sesiones}
        />
      )}

      {/* FORMULARIO EDITAR SESIÓN - Modal anterior con datos precargados */}
      {showEditForm && (
        <div className="fixed inset-0 z-40 bg-black/20" onClick={(e) => { if (e.target === e.currentTarget) setShowEditForm(false) }}>
          <div className="absolute inset-y-0 right-0 w-[420px] bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">PANEL ADMINISTRATIVO</p>
                <h2 className="text-base font-bold text-[#1A1B22]">
                  Editar Sesión Académica
                </h2>
                <p className="text-xs text-gray-400">Modifique los datos de la sesión seleccionada.</p>
              </div>
              <button onClick={() => setShowEditForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md px-3 py-2">
                {formError}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">NOMBRE DE LA SESIÓN *</p>
                <input
                  className="w-full bg-[#F6F2FF] border border-gray-200 rounded-md px-3 py-2"
                  value={editForm.titulo}
                  onChange={(e) => setEditForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej. Conferencia sobre IA"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">CONFERENCISTA *</p>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2"
                  value={editForm.ponente}
                  onChange={(e) => setEditForm((f) => ({ ...f, ponente: e.target.value }))}
                  placeholder="Ej. Dr. Juan Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">TIPO DE SESIÓN</p>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2"
                    value={editForm.tipo}
                    onChange={(e) => setEditForm((f) => ({ ...f, tipo: e.target.value }))}
                    placeholder="Conferencia / Taller"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">CUPO MÁXIMO</p>
                  <input
                    type="number"
                    min={1}
                    className="w-full border border-gray-200 rounded-md px-3 py-2"
                    value={editForm.cupos_total}
                    onChange={(e) => setEditForm((f) => ({ ...f, cupos_total: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">DÍA</p>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2"
                  value={editForm.dia}
                  onChange={(e) => setEditForm((f) => ({ ...f, dia: e.target.value }))}
                  placeholder="Ej. lunes / 2025-12-01"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">HORA INICIO</p>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-md px-3 py-2"
                    value={editForm.hora_inicio}
                    onChange={(e) => setEditForm((f) => ({ ...f, hora_inicio: e.target.value }))}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">HORA FIN</p>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-md px-3 py-2"
                    value={editForm.hora_fin}
                    onChange={(e) => setEditForm((f) => ({ ...f, hora_fin: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">ESCENARIO / LUGAR</p>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2"
                  value={editForm.lugar}
                  onChange={(e) => setEditForm((f) => ({ ...f, lugar: e.target.value }))}
                  placeholder="Ej. Aula Magna"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-semibold">DESCRIPCIÓN (OPCIONAL)</p>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-md px-3 py-2"
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Descripción breve de la sesión..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSaveConfirm(true)}
                  disabled={formSaving || !editForm.titulo || !editForm.ponente}
                  className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-md disabled:opacity-50"
                >
                  Guardar Cambios
                </button>
                <button onClick={() => setShowEditForm(false)} className="text-xs font-semibold text-gray-400">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR GUARDAR CAMBIOS */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white rounded-xl shadow-xl w-[360px] px-5 py-4 text-xs">
            <h3 className="text-sm font-bold text-[#1A1B22]">
              ¿Guardar cambios?
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">
              ¿Estás seguro de que deseas aplicar las modificaciones a esta sesión?
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleUpdateSession}
                disabled={formSaving}
                className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-md disabled:opacity-50"
              >
                {formSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                onClick={() => setShowSaveConfirm(false)}
                disabled={formSaving}
                className="border border-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
            {formError && <p className="text-red-500 text-[11px] mt-2">{formError}</p>}
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white rounded-xl shadow-xl w-[340px] px-5 py-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Trash2 size={14} />
              <h3 className="text-sm font-bold text-[#1A1B22]">¿Eliminar sesión?</h3>
            </div>
            <p className="text-[11px] text-gray-500">Esta acción no se puede deshacer.</p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-[#C40000] text-white text-xs font-semibold px-4 py-2 rounded-md"
              >
                Eliminar
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="border border-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR CERRAR SESIÓN */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(59,59,59,0.85)" }}>
          <div className="bg-white rounded-xl shadow-xl w-[320px] px-6 py-5 text-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <LogOut size={14} />
              <p className="text-sm font-bold text-[#1A1B22]">¿Cerrar Sesión?</p>
            </div>
            <p className="text-[11px] text-gray-500">¿Estás seguro de que deseas salir del panel de administrador?</p>
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleLogout}
                className="bg-[#C40000] text-white text-xs font-semibold py-2 rounded-md"
              >
                CERRAR SESIÓN
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="border border-gray-200 text-gray-500 text-xs font-semibold py-2 rounded-md"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}