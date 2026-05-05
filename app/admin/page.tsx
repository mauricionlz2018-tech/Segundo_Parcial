"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutGrid, CalendarDays, Users, MapPin, Settings, LogOut, Pencil, Trash2, X, Clock, Filter, Plus, AlertCircle, Search, Sun, Moon, Bell, User
} from "lucide-react"
import type { Sesion, SesionFormData, Usuario } from "@/types"
import NuevaSesion from '@/components/NuevaSesion'
import { toast } from "sonner"

type View = "panel" | "sesiones" | "ponentes" | "configuracion" | "usuarios" | "espacios"

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
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<View>("panel")
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Sessions state
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [sesionesLoading, setSesionesLoading] = useState(false)

  // Users state
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuariosLoading, setUsuariosLoading] = useState(false)
  const [usuarioDeleteId, setUsuarioDeleteId] = useState<string | null>(null)

  // Espacios state
  const [espacios, setEspacios] = useState<Array<any>>([])
  const [espaciosLoading, setEspaciosLoading] = useState(false)
  const [showEspacioForm, setShowEspacioForm] = useState(false)
  const [editingEspacioId, setEditingEspacioId] = useState<string | null>(null)
  const [espacioForm, setEspacioForm] = useState({
    nombre: "",
    descripcion: "",
    capacidad_maxima: 50,
  })
  const [espacioDeleteId, setEspacioDeleteId] = useState<string | null>(null)

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
    setMounted(true)
  }, [])

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

  const fetchUsuarios = useCallback(async () => {
    setUsuariosLoading(true)
    try {
      const res = await fetch("/api/admin/usuarios")
      if (res.ok) {
        const data = await res.json()
        setUsuarios(data.data ?? [])
      }
    } finally {
      setUsuariosLoading(false)
    }
  }, [])

  const fetchEspacios = useCallback(async () => {
    setEspaciosLoading(true)
    try {
      const res = await fetch("/api/espacios")
      if (res.ok) {
        const data = await res.json()
        setEspacios(data.data ?? [])
      }
    } finally {
      setEspaciosLoading(false)
    }
  }, [])

  const handleSaveEspacio = async () => {
    if (!espacioForm.nombre.trim()) {
      toast.error("El nombre del espacio es requerido")
      return
    }
    if (espacioForm.capacidad_maxima < 1) {
      toast.error("La capacidad debe ser mayor a 0")
      return
    }

    try {
      if (editingEspacioId) {
        const res = await fetch(`/api/espacios/${editingEspacioId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(espacioForm),
        })
        if (!res.ok) {
          toast.error("Error al actualizar espacio")
          return
        }
        toast.success("Espacio actualizado exitosamente")
      } else {
        const res = await fetch("/api/espacios", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(espacioForm),
        })
        if (!res.ok) {
          toast.error("Error al crear espacio")
          return
        }
        toast.success("Espacio creado exitosamente")
      }
      setEspacioForm({ nombre: "", descripcion: "", capacidad_maxima: 50 })
      setEditingEspacioId(null)
      setShowEspacioForm(false)
      await fetchEspacios()
    } catch (e) {
      toast.error("Error: " + String(e))
    }
  }

  const handleDeleteEspacio = async (id: string) => {
    try {
      const res = await fetch(`/api/espacios/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Error al eliminar espacio")
        return
      }
      toast.success("Espacio eliminado exitosamente")
      setEspacioDeleteId(null)
      await fetchEspacios()
    } catch (e) {
      toast.error("Error: " + String(e))
    }
  }

  useEffect(() => {
    if (!loading) {
      fetchSesiones()
      if (active === "usuarios") {
        fetchUsuarios()
      }
      if (active === "espacios") {
        fetchEspacios()
      }
    }
  }, [loading, fetchSesiones, fetchUsuarios, fetchEspacios, active])

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
      toast.success("Sesión creada exitosamente")
      setShowCreateForm(false)
      await fetchSesiones()
    } catch (err) {
      toast.error(String(err).replace("Error: ", ""))
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
        toast.error(err.error ?? "Error al actualizar sesión")
        return
      }
      toast.success("Sesión actualizada exitosamente")
      setShowEditForm(false)
      setShowSaveConfirm(false)
      await fetchSesiones()
    } catch {
      setFormError("Error de red. Intenta de nuevo.")
      toast.error("Error de red al actualizar sesión")
    } finally {
      setFormSaving(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/sesiones/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Sesión eliminada exitosamente")
      await fetchSesiones()
    } else {
      toast.error("Error al eliminar sesión")
    }
    setDeleteId(null)
  }

  async function handleDeleteUsuario(id: string) {
    const res = await fetch("/api/admin/usuarios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      toast.success("Usuario eliminado exitosamente")
      await fetchUsuarios()
    } else {
      toast.error("Error al eliminar usuario")
    }
    setUsuarioDeleteId(null)
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
    <main className="min-h-screen bg-[#FBF8FF] dark:bg-[#0F172A]">
      <div className="flex min-h-screen">
        <aside className="w-[240px] bg-white dark:bg-[#1E293B] border-r border-gray-100 dark:border-gray-700 flex flex-col justify-between">
          <div className="px-6 pt-6">
            <div className="text-xs font-bold uppercase text-black dark:text-white leading-tight">
              UES SAN JOSÉ DEL
              <br />
              RINCÓN
            </div>
            <nav className="mt-6 flex flex-col gap-2 text-sm">
              <button
                onClick={() => setActive("panel")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "panel" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "ponentes" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
              >
                <Users size={14} />
                Ponentes
              </button>
              <button
                onClick={() => setActive("usuarios")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "usuarios" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
              >
                <Users size={14} />
                Usuarios
              </button>
              <button
                onClick={() => setActive("espacios")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "espacios" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
              >
                <MapPin size={14} />
                Espacios
              </button>
            </nav>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={openCreateForm}
              className="w-full bg-[#53F000] dark:bg-[#10B981] text-black dark:text-white text-xs font-semibold py-2 rounded-md mb-4 flex items-center justify-center gap-1"
            >
              <Plus size={12} />
              Nueva Sesión
            </button>
            <button
              onClick={() => setActive("configuracion")}
              className={`flex items-center gap-2 text-xs mb-2 ${active === "configuracion" ? "text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400"}`}
            >
              <Settings size={12} />
              Ajustes
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400"
            >
              <LogOut size={12} />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <section className="flex-1 overflow-auto bg-[#FBF8FF] dark:bg-[#0F172A]">
          <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1E293B]">
            <div className="flex items-center gap-2 bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-700 rounded-full px-4 py-2 text-xs text-gray-400 dark:text-gray-500 w-[280px]">
              <Search size={14} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent outline-none text-xs text-gray-500 dark:text-gray-400"
              />
            </div>
            <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
              <button
                onClick={() => mounted && setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                title="Cambiar tema"
              >
                {mounted && theme === 'dark' ? (
                  <Sun size={16} className="text-yellow-500" />
                ) : (
                  <Moon size={16} className="text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer relative"
                title="Notificaciones"
              >
                <Bell size={16} />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                title="Perfil"
              >
                <User size={16} />
              </button>
            </div>
          </div>

          {/* PANEL PRINCIPAL */}
          {active === "panel" && (
            <div className="px-8 pb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-semibold text-[#0F6B44] dark:text-[#10B981] uppercase">12va Jornada Académica</div>
                  <h1 className="text-2xl font-bold text-[#1A1B22] dark:text-white">Panel de Control</h1>
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

          {/* ESPACIOS */}
          {active === "espacios" && (
            <div className="px-8 pb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold text-[#0F6B44]">Gestión de Espacios</h1>
                  <p className="text-xs text-gray-400">Administra los espacios y sedes del evento.</p>
                </div>
                <button
                  onClick={() => {
                    setShowEspacioForm(!showEspacioForm)
                    setEditingEspacioId(null)
                    setEspacioForm({ nombre: "", descripcion: "", capacidad_maxima: 50 })
                  }}
                  className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Plus size={14} />
                  Agregar Espacio
                </button>
              </div>

              {espaciosLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#0F6B44", borderTopColor: "transparent" }} />
                </div>
              ) : (
                <div className="grid grid-cols-[1.2fr_1fr] gap-5">
                  {/* Lista de espacios */}
                  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-[1fr_80px_80px] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-400">ESPACIO</p>
                      <p className="text-xs font-semibold text-gray-400">CAPACIDAD</p>
                      <p className="text-xs font-semibold text-gray-400">ACCIONES</p>
                    </div>
                    {espacios.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-8">No hay espacios registrados.</p>
                    ) : (
                      <div>
                        {espacios.map((esp: any) => (
                          <div
                            key={esp.id}
                            className="grid grid-cols-[1fr_80px_80px] gap-4 px-5 py-3 border-b border-gray-100 items-center hover:bg-gray-50"
                          >
                            <div>
                              <p className="text-xs font-semibold text-[#1A1B22]">{esp.nombre}</p>
                              {esp.descripcion && (
                                <p className="text-[10px] text-gray-400">{esp.descripcion}</p>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-[#1A1B22]">{esp.capacidad_maxima}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingEspacioId(esp.id)
                                  setEspacioForm({
                                    nombre: esp.nombre,
                                    descripcion: esp.descripcion || "",
                                    capacidad_maxima: esp.capacidad_maxima,
                                  })
                                  setShowEspacioForm(true)
                                }}
                                className="p-1 hover:bg-blue-100 rounded"
                                title="Editar"
                              >
                                <Pencil size={14} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => setEspacioDeleteId(esp.id)}
                                className="p-1 hover:bg-red-100 rounded"
                                title="Eliminar"
                              >
                                <Trash2 size={14} className="text-red-600" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Formulario */}
                  {showEspacioForm && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5">
                      <h3 className="text-sm font-semibold text-[#1A1B22] mb-4">
                        {editingEspacioId ? "Editar Espacio" : "Nuevo Espacio"}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-400">Nombre</label>
                          <input
                            type="text"
                            value={espacioForm.nombre}
                            onChange={(e) =>
                              setEspacioForm({ ...espacioForm, nombre: e.target.value })
                            }
                            placeholder="Ej: Aula Magna"
                            className="w-full text-xs border border-gray-100 rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-400">
                            Descripción (opcional)
                          </label>
                          <textarea
                            value={espacioForm.descripcion}
                            onChange={(e) =>
                              setEspacioForm({ ...espacioForm, descripcion: e.target.value })
                            }
                            placeholder="Ej: Auditorio principal con capacidad amplia"
                            className="w-full text-xs border border-gray-100 rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44] resize-none"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-400">
                            Capacidad Máxima
                          </label>
                          <input
                            type="number"
                            value={espacioForm.capacidad_maxima}
                            onChange={(e) =>
                              setEspacioForm({
                                ...espacioForm,
                                capacidad_maxima: parseInt(e.target.value) || 50,
                              })
                            }
                            min="1"
                            className="w-full text-xs border border-gray-100 rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={handleSaveEspacio}
                            className="flex-1 bg-[#0F6B44] text-white text-xs font-semibold py-2 rounded-lg"
                          >
                            {editingEspacioId ? "Actualizar" : "Crear"}
                          </button>
                          <button
                            onClick={() => {
                              setShowEspacioForm(false)
                              setEditingEspacioId(null)
                              setEspacioForm({
                                nombre: "",
                                descripcion: "",
                                capacidad_maxima: 50,
                              })
                            }}
                            className="flex-1 bg-gray-100 text-gray-700 text-xs font-semibold py-2 rounded-lg"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delete confirmation modal */}
              {espacioDeleteId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl p-6 max-w-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-red-100 rounded-full p-3">
                        <AlertCircle size={20} className="text-red-600" />
                      </div>
                      <h3 className="text-sm font-bold text-[#1A1B22]">Eliminar Espacio</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-6">
                      ¿Estás seguro de que deseas eliminar este espacio? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEspacioDeleteId(null)}
                        className="flex-1 bg-gray-100 text-gray-700 text-xs font-semibold py-2 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDeleteEspacio(espacioDeleteId)}
                        className="flex-1 bg-red-600 text-white text-xs font-semibold py-2 rounded-lg"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
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

          {/* USUARIOS */}
          {active === "usuarios" && (
            <div className="px-8 pb-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold">GESTIÓN</p>
                  <h1 className="text-xl font-bold text-[#1A1B22]">Usuarios del Sistema</h1>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 font-semibold">Total Usuarios</p>
                  <p className="text-xl font-bold text-[#1A1B22]">{usuarios.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 font-semibold">Administradores</p>
                  <p className="text-xl font-bold text-[#1A1B22]">{usuarios.filter(u => u.role === "admin").length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <p className="text-[10px] text-gray-400 font-semibold">Alumnos</p>
                  <p className="text-xl font-bold text-[#1A1B22]">{usuarios.filter(u => u.role === "alumno").length}</p>
                </div>
                <div className="bg-[#FFEBEE] rounded-2xl border border-[#FFCDD2] p-4">
                  <p className="text-[10px] text-red-600 font-semibold">Registros Hoy</p>
                  <p className="text-xl font-bold text-[#C62828]">{usuarios.filter(u => {
                    const today = new Date().toISOString().split('T')[0];
                    return u.created_at.split('T')[0] === today;
                  }).length}</p>
                </div>
              </div>

              {usuariosLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: "#0F6B44", borderTopColor: "transparent" }} />
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F6F6F9] text-gray-400">
                      <tr>
                        <th className="text-left px-5 py-3 font-semibold">Usuario</th>
                        <th className="text-left px-5 py-3 font-semibold">Email</th>
                        <th className="text-left px-5 py-3 font-semibold">Nombre Completo</th>
                        <th className="text-left px-5 py-3 font-semibold">Carrera</th>
                        <th className="text-left px-5 py-3 font-semibold">Rol</th>
                        <th className="text-left px-5 py-3 font-semibold">Registrado</th>
                        <th className="text-right px-5 py-3 font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      {usuarios.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-400">
                            No hay usuarios registrados aún.
                          </td>
                        </tr>
                      ) : (
                        usuarios.map((user) => (
                          <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-5 py-3 font-semibold text-[#1A1B22]">{user.username}</td>
                            <td className="px-5 py-3">{user.email}</td>
                            <td className="px-5 py-3">{user.full_name || "—"}</td>
                            <td className="px-5 py-3">{user.carrera || "—"}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                                user.role === "admin"
                                  ? "bg-[#EAFBE2] text-[#0F6B44]"
                                  : "bg-[#F3F4F6] text-[#6B7280]"
                              }`}>
                                {user.role === "admin" ? "Admin" : "Alumno"}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              {new Date(user.created_at).toLocaleDateString("es-MX")}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-end gap-2">
                                {user.role !== "admin" && (
                                  <button
                                    onClick={() => setUsuarioDeleteId(user.id)}
                                    className="text-gray-400 hover:text-red-500"
                                    title="Eliminar usuario"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between px-5 py-3 text-[10px] text-gray-400">
                    <span>Mostrando {usuarios.length} usuarios</span>
                  </div>
                </div>
              )}
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

      {/* CONFIRMAR ELIMINAR USUARIO */}
      {usuarioDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white rounded-xl shadow-xl w-[340px] px-5 py-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Trash2 size={14} />
              <h3 className="text-sm font-bold text-[#1A1B22]">¿Eliminar usuario?</h3>
            </div>
            <p className="text-[11px] text-gray-500">Esta acción no se puede deshacer. Se eliminará toda la información del usuario.</p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => usuarioDeleteId && handleDeleteUsuario(usuarioDeleteId)}
                className="bg-[#C40000] text-white text-xs font-semibold px-4 py-2 rounded-md"
              >
                Eliminar
              </button>
              <button
                onClick={() => setUsuarioDeleteId(null)}
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

      {/* MODAL NOTIFICACIONES */}
      {showNotifications && (
        <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}>
          <div className="absolute top-16 right-8 w-80 bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#0F6B44] to-[#10B981] px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Notificaciones</h3>
                <button onClick={() => setShowNotifications(false)} className="text-white hover:bg-white/20 p-1 rounded">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
              <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0F6B44] rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#1A1B22] dark:text-white">Nueva sesion creada</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Se ha agregado una nueva sesion academica al evento.</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">Hace 5 minutos</p>
                  </div>
                </div>
              </div>
              <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0F6B44] rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#1A1B22] dark:text-white">Nuevo usuario registrado</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Un nuevo participante se ha registrado en el evento.</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">Hace 15 minutos</p>
                  </div>
                </div>
              </div>
              <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#1A1B22] dark:text-white">Capacidad casi llena</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">La sesion Programacion Web React ha alcanzado el 80% de su capacidad.</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">Hace 1 hora</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3">
              <button className="w-full text-xs font-semibold text-[#0F6B44] dark:text-[#10B981] py-2 text-center hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition-colors">
                Ver todas las notificaciones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERFIL */}
      {showProfile && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)}>
          <div className="absolute top-16 right-8 w-72 bg-white dark:bg-[#1E293B] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#0F6B44] to-[#10B981] px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Mi Perfil</h3>
                <button onClick={() => setShowProfile(false)} className="text-white hover:bg-white/20 p-1 rounded">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100 dark:border-gray-700">
                <div className="w-12 h-12 bg-[#0F6B44] dark:bg-[#10B981] rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1A1B22] dark:text-white">{currentUser?.full_name || currentUser?.username || 'Administrador'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser?.email || 'admin@email.com'}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Rol</p>
                  <p className="text-xs text-[#1A1B22] dark:text-white mt-1 font-semibold">Administrador</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Correo</p>
                  <p className="text-xs text-[#1A1B22] dark:text-white mt-1 break-all">{currentUser?.email || 'admin@email.com'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Estado</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">En linea</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => { setActive("configuracion"); setShowProfile(false); }} className="w-full text-xs font-semibold text-[#0F6B44] dark:text-[#10B981] py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                  Ajustes
                </button>
                <button onClick={() => { setShowLogoutConfirm(true); setShowProfile(false); }} className="w-full text-xs font-semibold text-red-600 dark:text-red-400 py-2 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                  Cerrar Sesion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}