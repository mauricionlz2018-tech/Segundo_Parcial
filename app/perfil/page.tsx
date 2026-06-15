"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ArrowLeft, Mail, User, BookOpen, Trash2, Save, LogOut, Clock, MapPin, CalendarDays, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { Sesion } from "@/types"
import { formatTime12Hour, formatDate } from "@/lib/utils"

interface Usuario {
  id: string
  email: string
  username: string
  full_name: string | null
  carrera: string | null
  role: string
  created_at: string
}

export default function PerfilPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [sesionesRegistradas, setSesionesRegistradas] = useState<Sesion[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSesiones, setLoadingSesiones] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("")
  const [removingSesion, setRemovingSesion] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: "",
    carrera: "",
  })

  useEffect(() => {
    async function loadPerfil() {
      try {
        const res = await fetch("/api/users")
        if (!res.ok) {
          router.push("/auth/login")
          return
        }
        const data = await res.json()
        setUsuario(data.user)
        setFormData({
          full_name: data.user.full_name || "",
          carrera: data.user.carrera || "",
        })
      } catch (error) {
        console.error("Error al cargar perfil:", error)
        toast.error("Error al cargar tu perfil")
      } finally {
        setLoading(false)
      }
    }

    loadPerfil()
  }, [router])

  // Cargar sesiones registradas
  useEffect(() => {
    async function loadSesiones() {
      try {
        setLoadingSesiones(true)
        const res = await fetch("/api/sesiones/registro")
        if (res.ok) {
          const data = await res.json()
          setSesionesRegistradas(data.data || [])
        }
      } catch (error) {
        console.error("Error cargando sesiones:", error)
      } finally {
        setLoadingSesiones(false)
      }
    }

    loadSesiones()
  }, [])

  async function handleSave() {
    if (!formData.full_name.trim()) {
      toast.error("El nombre completo es requerido")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al guardar" }))
        toast.error(err.error || "Error al guardar los cambios")
        return
      }

      setUsuario({
        ...usuario!,
        ...formData,
      })
      setEditMode(false)
      toast.success("Perfil actualizado exitosamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (deleteConfirmEmail !== usuario?.email) {
      toast.error("Email de confirmación incorrecto")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm_email: deleteConfirmEmail }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error al eliminar" }))
        toast.error(err.error || "Error al eliminar tu cuenta")
        return
      }

      toast.success("Cuenta eliminada exitosamente")
      // Redirigir a logout
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar tu cuenta")
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoverSesion(sesionId: string) {
    setRemovingSesion(sesionId)
    try {
      const res = await fetch(`/api/sesiones/${sesionId}/registro`, {
        method: "DELETE",
      })

      if (res.ok) {
        setSesionesRegistradas(sesionesRegistradas.filter((s) => s.id !== sesionId))
        toast.success("Te desregistraste de la sesión")
      } else {
        toast.error("Error al desregistrarse")
      }
    } catch (error) {
      toast.error("Error al desregistrarse")
    } finally {
      setRemovingSesion(null)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="pt-20 flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#0F6B44", borderTopColor: "transparent" }} />
        </div>
      </main>
    )
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="pt-20 flex items-center justify-center h-[400px]">
          <div className="text-center">
            <p className="text-gray-500">Error al cargar tu perfil</p>
            <Link href="/" className="text-[#065F46] font-semibold hover:underline mt-2 inline-block cursor-pointer">
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <div className="pt-20 pb-20">
        <div className="max-w-2xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition cursor-pointer">
                <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-[#1A1B22] dark:text-white">Mi Perfil</h1>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-6">
            {/* Avatar */}
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#64FC05" }}>
                <User size={28} className="text-black" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  Usuario
                </p>
                <h2 className="text-xl font-bold text-[#1A1B22] dark:text-white">{usuario.username}</h2>
              </div>
              {usuario.role === "admin" && (
                <div className="ml-auto px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: "#064E3B" }}>
                  Admin
                </div>
              )}
            </div>

            {/* Info sections */}
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2 text-[#1A1B22] dark:text-white">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm">{usuario.email}</span>
                </div>
              </div>

              {/* Nombre Completo - Editable */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                  Nombre Completo
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Nombre completo"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-[#1A1B22] dark:text-white focus:outline-none focus:border-[#065F46]"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[#1A1B22] dark:text-white">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm">{usuario.full_name || "No especificado"}</span>
                  </div>
                )}
              </div>

              {/* Carrera - Editable */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                  Carrera
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={formData.carrera}
                    onChange={(e) =>
                      setFormData({ ...formData, carrera: e.target.value })
                    }
                    placeholder="Tu carrera"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-[#1A1B22] dark:text-white focus:outline-none focus:border-[#065F46]"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-[#1A1B22] dark:text-white">
                    <BookOpen size={16} className="text-gray-400" />
                    <span className="text-sm">{usuario.carrera || "No especificada"}</span>
                  </div>
                )}
              </div>

              {/* Fecha de registro */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                  Miembro desde
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(usuario.created_at).toLocaleDateString("es-MX", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-2 flex-wrap">
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50 cursor-pointer"
                    style={{ backgroundColor: "#065F46" }}
                  >
                    <Save size={16} />
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false)
                      setFormData({
                        full_name: usuario.full_name || "",
                        carrera: usuario.carrera || "",
                      })
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition cursor-pointer"
                style={{ backgroundColor: "#065F46" }}
              >
                <User size={16} />
                Editar Perfil
              </button>
              )}
            </div>
          </div>

          {/* Mis Sesiones Registradas */}
          {usuario.role !== "admin" && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-6">
              <h2 className="text-xl font-bold text-[#1A1B22] dark:text-white mb-6 flex items-center gap-2">
                <CalendarDays size={24} />
                Mis Sesiones Registradas
              </h2>

              {loadingSesiones ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#065F46", borderTopColor: "transparent" }} />
                </div>
              ) : sesionesRegistradas.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen size={32} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No has registrado ninguna sesión aún</p>
                  <Link href="/cronograma" className="text-[#065F46] dark:text-[#10B981] font-semibold hover:underline mt-2 inline-block">
                    Ver cronograma →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {sesionesRegistradas.map((sesion) => (
                    <div key={sesion.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1A1B22] dark:text-white mb-2">
                          {sesion.titulo}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <CalendarDays size={14} />
                            {formatDate(sesion.dia)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatTime12Hour(sesion.hora_inicio)} - {formatTime12Hour(sesion.hora_fin)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {sesion.lugar}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoverSesion(sesion.id)}
                        disabled={removingSesion === sesion.id}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50 text-red-600 dark:text-red-400 cursor-pointer"
                        title="Desregistrarse"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Danger Zone */}
          {!editMode && (
            <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/50 p-8">
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Eliminar Cuenta</h3>
              <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                Una vez que elimines tu cuenta, no hay forma de recuperarla. Por favor sé cuidadoso.
              </p>

              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                      Confirma con tu email para eliminar:
                    </label>
                    <input
                      type="email"
                      value={deleteConfirmEmail}
                      onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                      placeholder={usuario.email}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-[#1A1B22] dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={saving || deleteConfirmEmail !== usuario.email}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
                    >
                      <LogOut size={16} />
                      {saving ? "Eliminando..." : "Sí, Eliminar Mi Cuenta"}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmEmail("")
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition cursor-pointer"
                >
                  <Trash2 size={16} />
                  Eliminar Mi Cuenta
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
