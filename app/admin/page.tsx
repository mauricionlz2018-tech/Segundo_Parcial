"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutGrid, CalendarDays, Users, MapPin, Settings, LogOut, Pencil, Trash2, X, Clock, Filter, Plus, AlertCircle, Search, Sun, Moon, Bell, User, Eye, Menu
} from "lucide-react"
import type { Sesion, SesionFormData, Usuario } from "@/types"
import NuevaSesion from '@/components/NuevaSesion'
import Image from "next/image"
import { useIsMobile } from '@/components/ui/use-mobile'
import { toast } from "sonner"
import { formatTime12Hour } from "@/lib/utils"

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
  foto_ponente: null,
  perfil_profesional: null,
  afiliacion: null,
  biografia: null,
}

function getNombreDia(dia: string): string {
  const diasSemana: Record<string, string> = {
    "1": "Lunes",
    "2": "Martes",
    "3": "Miércoles",
    "4": "Jueves",
    "5": "Viernes"
  }
  
  // Si es un número (1-5), usar el mapeo directo
  if (diasSemana[dia]) {
    return diasSemana[dia]
  }
  
  // Si es una fecha ISO, extraer el día de la semana
  try {
    const date = new Date(dia)
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const dayName = days[date.getUTCDay()]
    return dayName
  } catch {
    return dia
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
  const [showCreateAdminForm, setShowCreateAdminForm] = useState(false)
  const [adminForm, setAdminForm] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    confirmPassword: "",
  })
  const [adminFormLoading, setAdminFormLoading] = useState(false)
  const [adminFormError, setAdminFormError] = useState<string | null>(null)

  // Create user state
  const [showCreateUserForm, setShowCreateUserForm] = useState(false)
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    full_name: "",
    carrera: "",
    password: "",
    confirmPassword: "",
  })
  const [userFormLoading, setUserFormLoading] = useState(false)
  const [userFormError, setUserFormError] = useState<string | null>(null)

  // View user details
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)

  // Edit user state
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [showEditUserForm, setShowEditUserForm] = useState(false)
  const [editUserForm, setEditUserForm] = useState({
    username: "",
    email: "",
    full_name: "",
    carrera: "",
    role: "alumno",
    password: "",
    confirmPassword: "",
  })
  const [editUserFormLoading, setEditUserFormLoading] = useState(false)
  const [editUserFormError, setEditUserFormError] = useState<string | null>(null)

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

  // View sesion details
  const [viewingSesionId, setViewingSesionId] = useState<string | null>(null)

  // Logout confirmation
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Delete own account confirmation
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false)

  // Photo upload state for edit form
  const [editPhotoUrl, setEditPhotoUrl] = useState<string | null>(null)

  // Search
  const [searchQuery, setSearchQuery] = useState("")
  const [viewingPonenteNombre, setViewingPonenteNombre] = useState<string | null>(null)


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
      fetchEspacios()
      if (active === "usuarios") {
        fetchUsuarios()
      }
    }
  }, [loading, fetchSesiones, fetchUsuarios, fetchEspacios, active])

  // Derived data from real DB
  const uniquePonentes = useMemo(() => {
    const map = new Map<string, { sesionesCount: number; fotoPonente: string | null }>()
    sesiones.forEach((s) => {
      const existing = map.get(s.ponente) ?? { sesionesCount: 0, fotoPonente: null }
      // Si hay foto y aún no la tenemos, la guardamos
      map.set(s.ponente, {
        sesionesCount: existing.sesionesCount + 1,
        fotoPonente: s.foto_ponente || existing.fotoPonente,
      })
    })
    return [...map.entries()].map(([nombre, { sesionesCount, fotoPonente }]) => ({ 
      nombre, 
      sesionesCount, 
      fotoPonente 
    }))
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
    
    console.log("Sesión cargada:", sesion) // Debug
    
    // Asegurar que la fecha esté en formato YYYY-MM-DD para el input type="date"
    let diaFormato = sesion.dia || ""
    if (diaFormato) {
      // Si viene de la BD es YYYY-MM-DD, usarlo tal cual
      // Si viene en otro formato, intentar convertir
      if (!diaFormato.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Si NO está en YYYY-MM-DD, intentar convertir
        const partes = diaFormato.split('/')
        if (partes.length === 3) {
          diaFormato = `${partes[2]}-${partes[1]}-${partes[0]}`
        }
      }
    }
    
    console.log("📅 Fecha convertida:", diaFormato) // Debug
    
    setEditForm({
      titulo: sesion.titulo,
      ponente: sesion.ponente,
      dia: diaFormato,
      hora_inicio: sesion.hora_inicio || "",
      hora_fin: sesion.hora_fin || "",
      tipo: sesion.tipo || "Conferencia",
      lugar: sesion.lugar || "",
      cupos_total: sesion.cupos_total,
      descripcion: sesion.descripcion || "",
      foto_ponente: sesion.foto_ponente ?? null,
      perfil_profesional: sesion.perfil_profesional ?? null,
      afiliacion: sesion.afiliacion ?? null,
      biografia: sesion.biografia ?? null,
    })
    console.log("✅ Perfil profesional guardado:", sesion.perfil_profesional) // Debug
    if (sesion.foto_ponente) {
      setEditPhotoUrl(sesion.foto_ponente)
    }
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
    try {
      const res = await fetch(`/api/admin/sesiones/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Sesión eliminada exitosamente")
        await fetchSesiones()
      } else {
        const errorData = await res.json().catch(() => ({}))
        console.error("Error deleting session:", res.status, errorData)
        toast.error(errorData.error ?? "Error al eliminar sesión")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de red al eliminar sesión")
    } finally {
      setDeleteId(null)
    }
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

  async function handleUpdateUsuario() {
    if (!editingUserId) return
    setEditUserFormLoading(true)
    setEditUserFormError(null)
    try {
      const body: any = {
        username: editUserForm.username,
        email: editUserForm.email,
        full_name: editUserForm.full_name,
        carrera: editUserForm.carrera || null,
        role: editUserForm.role,
      }
      if (editUserForm.password.trim()) {
        if (editUserForm.password.length < 6) {
          setEditUserFormError("La contraseña debe tener al menos 6 caracteres")
          setEditUserFormLoading(false)
          return
        }
        if (editUserForm.password !== editUserForm.confirmPassword) {
          setEditUserFormError("Las contraseñas no coinciden")
          setEditUserFormLoading(false)
          return
        }
        body.password = editUserForm.password
      }

      const res = await fetch(`/api/admin/usuarios/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json().catch(() => null)
      if (res.ok) {
        toast.success("Usuario actualizado exitosamente")
        setShowEditUserForm(false)
        setEditingUserId(null)
        setEditUserForm({ username: "", email: "", full_name: "", carrera: "", role: "alumno", password: "", confirmPassword: "" })
        await fetchUsuarios()
      } else {
        setEditUserFormError(data?.error ?? "Error al actualizar usuario")
        toast.error(data?.error ?? "Error al actualizar usuario")
      }
    } catch {
      setEditUserFormError("Error de red al actualizar usuario")
      toast.error("Error de red al actualizar usuario")
    } finally {
      setEditUserFormLoading(false)
    }
  }

  async function handleDeleteOwnAccount() {
    if (!currentUser) return
    
    const res = await fetch("/api/admin/usuarios", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentUser.id }),
    })
    
    if (res.ok) {
      toast.success("Cuenta eliminada exitosamente")
      setShowDeleteAccountConfirm(false)
      // Logout después de eliminar cuenta
      await handleLogout()
    } else {
      const data = await res.json().catch(() => ({}))
      toast.error(data.error ?? "Error al eliminar cuenta")
    }
  }

  async function handleCreateAdmin() {
    setAdminFormError(null)

    if (!adminForm.username.trim()) {
      setAdminFormError("El usuario es requerido")
      return
    }

    if (!adminForm.email.trim()) {
      setAdminFormError("El email es requerido")
      return
    }

    if (!adminForm.full_name.trim()) {
      setAdminFormError("El nombre completo es requerido")
      return
    }

    if (adminForm.password.length < 6) {
      setAdminFormError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (adminForm.password !== adminForm.confirmPassword) {
      setAdminFormError("Las contraseñas no coinciden")
      return
    }

    setAdminFormLoading(true)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: adminForm.username,
          email: adminForm.email,
          full_name: adminForm.full_name,
          password: adminForm.password,
          role: "admin",
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        toast.success("Administrador creado exitosamente")
        setAdminForm({ username: "", email: "", full_name: "", password: "", confirmPassword: "" })
        setShowCreateAdminForm(false)
        await fetchUsuarios()
      } else {
        setAdminFormError(data?.error ?? "Error al crear administrador")
      }
    } catch (error) {
      setAdminFormError("Error de red al crear administrador")
    } finally {
      setAdminFormLoading(false)
    }
  }

  async function handleCreateUser() {
    setUserFormError(null)

    if (!userForm.username.trim()) {
      setUserFormError("El usuario es requerido")
      return
    }

    if (!userForm.email.trim()) {
      setUserFormError("El email es requerido")
      return
    }

    if (!userForm.full_name.trim()) {
      setUserFormError("El nombre completo es requerido")
      return
    }

    if (userForm.password.length < 6) {
      setUserFormError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (userForm.password !== userForm.confirmPassword) {
      setUserFormError("Las contraseñas no coinciden")
      return
    }

    setUserFormLoading(true)
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userForm.username,
          email: userForm.email,
          full_name: userForm.full_name,
          carrera: userForm.carrera || null,
          password: userForm.password,
          role: "alumno",
        }),
      })

      const data = await res.json().catch(() => null)

      if (res.ok) {
        toast.success("Usuario creado exitosamente")
        setUserForm({ username: "", email: "", full_name: "", carrera: "", password: "", confirmPassword: "" })
        setShowCreateUserForm(false)
        await fetchUsuarios()
      } else {
        setUserFormError(data?.error ?? "Error al crear usuario")
      }
    } catch (error) {
      setUserFormError("Error de red al crear usuario")
    } finally {
      setUserFormLoading(false)
    }
  }

  function handleEditPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEditPhotoUrl(URL.createObjectURL(file))
    
    // Convertir a base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      setEditForm((f) => ({ ...f, foto_ponente: base64String }))
    }
    reader.readAsDataURL(file)
  }

  async function handleLimpiarSesionesUsuarios() {
    try {
      const res = await fetch("/api/admin/limpiar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "limpiar-sesiones-usuarios" }),
      })
      if (res.ok) {
        toast.success("Todos los registros de sesiones de usuarios han sido eliminados")
        await fetchSesiones()
      } else {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error ?? "Error al limpiar datos")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al limpiar datos")
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#0F172A]" style={{ backgroundColor: "#FBF8FF" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0F6B44", borderTopColor: "transparent" }} />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FBF8FF] dark:bg-[#0F172A]">
      <div className="flex min-h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-[240px] bg-white dark:bg-[#1E293B] border-r border-gray-100 dark:border-gray-700 flex-col justify-between fixed left-0 top-0 bottom-0">
          <div className="px-6 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/sanjose.png"
                alt="San José del Rincón"
                width={56}
                height={56}
                className="rounded-md"
              />
              <div className="text-xs font-bold uppercase text-black dark:text-white leading-tight">
                UES SAN JOSÉ DEL
                <br />
                RINCÓN
              </div>
            </div>
              <nav className="mt-6 flex flex-col gap-2 text-sm">
                <button
                  onClick={() => setActive("panel")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${active === "panel" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
                >
                  <LayoutGrid size={14} />
                  Panel de Control
                </button>
                <button
                  onClick={() => setActive("sesiones")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${active === "sesiones" ? "bg-[#EAFBE2] text-[#0F6B44]" : "text-gray-500 hover:text-[#0F6B44]"}`}
                >
                  <CalendarDays size={14} />
                  Sesiones
                </button>
                <button
                  onClick={() => setActive("ponentes")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${active === "ponentes" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
                >
                  <Users size={14} />
                  Ponentes
                </button>
                <button
                  onClick={() => setActive("usuarios")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${active === "usuarios" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
                >
                  <Users size={14} />
                  Usuarios
                </button>
                <button
                  onClick={() => setActive("espacios")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer ${active === "espacios" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
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

        {/* Sidebar - Mobile */}
        {mobileMenuOpen && (
          <aside className="fixed inset-0 z-40 lg:hidden bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div 
              className="absolute left-0 top-0 bottom-0 w-[240px] bg-white dark:bg-[#1E293B] border-r border-gray-100 dark:border-gray-700 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/images/sanjose.png"
                      alt="San José del Rincón"
                      width={90}
                      height={90}
                    />
                    <div className="text-xs font-bold uppercase text-black dark:text-white leading-tight">
                      UES SAN JOSÉ DEL
                      <br />
                      RINCÓN
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X size={18} />
                  </button>
                </div>
                <nav className="mt-6 flex flex-col gap-2 text-sm">
                  <button
                    onClick={() => {
                      setActive("panel")
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "panel" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
                  >
                    <LayoutGrid size={14} />
                    Panel de Control
                  </button>
                  <button
                    onClick={() => {
                      setActive("sesiones")
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "sesiones" ? "bg-[#EAFBE2] text-[#0F6B44]" : "text-gray-500 hover:text-[#0F6B44]"}`}
                  >
                    <CalendarDays size={14} />
                    Sesiones
                  </button>
                  <button
                    onClick={() => {
                      setActive("ponentes")
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "ponentes" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
                  >
                    <Users size={14} />
                    Ponentes
                  </button>
                  <button
                    onClick={() => {
                      setActive("usuarios")
                      setMobileMenuOpen(false)
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${active === "usuarios" ? "bg-[#EAFBE2] dark:bg-[#10B981]/20 text-[#0F6B44] dark:text-[#10B981]" : "text-gray-500 dark:text-gray-400 hover:text-[#0F6B44] dark:hover:text-[#10B981]"}`}
                  >
                    <Users size={14} />
                    Usuarios
                  </button>
                  <button
                    onClick={() => {
                      setActive("espacios")
                      setMobileMenuOpen(false)
                    }}
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
                  onClick={() => {
                    setActive("configuracion")
                    setMobileMenuOpen(false)
                  }}
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
            </div>
          </aside>
        )}

        <section className="flex-1 overflow-auto bg-white dark:bg-slate-950 lg:ml-[240px]">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-[#1E293B]">
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Menú"
              >
                <Menu size={20} />
              </button>
              <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-700 rounded-full px-4 py-2 text-xs text-gray-400 dark:text-gray-500 flex-1 max-w-[280px]">
                <Search size={14} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent outline-none text-xs text-gray-500 dark:text-gray-400"
                />
              </div>
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
            <div className="px-8 pb-10 py-6">
              <div className="flex items-center justify-between mb-5">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                      <p className="text-2xl font-bold text-[#1A1B22] dark:text-white">{sesiones.length}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Total sesiones</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                      <p className="text-2xl font-bold text-[#1A1B22] dark:text-white">{uniquePonentes.length}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Conferencistas</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                      <p className="text-2xl font-bold text-[#1A1B22] dark:text-white">{totalRegistrados}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Cupos ocupados</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-[#1A1B22] dark:text-white">
                          Sesiones Registradas
                        </div>
                        <button onClick={() => setActive("sesiones")} className="text-xs text-[#0F6B44] dark:text-[#10B981] font-semibold cursor-pointer">Ver todas</button>
                      </div>
                      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {sesiones.length === 0 ? (
                          <p className="text-xs text-gray-400 text-center py-8">No hay sesiones registradas aún.</p>
                        ) : (
                          sesiones.slice(0, 5).map((s, index) => (
                            <div key={s.id} className={`flex items-center gap-4 px-5 py-4 ${index !== Math.min(sesiones.length, 5) - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}>
                              <div className="flex flex-col items-center w-12">
                                <span className="text-xs text-gray-400">{formatTime12Hour(s.hora_inicio)}</span>
                                <Clock size={12} className="text-gray-300" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-[#1A1B22] dark:text-white">{s.titulo}</p>
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
                        <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                          <div className="text-sm font-semibold text-[#1A1B22] dark:text-white mb-4">Ocupación por Escenario</div>
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
                      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                        <p className="text-xs font-semibold text-[#1A1B22] dark:text-white">Acceso rápido</p>
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
            <div className="px-8 pb-10 py-6">
              <div className="flex items-center justify-between mb-[5px]">
                <h1 className="text-xl font-bold text-[#1A1B22] dark:text-white">Administración de Sesiones</h1>
                <button
                  onClick={openCreateForm}
                  className="bg-[#53F000] text-black text-xs font-semibold px-3 py-2 rounded-md flex items-center gap-1"
                >
                  <Plus size={12} /> Nueva Sesión
                </button>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr_1.1fr] gap-4 mb-6">
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">Total Sesiones</p>
                  <p className="text-xl font-bold text-[#1A1B22] dark:text-white">{sesiones.length}</p>
                </div>
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">Escenarios</p>
                  <p className="text-xl font-bold text-[#1A1B22] dark:text-white">{ocupacionPorLugar.length}</p>
                </div>
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">Ponentes</p>
                  <p className="text-xl font-bold text-[#1A1B22] dark:text-white">{uniquePonentes.length}</p>
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
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F6F6F9] dark:bg-[#0F172A] text-gray-400">
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
                    <tbody className="text-gray-600 dark:text-gray-400">
                      {filteredSesiones.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-400">
                            {searchQuery ? "No se encontraron resultados." : "No hay sesiones registradas aún."}
                          </td>
                        </tr>
                      ) : (
                        filteredSesiones.map((row) => (
                          <tr key={row.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#0F172A]">
                            <td className="px-5 py-3 font-semibold text-[#1A1B22] dark:text-white">{row.titulo}</td>
                            <td className="px-5 py-3 dark:text-white">{getNombreDia(row.dia)}</td>
                            <td className="px-5 py-3">{formatTime12Hour(row.hora_inicio)}</td>
                            <td className="px-5 py-3">
                              <span className="bg-[#EEF2F7] text-[#475569] px-2 py-1 rounded-full text-[10px] whitespace-nowrap inline-block">
                                {row.lugar}
                              </span>
                            </td>
                            <td className="px-5 py-3">{row.ponente}</td>
                            <td className="px-5 py-3">{row.cupos_ocupados}/{row.cupos_total}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setViewingSesionId(row.id)}
                                  className="text-gray-400 hover:text-blue-500 cursor-pointer"
                                  title="Ver detalles"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => openEditForm(row)}
                                  className="text-gray-400 hover:text-[#0F6B44] cursor-pointer"
                                  title="Editar"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteId(row.id)}
                                  className="text-gray-400 hover:text-red-500 cursor-pointer"
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
                <div className="mt-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                  <p className="text-sm font-semibold text-[#1A1B22] dark:text-white mb-3">Ocupación de Escenarios</p>
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
            <div className="px-8 pb-10 py-6">
              <div className="flex items-center justify-between mb-[5px]">
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">DIRECTORIO ACADÉMICO</p>
                  <h1 className="text-xl font-bold text-[#1A1B22] dark:text-white">Gestión de Conferencistas</h1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-700 rounded-full px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                    <Search size={12} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar ponente..."
                      className="bg-transparent outline-none text-xs text-gray-500 dark:text-gray-400"
                    />
                  </div>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 flex items-center justify-center"
                    title="Limpiar búsqueda"
                  >
                    <Filter size={14} className="text-gray-400 dark:text-gray-500" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredPonentes.map((c) => (
                    <div key={c.nombre} className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-center">
                      {c.fotoPonente ? (
                        <img 
                          src={c.fotoPonente} 
                          alt={c.nombre}
                          className="w-14 h-14 rounded-full mx-auto mb-3 object-cover border-2 border-[#0F6B44]"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full border-2 border-[#0F6B44] mx-auto mb-3 flex items-center justify-center text-xs font-semibold text-[#0F6B44] dark:text-green-400">
                          {c.nombre.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                        </div>
                      )}
                      <p className="text-xs font-semibold text-[#1A1B22] dark:text-white">{c.nombre}</p>
                      <p className="text-[10px] text-[#0F6B44] mt-1">{c.sesionesCount} sesión{c.sesionesCount !== 1 ? "es" : ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ESPACIOS */}
          {active === "espacios" && (
            <div className="px-8 pb-10 pt-10">
              <div className="flex items-center justify-between mb-[5px]">
                <div>
                  <h1 className="text-xl font-bold text-[#0F6B44] dark:text-[#10B981]">Gestión de Espacios</h1>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Administra los espacios y sedes del evento.</p>
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
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5">
                  {/* Lista de espacios */}
                  <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="grid grid-cols-[1fr_80px_80px] gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#0F172A]">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">ESPACIO</p>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">CAPACIDAD</p>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">ACCIONES</p>
                    </div>
                    {espacios.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-8">No hay espacios registrados.</p>
                    ) : (
                      <div>
                        {espacios.map((esp: any) => (
                          <div
                            key={esp.id}
                            className="grid grid-cols-[1fr_80px_80px] gap-4 px-5 py-3 border-b border-gray-100 dark:border-gray-700 items-center hover:bg-gray-50 dark:hover:bg-[#0F172A]"
                          >
                            <div>
                              <p className="text-xs font-semibold text-[#1A1B22] dark:text-white">{esp.nombre}</p>
                              {esp.descripcion && (
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">{esp.descripcion}</p>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-[#1A1B22] dark:text-white">{esp.capacidad_maxima}</p>
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
                                 className="p-1 hover:bg-blue-100 rounded cursor-pointer"
                                title="Editar"
                              >
                                <Pencil size={14} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() => setEspacioDeleteId(esp.id)}
                                 className="p-1 hover:bg-red-100 rounded cursor-pointer"
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
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                      <h3 className="text-sm font-semibold text-[#1A1B22] dark:text-white mb-4">
                        {editingEspacioId ? "Editar Espacio" : "Nuevo Espacio"}
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-400 dark:text-gray-500">Nombre</label>
                          <input
                            type="text"
                            value={espacioForm.nombre}
                            onChange={(e) =>
                              setEspacioForm({ ...espacioForm, nombre: e.target.value })
                            }
                            placeholder="Ej: Aula Magna"
                            className="w-full text-xs border border-gray-100 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                            Descripción (opcional)
                          </label>
                          <textarea
                            value={espacioForm.descripcion}
                            onChange={(e) =>
                              setEspacioForm({ ...espacioForm, descripcion: e.target.value })
                            }
                            placeholder="Ej: Auditorio principal con capacidad amplia"
                            className="w-full text-xs border border-gray-100 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44] resize-none"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                            Capacidad Máxima
                          </label>
                          <input
                            type="number"
                            placeholder="Ej: 100"
                            className="w-full text-xs border border-gray-100 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
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
                      <h3 className="text-sm font-bold text-[#1A1B22] dark:text-white">Eliminar Espacio</h3>
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
            <div className="px-8 pb-10 pt-10">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-[#0F6B44] dark:text-[#10B981]">Configuración del Sistema</h1>
                <p className="text-xs text-gray-400 dark:text-gray-500">Administra los parámetros globales y tu perfil de identidad institucional.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#1A1B22] dark:text-white mb-4">
                    <span className="bg-[#F8EBD0] dark:bg-[#8C6A1B] text-[#735B24] dark:text-yellow-100 px-2 py-1 rounded">Perfil del Administrador</span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-4">
                    <div className="bg-[#F8F9FB] dark:bg-[#0F172A] rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center h-24">
                      <img src="/images/Umb_logo.png" alt="UMB" className="h-10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">NOMBRE COMPLETO</p>
                        <p className="text-xs font-semibold dark:text-white">{currentUser?.full_name ?? currentUser?.username ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">CORREO INSTITUCIONAL</p>
                        <p className="text-xs font-semibold dark:text-white">{currentUser?.email ?? "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">ROL</p>
                        <div className="bg-[#F8F9FB] dark:bg-[#0F172A] border border-gray-100 dark:border-gray-700 rounded-md px-3 py-2 text-xs font-semibold capitalize dark:text-white">
                          {currentUser?.role ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                  <p className="text-xs font-semibold text-[#1A1B22] dark:text-white mb-4">Seguridad</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">CONTRASEÑA ACTUAL</p>
                      <input type="password" className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-md px-3 py-2 text-xs" placeholder="••••••" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">NUEVA CONTRASEÑA</p>
                      <input type="password" className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-md px-3 py-2 text-xs" placeholder="Nueva" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">CONFIRMAR</p>
                      <input type="password" className="w-full border border-gray-200 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-md px-3 py-2 text-xs" placeholder="Confirmar" />
                    </div>
                    <button                     className="bg-[#8C6A1B] text-white text-xs font-semibold px-4 py-2 rounded-md w-fit cursor-pointer hover:bg-[#725f15]">Actualizar Seguridad</button>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <p className="text-xs font-semibold text-[#1A1B22] dark:text-white mb-4">Notificaciones del Sistema</p>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#0F172A] rounded-xl p-3 text-xs">
                    <input type="checkbox" defaultChecked className="mt-1" />
                    <div>
                      <p className="font-semibold text-[#1A1B22] dark:text-white">Nuevos Registros</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">Notificar cuando un estudiante o docente se inscriba.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#0F172A] rounded-xl p-3 text-xs">
                    <input type="checkbox" defaultChecked className="mt-1" />
                    <div>
                      <p className="font-semibold text-[#1A1B22] dark:text-white">Conflictos de Horario</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">Alertas inmediatas sobre traslape de eventos.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 border border-gray-100 dark:border-gray-700 bg-white dark:bg-[#0F172A] rounded-xl p-3 text-xs">
                    <input type="checkbox" className="mt-1" />
                    <div>
                      <p className="font-semibold text-[#1A1B22] dark:text-white">Reportes Diarios</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">Resumen ejecutivo enviado por correo cada mañana.</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-2xl p-5">
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-3">Zona de Peligro</p>
                <p className="text-[11px] text-red-600 dark:text-red-500 mb-4">
                  Las acciones en esta sección son irreversibles. Por favor, procede con cuidado.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleLimpiarSesionesUsuarios()}
                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-4 py-2 rounded-lg w-fit"
                  >
                    Limpiar Sesiones de Usuarios
                  </button>
                  <button
                    onClick={() => setShowDeleteAccountConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg w-fit"
                  >
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* USUARIOS */}
          {active === "usuarios" && (
            <div className="px-8 pb-10 py-6">
              <div className="flex items-center justify-between mb-[5px]">
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">GESTIÓN</p>
                  <h1 className="text-xl font-bold text-[#1A1B22] dark:text-white">Usuarios del Sistema</h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowCreateUserForm(!showCreateUserForm)
                      setUserForm({ username: "", email: "", full_name: "", carrera: "", password: "", confirmPassword: "" })
                      setUserFormError(null)
                    }}
                    className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Plus size={14} />
                    Nuevo Usuario
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateAdminForm(!showCreateAdminForm)
                      setAdminForm({ username: "", email: "", full_name: "", password: "", confirmPassword: "" })
                      setAdminFormError(null)
                    }}
                    className="bg-[#0F6B44] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus size={14} />
                    Crear Administrador
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">Total Usuarios</p>
                  <p className="text-xl font-bold text-[#1A1B22] dark:text-white">{usuarios.length}</p>
                </div>
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">Administradores</p>
                  <p className="text-xl font-bold text-[#1A1B22] dark:text-white">{usuarios.filter(u => u.role === "admin").length}</p>
                </div>
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">Alumnos</p>
                  <p className="text-xl font-bold text-[#1A1B22] dark:text-white">{usuarios.filter(u => u.role === "alumno").length}</p>
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
                <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-[#F6F6F9] dark:bg-[#0F172A] text-gray-400 dark:text-gray-500">
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
                    <tbody className="text-gray-600 dark:text-gray-400">
                      {usuarios.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-gray-400">
                            No hay usuarios registrados aún.
                          </td>
                        </tr>
                      ) : (
                        usuarios.map((user) => (
                          <tr key={user.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#0F172A]">
                            <td className="px-5 py-3 font-semibold text-[#1A1B22] dark:text-white">{user.username}</td>
                            <td className="px-5 py-3 dark:text-white">{user.email}</td>
                            <td className="px-5 py-3 dark:text-white">{user.full_name || "—"}</td>
                            <td className="px-5 py-3 dark:text-white">{user.carrera || "—"}</td>
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
                                <button
                                  onClick={() => setViewingUserId(user.id)}
                                  className="text-gray-400 hover:text-blue-500 cursor-pointer"
                                  title="Ver detalles"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingUserId(user.id)
                                    setEditUserForm({
                                      username: user.username,
                                      email: user.email,
                                      full_name: user.full_name || "",
                                      carrera: user.carrera || "",
                                      role: user.role,
                                      password: "",
                                      confirmPassword: "",
                                    })
                                    setEditUserFormError(null)
                                    setShowEditUserForm(true)
                                  }}
                                  className="text-gray-400 hover:text-[#0F6B44] cursor-pointer"
                                  title="Editar"
                                >
                                  <Pencil size={14} />
                                </button>
                                {user.id !== currentUser?.id && (
                                  <button
                                    onClick={() => setUsuarioDeleteId(user.id)}
                                    className="text-gray-400 hover:text-red-500 cursor-pointer"
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

              {showCreateAdminForm && (
                <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-[450px] px-6 py-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Crear Administrador</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Agregar un nuevo usuario con permisos de administrador</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowCreateAdminForm(false)
                          setAdminForm({ username: "", email: "", full_name: "", password: "", confirmPassword: "" })
                          setAdminFormError(null)
                        }}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    {adminFormError && (
                      <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs rounded-lg px-4 py-3">
                        {adminFormError}
                      </div>
                    )}

                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Usuario</label>
                        <input
                          type="text"
                          value={adminForm.username}
                          onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                          placeholder="ejemplo_usuario"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email</label>
                        <input
                          type="email"
                          value={adminForm.email}
                          onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                          placeholder="admin@ejemplo.com"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre Completo</label>
                        <input
                          type="text"
                          value={adminForm.full_name}
                          onChange={(e) => setAdminForm({ ...adminForm, full_name: e.target.value })}
                          placeholder="Juan Pérez"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Contraseña</label>
                        <input
                          type="password"
                          value={adminForm.password}
                          onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
                        <input
                          type="password"
                          value={adminForm.confirmPassword}
                          onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })}
                          placeholder="Confirmar contraseña"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleCreateAdmin}
                        disabled={adminFormLoading}
                        className="flex-1 bg-[#0F6B44] text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50 hover:bg-[#0d5a38]"
                      >
                        {adminFormLoading ? "Creando..." : "Crear Administrador"}
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateAdminForm(false)
                          setAdminForm({ username: "", email: "", full_name: "", password: "", confirmPassword: "" })
                          setAdminFormError(null)
                        }}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showCreateUserForm && (
                <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-[450px] px-6 py-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Crear Nuevo Usuario</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Agregar un nuevo usuario alumno al sistema</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowCreateUserForm(false)
                          setUserForm({ username: "", email: "", full_name: "", carrera: "", password: "", confirmPassword: "" })
                          setUserFormError(null)
                        }}
                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    {userFormError && (
                      <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs rounded-lg px-4 py-3">
                        {userFormError}
                      </div>
                    )}

                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Usuario</label>
                        <input
                          type="text"
                          value={userForm.username}
                          onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                          placeholder="ejemplo_usuario"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email</label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          placeholder="usuario@ejemplo.com"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre Completo</label>
                        <input
                          type="text"
                          value={userForm.full_name}
                          onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                          placeholder="Juan Pérez"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Carrera (Opcional)</label>
                        <input
                          type="text"
                          value={userForm.carrera}
                          onChange={(e) => setUserForm({ ...userForm, carrera: e.target.value })}
                          placeholder="Ej: Ingeniería en Sistemas"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Contraseña</label>
                        <input
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          placeholder="Mínimo 6 caracteres"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
                        <input
                          type="password"
                          value={userForm.confirmPassword}
                          onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                          placeholder="Confirmar contraseña"
                          className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleCreateUser}
                        disabled={userFormLoading}
                        className="flex-1 bg-[#53F000] text-black text-xs font-semibold py-2 rounded-lg disabled:opacity-50 hover:bg-[#40d700]"
                      >
                        {userFormLoading ? "Creando..." : "Crear Usuario"}
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateUserForm(false)
                          setUserForm({ username: "", email: "", full_name: "", carrera: "", password: "", confirmPassword: "" })
                          setUserFormError(null)
                        }}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                    </div>
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
          <div className="absolute inset-y-0 right-0 w-[420px] bg-white dark:bg-[#1E293B] shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] text-gray-500 dark:text-gray-500 font-semibold">PANEL ADMINISTRATIVO</p>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Editar Sesión Académica
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-500">Modifique los datos de la sesión seleccionada.</p>
              </div>
              <button onClick={() => setShowEditForm(false)} className="text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs rounded-md px-3 py-2">
                {formError}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Nombre de la sesión *</p>
                <input
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                  value={editForm.titulo}
                  onChange={(e) => setEditForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej. Conferencia sobre IA"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Conferencista *</p>
                <input
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                  value={editForm.ponente}
                  onChange={(e) => setEditForm((f) => ({ ...f, ponente: e.target.value }))}
                  placeholder="Ej. Dr. Juan Pérez"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Tipo de sesión</p>
                  <select
                    className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                    value={editForm.tipo}
                    onChange={(e) => setEditForm((f) => ({ ...f, tipo: e.target.value }))}
                  >
                    <option value="Conferencia">Conferencia</option>
                    <option value="Taller">Taller</option>
                    <option value="Panel">Panel</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Cupo máximo</p>
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                    value={editForm.cupos_total}
                    onChange={(e) => setEditForm((f) => ({ ...f, cupos_total: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Día</p>
                <input
                  type="date"
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                  value={editForm.dia}
                  onChange={(e) => setEditForm((f) => ({ ...f, dia: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Hora inicio</p>
                  <input
                    type="time"
                    className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                    value={editForm.hora_inicio}
                    onChange={(e) => setEditForm((f) => ({ ...f, hora_inicio: e.target.value }))}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Hora fin</p>
                  <input
                    type="time"
                    className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                    value={editForm.hora_fin}
                    onChange={(e) => setEditForm((f) => ({ ...f, hora_fin: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Perfil profesional</p>
                <input
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                  value={editForm.perfil_profesional || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, perfil_profesional: e.target.value || null }))}
                  placeholder="Ej. Doctor en Ciencias"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Afiliación</p>
                <input
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                  value={editForm.afiliacion || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, afiliacion: e.target.value || null }))}
                  placeholder="Ej. Universidad Nacional"
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Foto del ponente</p>
                <div className="flex items-center gap-2">
                  <label className="flex-1 bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44] cursor-pointer text-xs">
                    Seleccionar archivo
                    <input type="file" accept="image/*" className="hidden" onChange={handleEditPhotoChange} />
                  </label>
                  {editPhotoUrl && (
                    <img src={editPhotoUrl} alt="preview" className="w-10 h-10 rounded-md object-cover border border-gray-300 dark:border-gray-700" />
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Biografía</p>
                <textarea
                  rows={2}
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44] resize-none"
                  value={editForm.biografia || ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, biografia: e.target.value || null }))}
                  placeholder="Describa brevemente la biografía del ponente..."
                />
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Escenario / Lugar</p>
                <select
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44]"
                  value={editForm.lugar}
                  onChange={(e) => setEditForm((f) => ({ ...f, lugar: e.target.value }))}
                >
                  <option value="">Seleccionar un escenario</option>
                  {espacios.map((espacio: any) => (
                    <option key={espacio.id} value={espacio.nombre}>
                      {espacio.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-400 font-semibold">Descripción (opcional)</p>
                <textarea
                  rows={3}
                  className="w-full bg-white dark:bg-[#0F172A] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:border-[#0F6B44] resize-none"
                  value={editForm.descripcion}
                  onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Descripción breve de la sesión..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSaveConfirm(true)}
                  disabled={formSaving || !editForm.titulo || !editForm.ponente}
                  className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-md disabled:opacity-50 hover:bg-[#40d700]"
                >
                  Guardar Cambios
                </button>
                <button onClick={() => setShowEditForm(false)} className="text-xs font-semibold text-gray-700 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-400">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR GUARDAR CAMBIOS */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl w-[360px] px-5 py-4 text-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              ¿Guardar cambios?
            </h3>
            <p className="text-[11px] text-gray-600 dark:text-gray-500 mt-1">
              ¿Estás seguro de que deseas aplicar las modificaciones a esta sesión?
            </p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={handleUpdateSession}
                disabled={formSaving}
                className="bg-[#53F000] text-black text-xs font-semibold px-4 py-2 rounded-md disabled:opacity-50 hover:bg-[#40d700]"
              >
                {formSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                onClick={() => setShowSaveConfirm(false)}
                disabled={formSaving}
                className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-500 text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
            {formError && <p className="text-red-600 dark:text-red-400 text-[11px] mt-2">{formError}</p>}
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl w-[340px] px-5 py-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Trash2 size={14} />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Eliminar sesión?</h3>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">Esta acción no se puede deshacer.</p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-[#C40000] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
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
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl w-[340px] px-5 py-4 text-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Trash2 size={14} />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Eliminar usuario?</h3>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">Esta acción no se puede deshacer. Se eliminará toda la información del usuario.</p>
            <div className="flex items-center gap-2 mt-4">
              <button
                onClick={() => usuarioDeleteId && handleDeleteUsuario(usuarioDeleteId)}
                className="bg-[#C40000] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
              <button
                onClick={() => setUsuarioDeleteId(null)}
                className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR PROPIA CUENTA */}
      {showDeleteAccountConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl w-[380px] px-6 py-5 text-xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-2.5">
                <AlertCircle size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Eliminar cuenta</h3>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-2">
              ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es permanente e irreversible.
            </p>
            <p className="text-[11px] text-gray-600 dark:text-gray-400 mb-5 font-semibold">
              Se eliminará:
            </p>
            <ul className="text-[10px] text-gray-600 dark:text-gray-400 mb-5 space-y-1 list-disc list-inside">
              <li>Tu perfil y datos personales</li>
              <li>Todas tus sesiones activas</li>
              <li>Tu historial en el sistema</li>
            </ul>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteOwnAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-md"
              >
                Sí, eliminar mi cuenta
              </button>
              <button
                onClick={() => setShowDeleteAccountConfirm(false)}
                className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR CERRAR SESIÓN */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl w-[320px] px-6 py-5 text-xs">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <LogOut size={14} />
              <p className="text-sm font-bold text-gray-900 dark:text-white">Cerrar Sesión?</p>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-400">¿Estás seguro de que deseas salir del panel de administrador?</p>
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={handleLogout}
                className="bg-[#C40000] text-white text-xs font-semibold py-2 rounded-md hover:bg-red-700"
              >
                CERRAR SESIÓN
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 text-xs font-semibold py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER DETALLES SESIÓN */}
      {viewingSesionId && sesiones.find(s => s.id === viewingSesionId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-[#1E293B] border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1A1B22] dark:text-white">Detalles de la Sesión</h2>
              </div>
              <button
                onClick={() => setViewingSesionId(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            {sesiones.find(s => s.id === viewingSesionId) && (() => {
              const sesion = sesiones.find(s => s.id === viewingSesionId)!
              return (
                <div className="p-6 space-y-5">
                  {/* Foto del Ponente */}
                  {sesion.foto_ponente && (
                    <div className="flex justify-center mb-4">
                      <img src={sesion.foto_ponente} alt={sesion.ponente} className="w-32 h-32 rounded-full object-cover border-4 border-[#0F6B44]" />
                    </div>
                  )}

                  {/* Información Principal */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Título de la Sesión</p>
                    <p className="text-sm font-bold text-[#1A1B22] dark:text-white">{sesion.titulo}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Conferencista</p>
                    <p className="text-sm text-[#1A1B22] dark:text-white">{sesion.ponente}</p>
                  </div>

                  {/* Información de Horario y Ubicación */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Fecha</p>
                      <p className="text-sm text-[#1A1B22] dark:text-white">{getNombreDia(sesion.dia)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Tipo</p>
                      <p className="text-sm text-[#1A1B22] dark:text-white">{sesion.tipo}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Hora Inicio</p>
                      <p className="text-sm text-[#1A1B22] dark:text-white">{formatTime12Hour(sesion.hora_inicio)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Hora Fin</p>
                      <p className="text-sm text-[#1A1B22] dark:text-white">{formatTime12Hour(sesion.hora_fin)}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Escenario</p>
                    <p className="text-sm text-[#1A1B22] dark:text-white">{sesion.lugar}</p>
                  </div>

                  {/* Cupos */}
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Cupos</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#0F6B44] dark:bg-[#10B981] h-full"
                          style={{ width: `${(sesion.cupos_ocupados / sesion.cupos_total) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm font-semibold text-[#1A1B22] dark:text-white">{sesion.cupos_ocupados}/{sesion.cupos_total}</p>
                    </div>
                  </div>

                  {/* Descripción */}
                  {sesion.descripcion && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase mb-1">Descripción</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{sesion.descripcion}</p>
                    </div>
                  )}

                  {/* Botón Cerrar */}
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => setViewingSesionId(null)}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* MODAL VER DETALLES USUARIO */}
      {viewingUserId && usuarios.find(u => u.id === viewingUserId) && (() => {
        const usuario = usuarios.find(u => u.id === viewingUserId)!
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-[420px] max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-[#1E293B] border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1A1B22] dark:text-white">Detalles del Usuario</h2>
                </div>
                <button
                  onClick={() => setViewingUserId(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#EAFBE2] dark:bg-[#10B981]/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-[#0F6B44] dark:text-[#10B981]">
                      {(usuario.full_name || usuario.username).split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1B22] dark:text-white">{usuario.full_name || "—"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{usuario.username}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Correo</p>
                    <p className="text-xs text-[#1A1B22] dark:text-white">{usuario.email}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Rol</p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-[10px] font-semibold ${
                        usuario.role === "admin"
                          ? "bg-[#EAFBE2] text-[#0F6B44]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}>
                        {usuario.role === "admin" ? "Admin" : "Alumno"}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Registrado</p>
                      <p className="text-xs text-[#1A1B22] dark:text-white mt-1">
                        {new Date(usuario.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  {usuario.carrera && (
                    <div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold uppercase">Carrera</p>
                      <p className="text-xs text-[#1A1B22] dark:text-white">{usuario.carrera}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setViewingUserId(null)
                      setEditingUserId(usuario.id)
                      setEditUserForm({
                        username: usuario.username,
                        email: usuario.email,
                        full_name: usuario.full_name || "",
                        carrera: usuario.carrera || "",
                        role: usuario.role,
                        password: "",
                        confirmPassword: "",
                      })
                      setEditUserFormError(null)
                      setShowEditUserForm(true)
                    }}
                    className="flex-1 bg-[#0F6B44] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#0d5a38]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setViewingUserId(null)}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* MODAL EDITAR USUARIO */}
      {showEditUserForm && editingUserId && (
        <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl w-[450px] px-6 py-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Editar Usuario</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Modifica los datos del usuario seleccionado</p>
              </div>
              <button
                onClick={() => {
                  setShowEditUserForm(false)
                  setEditingUserId(null)
                  setEditUserForm({ username: "", email: "", full_name: "", carrera: "", role: "alumno", password: "", confirmPassword: "" })
                  setEditUserFormError(null)
                }}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            </div>

            {editUserFormError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs rounded-lg px-4 py-3">
                {editUserFormError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Usuario</label>
                <input
                  type="text"
                  value={editUserForm.username}
                  onChange={(e) => setEditUserForm({ ...editUserForm, username: e.target.value })}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={editUserForm.email}
                  onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre Completo</label>
                <input
                  type="text"
                  value={editUserForm.full_name}
                  onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Carrera (Opcional)</label>
                <input
                  type="text"
                  value={editUserForm.carrera}
                  onChange={(e) => setEditUserForm({ ...editUserForm, carrera: e.target.value })}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Rol</label>
                <select
                  value={editUserForm.role}
                  onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                >
                  <option value="alumno">Alumno</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  value={editUserForm.password}
                  onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                  placeholder="Dejar vacío para mantener la actual"
                  className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                />
              </div>

              {editUserForm.password && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={editUserForm.confirmPassword}
                    onChange={(e) => setEditUserForm({ ...editUserForm, confirmPassword: e.target.value })}
                    placeholder="Confirmar contraseña"
                    className="w-full text-xs border border-gray-300 dark:border-gray-700 dark:bg-[#0F172A] dark:text-white rounded-lg px-3 py-2 mt-1 bg-gray-50 focus:outline-none focus:border-[#0F6B44]"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleUpdateUsuario}
                  disabled={editUserFormLoading}
                  className="flex-1 bg-[#0F6B44] text-white text-xs font-semibold py-2 rounded-lg disabled:opacity-50 hover:bg-[#0d5a38]"
                >
                  {editUserFormLoading ? "Guardando..." : "Guardar Cambios"}
                </button>
                <button
                  onClick={() => {
                    setShowEditUserForm(false)
                    setEditingUserId(null)
                    setEditUserForm({ username: "", email: "", full_name: "", carrera: "", role: "alumno", password: "", confirmPassword: "" })
                    setEditUserFormError(null)
                  }}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
              </div>
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
                <button onClick={() => setShowNotifications(false)} className="text-white hover:bg-white/20 p-1 rounded cursor-pointer">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto">
              <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#0F6B44] rounded-full mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#1A1B22] dark:text-white">Nueva sesión creada</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Se ha agregado una nueva sesión académica al evento.</p>
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
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">La sesión Programación Web React ha alcanzado el 80% de su capacidad.</p>
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