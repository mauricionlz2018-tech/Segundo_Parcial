"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner"
import { Clock, MapPin, User, Trash2, RotateCw } from "lucide-react"
import { formatTime12Hour, formatDate } from "@/lib/utils"
import { toast } from "sonner"

interface Sesion {
  id: string
  titulo: string
  ponente: string
  perfil_profesional: string
  afiliacion: string
  dia: string
  hora_inicio: string
  hora_fin: string
  tipo: string
  lugar: string
  cupos_total: number
  cupos_ocupados: number
  descripcion: string | null
  inscrito?: boolean
}

const tipoBadge: Record<string, { bg: string; text: string }> = {
  Conferencia: { bg: "bg-blue-600", text: "text-white" },
  Taller: { bg: "bg-purple-600", text: "text-white" },
  Panel: { bg: "bg-green-600", text: "text-white" },
  Seminario: { bg: "bg-orange-600", text: "text-white" },
  "Mesa redonda": { bg: "bg-red-600", text: "text-white" },
}

export default function SesionesPage() {
  const router = useRouter()
  const [sesionesDisponibles, setSesionesDisponibles] = useState<Sesion[]>([])
  const [sesionesInscritas, setSesionesInscritas] = useState<Sesion[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Sesion | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState<string>("")

  // Obtener usuario actual
  useEffect(() => {
    async function getUser() {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.user && data.user.id) {
          console.log("✅ Usuario obtenido:", data.user.id)
          setUserId(data.user.id)
        } else {
          console.log("❌ No hay usuario:", data)
          router.push("/auth/login")
        }
      } catch (err) {
        console.error("❌ Error obteniendo usuario:", err)
        router.push("/auth/login")
      }
    }
    getUser()
  }, [router])

  // Cargar sesiones cuando se obtiene el userId
  useEffect(() => {
    if (!userId) return

    async function cargarSesiones() {
      setLoading(true)
      try {
        // Sesiones disponibles
        const resDisponibles = await fetch(
          `/api/sesiones/disponibles?userId=${userId}${filtroTipo ? `&tipo=${filtroTipo}` : ""}`
        )
        const dataDisponibles = await resDisponibles.json()
        setSesionesDisponibles(dataDisponibles.data || [])

        // Sesiones inscritas
        const resInscritas = await fetch(`/api/usuarios/mis-sesiones?userId=${userId}`)
        const dataInscritas = await resInscritas.json()
        setSesionesInscritas(dataInscritas.data || [])
      } catch (error) {
        console.error("Error cargando sesiones:", error)
      } finally {
        setLoading(false)
      }
    }

    cargarSesiones()
  }, [userId, filtroTipo])

  const handleInscribir = async (sesion: Sesion) => {
    if (!userId) return
    setProcesando(true)
    try {
      const res = await fetch(`/api/sesiones/${sesion.id}/inscribir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        // Recargar sesiones desde BD
        const resDisponibles = await fetch(
          `/api/sesiones/disponibles?userId=${userId}${filtroTipo ? `&tipo=${filtroTipo}` : ""}`
        )
        const dataDisponibles = await resDisponibles.json()
        setSesionesDisponibles(dataDisponibles.data || [])

        const resInscritas = await fetch(`/api/usuarios/mis-sesiones?userId=${userId}`)
        const dataInscritas = await resInscritas.json()
        setSesionesInscritas(dataInscritas.data || [])
        
        toast.success("¡Inscripción exitosa!")
      } else {
        const error = await res.json()
        toast.error(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error al inscribirse:", error)
      toast.error("Error al inscribirse")
    } finally {
      setProcesando(false)
    }
  }

  const handleDesinscribir = async (sesion: Sesion) => {
    if (!userId) return
    setProcesando(true)
    try {
      const res = await fetch(
        `/api/sesiones/${sesion.id}/inscribir?userId=${userId}`,
        { method: "DELETE" }
      )

      if (res.ok) {
        // Recargar sesiones desde BD
        const resDisponibles = await fetch(
          `/api/sesiones/disponibles?userId=${userId}${filtroTipo ? `&tipo=${filtroTipo}` : ""}`
        )
        const dataDisponibles = await resDisponibles.json()
        setSesionesDisponibles(dataDisponibles.data || [])

        const resInscritas = await fetch(`/api/usuarios/mis-sesiones?userId=${userId}`)
        const dataInscritas = await resInscritas.json()
        setSesionesInscritas(dataInscritas.data || [])

        setConfirmDelete(null)
        toast.success("¡Desinscripción exitosa!")
      } else {
        toast.error("Error al desinscribirse")
      }
    } catch (error) {
      console.error("Error al desinscribirse:", error)
      toast.error("Error al desinscribirse")
    } finally {
      setProcesando(false)
    }
  }

  const porcentajeCupos = (sesion: Sesion) =>
    Math.round((sesion.cupos_ocupados / sesion.cupos_total) * 100)

  const recargarSesiones = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const resDisponibles = await fetch(
        `/api/sesiones/disponibles?userId=${userId}${filtroTipo ? `&tipo=${filtroTipo}` : ""}`,
        { cache: "no-store" }
      )
      const dataDisponibles = await resDisponibles.json()
      setSesionesDisponibles(dataDisponibles.data || [])

      const resInscritas = await fetch(
        `/api/usuarios/mis-sesiones?userId=${userId}`,
        { cache: "no-store" }
      )
      const dataInscritas = await resInscritas.json()
      setSesionesInscritas(dataInscritas.data || [])
    } catch (error) {
      console.error("Error recargando sesiones:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] flex items-center justify-center">
          <Spinner />
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Sesiones Académicas
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Explora y únete a las sesiones que te interesen
              </p>
            </div>
            <Button
              onClick={recargarSesiones}
              disabled={loading}
              variant="outline"
              className="whitespace-nowrap"
            >
              <RotateCw size={18} className="mr-2" />
              Recargar
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="disponibles" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="disponibles">
                Disponibles ({sesionesDisponibles.length})
              </TabsTrigger>
              <TabsTrigger value="inscritas">
                Mis Sesiones ({sesionesInscritas.length})
              </TabsTrigger>
            </TabsList>

            {/* Sesiones Disponibles */}
            <TabsContent value="disponibles" className="mt-8">
              {/* Filtro */}
              <div className="mb-6 flex gap-2 flex-wrap">
                <Button
                  variant={filtroTipo === "" ? "default" : "outline"}
                  onClick={() => setFiltroTipo("")}
                >
                  Todas
                </Button>
                {["Conferencia", "Taller", "Panel", "Seminario", "Mesa redonda"].map(
                  tipo => (
                    <Button
                      key={tipo}
                      variant={filtroTipo === tipo ? "default" : "outline"}
                      onClick={() => setFiltroTipo(tipo)}
                    >
                      {tipo}
                    </Button>
                  )
                )}
              </div>

              {/* Lista de sesiones */}
              <div className="grid gap-6">
                {sesionesDisponibles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      No hay sesiones disponibles con ese filtro
                    </p>
                  </div>
                ) : (
                  sesionesDisponibles.map(sesion => (
                    <Card
                      key={sesion.id}
                      className="p-6 hover:shadow-lg transition dark:bg-[#1E293B] border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          {/* Tipo y Cupos */}
                          <div className="flex gap-2 items-center mb-3">
                            <Badge
                              className={`${tipoBadge[sesion.tipo]?.bg || "bg-gray-500"} ${tipoBadge[sesion.tipo]?.text || "text-white"}`}
                            >
                              {sesion.tipo}
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {sesion.cupos_total - sesion.cupos_ocupados} cupos libres
                            </span>
                          </div>

                          {/* Título */}
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            {sesion.titulo}
                          </h3>

                          {/* Ponente */}
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <User className="inline mr-1" size={16} />
                              <strong>{sesion.ponente}</strong>
                            </p>
                            {sesion.perfil_profesional && (
                              <p className="text-xs text-gray-500 dark:text-gray-500 ml-5">
                                {sesion.perfil_profesional}
                              </p>
                            )}
                          </div>

                          {/* Detalles */}
                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock size={16} />
                              {formatTime12Hour(sesion.hora_inicio)} - {formatTime12Hour(sesion.hora_fin)}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <MapPin size={16} />
                              {sesion.lugar}
                            </div>
                          </div>

                          {/* Descripción */}
                          {sesion.descripcion && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              {sesion.descripcion}
                            </p>
                          )}

                          {/* Barra de cupos */}
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-green-500 h-full"
                              style={{ width: `${porcentajeCupos(sesion)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {sesion.cupos_ocupados}/{sesion.cupos_total} inscritos
                          </p>
                        </div>

                        {/* Botón */}
                        <Button
                          onClick={() => handleInscribir(sesion)}
                          disabled={
                            procesando ||
                            sesion.cupos_ocupados >= sesion.cupos_total ||
                            sesion.inscrito
                          }
                          className="whitespace-nowrap"
                        >
                          {sesion.inscrito ? "Inscrito" : "Inscribirse"}
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Mis Sesiones Inscritas */}
            <TabsContent value="inscritas" className="mt-8">
              <div className="grid gap-6">
                {sesionesInscritas.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Aún no estás inscrito en ninguna sesión
                    </p>
                    <Button onClick={() => document.querySelector('[value="disponibles"]')?.click?.()}>
                      Explorar sesiones
                    </Button>
                  </div>
                ) : (
                  sesionesInscritas.map(sesion => (
                    <Card
                      key={sesion.id}
                      className="p-6 hover:shadow-lg transition dark:bg-[#1E293B] border-l-4 border-l-green-500 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex gap-2 items-center mb-3">
                            <Badge className="bg-green-600 text-white">✓ Inscrito</Badge>
                            <Badge
                              className={`${tipoBadge[sesion.tipo]?.bg || "bg-gray-500"} ${tipoBadge[sesion.tipo]?.text || "text-white"}`}
                            >
                              {sesion.tipo}
                            </Badge>
                          </div>

                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                            {sesion.titulo}
                          </h3>

                          <div className="mb-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <User className="inline mr-1" size={16} />
                              <strong>{sesion.ponente}</strong>
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Clock size={16} />
                              {formatDate(sesion.dia)} - {formatTime12Hour(sesion.hora_inicio)}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <MapPin size={16} />
                              {sesion.lugar}
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="destructive"
                          onClick={() => setConfirmDelete(sesion)}
                          disabled={procesando}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog de confirmación */}
      {confirmDelete && (
        <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <AlertDialogContent>
            <AlertDialogTitle>Desinscribirse</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres desinscribirte de{" "}
              <strong>{confirmDelete.titulo}</strong>?
            </AlertDialogDescription>
            <div className="flex gap-2 justify-end">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDesinscribir(confirmDelete)}
                className="bg-red-600 text-white"
              >
                Desinscribir
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Footer />
    </>
  )
}
