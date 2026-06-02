"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Volume2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"

interface Sesion {
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
}

type EstadoAsistente = "inactivo" | "escuchando" | "procesando" | "respondiendo"

export default function VoiceAssistant() {
  const [estado, setEstado] = useState<EstadoAsistente>("inactivo")
  const [transcripcion, setTranscripcion] = useState("")
  const [respuesta, setRespuesta] = useState("")
  const [mostrarPanel, setMostrarPanel] = useState(false)
  const [sesionesHoy, setSesionesHoy] = useState<Sesion[]>([])
  const [todasSesiones, setTodasSesiones] = useState<Sesion[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [sesionesInscritas, setSesionesInscritas] = useState<Set<string>>(new Set())
  const [sesionSugerida, setSesionSugerida] = useState<Sesion | null>(null)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const estadoRef = useRef<EstadoAsistente>("inactivo")
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("Speech Recognition no soportado en este navegador")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "es-MX"

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("")
      setTranscripcion(transcript)

      if (event.results[0].isFinal) {
        procesarComando(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      const codigo = event.error || "desconocido"
      console.error("Error en reconocimiento de voz:", codigo)
      if (codigo === "not-allowed") {
        setErrorMensaje("Permiso de micrófono denegado")
      } else if (codigo === "network") {
        setErrorMensaje("Error de red en el reconocimiento de voz. Verificá tu conexión o usá Chrome.")
      } else {
        setErrorMensaje(`Error de reconocimiento (${codigo}). Intentá de nuevo.`)
      }
      estadoRef.current = "inactivo"
      setEstado("inactivo")
      setTranscripcion("")
      toast.error(errorMensaje || "Error en el reconocimiento de voz")
      setErrorMensaje(null)
    }

    recognition.onend = () => {
      if (estadoRef.current === "escuchando") {
        estadoRef.current = "inactivo"
        setEstado("inactivo")
        setTranscripcion("")
      }
    }

    recognitionRef.current = recognition
    synthRef.current = window.speechSynthesis
  }, [])

  useEffect(() => {
    estadoRef.current = estado
  }, [estado])

  useEffect(() => {
    async function cargarDatos() {
      try {
        const resUser = await fetch("/api/auth/me", { cache: "no-store" })
        const dataUser = await resUser.json()
        const uid = dataUser.user?.id || null
        setUserId(uid)

        const [resAll, resInscritas] = await Promise.all([
          fetch("/api/sesiones", { cache: "no-store" }),
          uid ? fetch(`/api/usuarios/mis-sesiones?userId=${uid}`, { cache: "no-store" }) : null,
        ])

        const dataAll = await resAll.json()
        const todas: Sesion[] = Array.isArray((dataAll as any).data) ? ((dataAll as any).data as Sesion[]) : []
        console.log("[VoiceAssistant] /api/sesiones total:", todas.length)
        setTodasSesiones(todas)

        const hoy = new Date().toISOString().split("T")[0]
        setSesionesHoy(todas.filter((s) => s.dia === hoy))

        if (resInscritas) {
          const dataInscritas = await resInscritas.json()
          const inscritas: Sesion[] = Array.isArray((dataInscritas as any).data) ? ((dataInscritas as any).data as Sesion[]) : []
          console.log("[VoiceAssistant] /api/usuarios/mis-sesiones total:", inscritas.length, inscritas.map((s) => s.titulo))
          setSesionesInscritas(new Set(inscritas.map((s) => s.id)))
        }
      } catch (error) {
        console.error("Error cargando datos del asistente:", error)
      }
    }

    cargarDatos()
  }, [])

  function hablar(texto: string) {
    if (!synthRef.current) return
    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = "es-MX"
    utterance.rate = 1
    utterance.pitch = 1
    synthRef.current.speak(utterance)
  }

  function normalizar(texto: string): string {
    return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }

  function detectarDia(texto: string): string | null {
    const normalizado = normalizar(texto)
    const dias: Record<string, string> = {
      lunes: "Lunes",
      martes: "Martes",
      miercoles: "Miércoles",
      miércoles: "Miércoles",
      jueves: "Jueves",
      viernes: "Viernes",
      sabado: "Sábado",
      sábado: "Sábado",
      domingo: "Domingo",
      hoy: new Date().toISOString().split("T")[0],
      mañana: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    }

    for (const [clave, valor] of Object.entries(dias)) {
      if (normalizado.includes(clave)) {
        return valor
      }
    }
    return null
  }

  function getDiaSemanaNum(fecha: string): number {
    const d = new Date(fecha)
    const year = d.getUTCFullYear()
    const month = d.getUTCMonth()
    const day = d.getUTCDate()
    const local = new Date(year, month, day)
    return local.getDay()
  }

  function obtenerSesionesPorDia(dia: string | null): Sesion[] {
    if (!dia) return sesionesHoy

    const mapaDiaNum: Record<string, number> = {
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
      Domingo: 0,
    }

    if (mapaDiaNum[dia]) {
      const numDia = mapaDiaNum[dia]
      return todasSesiones.filter((s) => getDiaSemanaNum(s.dia) === numDia)
    }

    return todasSesiones.filter((s) => s.dia === dia)
  }

  async function procesarComando(texto: string) {
    setEstado("procesando")
    const normalizado = normalizar(texto)

    console.log("[VoiceAssistant] Texto normalizado:", normalizado)
    console.log("[VoiceAssistant] Sesiones cargadas:", todasSesiones.length)

    // Comando: Mi agenda / mis sesiones (chequeo PRIMERO para no confundir con consulta general)
    if (normalizado.includes("mi agenda") || normalizado.includes("mis sesiones") || normalizado.includes("que tengo agendado") || normalizado.includes("qué tengo agendado") || normalizado.includes("sesiones agendadas") || normalizado.includes("sesiones registradas")) {
      const misSesiones = todasSesiones.filter((s) => sesionesInscritas.has(s.id))
      console.log("[VoiceAssistant] Mis sesiones inscritas:", misSesiones.length)
      if (misSesiones.length === 0) {
        const respuestaTexto = "No tienes sesiones agendadas en tu agenda."
        setRespuesta(respuestaTexto)
        setEstado("respondiendo")
        hablar(respuestaTexto)
      } else {
        const respuestaTexto = `Tienes ${misSesiones.length} sesiones agendadas. ${misSesiones.map((s, i) => `La ${i + 1}: ${s.titulo}, el día ${s.dia}.`).join(" ")}`
        setRespuesta(respuestaTexto)
        setEstado("respondiendo")
        hablar(respuestaTexto)
      }
      return
    }

    const esConsultaSesiones =
      /\b(que|qué|cuales|cuáles)\b/.test(normalizado) ||
      /\b(sesiones|eventos|actividades)\b/.test(normalizado) ||
      /\b(hoy|mañana|pasado mañana)\b/.test(normalizado) ||
      /\b(lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado|domingo)\b/.test(normalizado)

    if (esConsultaSesiones) {
      const dia = detectarDia(texto)
      console.log("[VoiceAssistant] Día detectado:", dia)
      const sesiones = obtenerSesionesPorDia(dia)
      console.log("[VoiceAssistant] Sesiones encontradas:", sesiones.length)

      if (sesiones.length === 0) {
        const respuestaTexto = dia ? `No encontré sesiones para ${dia}.` : "No encontré sesiones para hoy."
        setRespuesta(respuestaTexto)
        setEstado("respondiendo")
        hablar(respuestaTexto)
      } else {
        const nombreDia = dia ? `para ${dia}` : "para hoy"
        const detalle = sesiones
          .slice(0, 3)
          .map((s, i) => {
            const textoFecha = s.dia
              ? ` el día ${new Date(s.dia).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`
              : ""
            return `La ${i + 1}: ${s.titulo}${textoFecha}, de ${s.hora_inicio} a ${s.hora_fin}.`
          })
          .join(" ")
        const respuestaTexto = `Hay ${sesiones.length} sesiones ${nombreDia}. ${detalle}${sesiones.length > 3 ? ` Y ${sesiones.length - 3} más.` : ""} ¿Quieres agregar alguna a tu agenda?`
        setRespuesta(respuestaTexto)
        setSesionSugerida(sesiones[0])
        setEstado("respondiendo")
        hablar(respuestaTexto)
      }
      return
    }

    // Comando: Agregar [sesión] a mi agenda / inscribir [sesión]
    if (normalizado.includes("agregar") || normalizado.includes("agenda") || normalizado.includes("inscribir") || normalizado.includes("anotar")) {
      const textoBusqueda = normalizado
        .replace(/agregar?/g, "")
        .replace(/a mi agenda/g, "")
        .replace(/inscribir/g, "")
        .replace(/anotar/g, "")
        .replace(/la sesion/g, "")
        .replace(/la/g, "")
        .trim()

      const sesionEncontrada = todasSesiones.find((s) => normalizar(s.titulo).includes(textoBusqueda) || textoBusqueda.includes(normalizar(s.titulo)))

      if (sesionEncontrada) {
        if (sesionesInscritas.has(sesionEncontrada.id)) {
          const respuestaTexto = `Ya tienes agendada la sesión "${sesionEncontrada.titulo}".`
          setRespuesta(respuestaTexto)
          setSesionSugerida(null)
          setEstado("respondiendo")
          hablar(respuestaTexto)
        } else {
          setSesionSugerida(sesionEncontrada)
          const respuestaTexto = `Encontré la sesión "${sesionEncontrada.titulo}" de ${sesionEncontrada.hora_inicio} a ${sesionEncontrada.hora_fin}. ¿Quieres que la agregue a tu agenda?`
          setRespuesta(respuestaTexto)
          setEstado("respondiendo")
          hablar(respuestaTexto)
        }
      } else {
        const respuestaTexto = "No encontré ninguna sesión con ese nombre. ¿Puedes repetirlo?"
        setRespuesta(respuestaTexto)
        setSesionSugerida(null)
        setEstado("respondiendo")
        hablar(respuestaTexto)
      }
      return
    }

    // Comando: Sí / confirmar agregar
    if (normalizado.includes("si") || normalizado.includes("sí") || normalizado.includes("claro") || normalizado.includes("por favor") || normalizado.includes("agregala") || normalizado.includes("agrégalo") || normalizado.includes("ok")) {
      if (sesionSugerida && userId) {
        await inscribirSesion(sesionSugerida.id)
        setSesionSugerida(null)
        return
      }
    }

    // Comando: No / cancelar
    if (normalizado.includes("no") || normalizado.includes("cancelar") || normalizado.includes("no gracias")) {
      const respuestaTexto = "Entendido, no hay problema."
      setRespuesta(respuestaTexto)
      setSesionSugerida(null)
      setEstado("respondiendo")
      hablar(respuestaTexto)
      return
    }

    const respuestaTexto = "No entendí ese comando. Puedes preguntar qué sesiones hay hoy, o pedir agregar una a tu agenda."
    setRespuesta(respuestaTexto)
    setEstado("respondiendo")
    hablar(respuestaTexto)
  }

  async function inscribirSesion(sesionId: string) {
    if (!userId) {
      const respuestaTexto = "Debes iniciar sesión para agendar sesiones."
      setRespuesta(respuestaTexto)
      setEstado("respondiendo")
      hablar(respuestaTexto)
      toast.error("Debes iniciar sesión para agendar sesiones")
      return
    }

    try {
      const res = await fetch(`/api/sesiones/${sesionId}/inscribir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      if (res.ok) {
        setSesionesInscritas((prev) => new Set([...prev, sesionId]))
        const sesion = todasSesiones.find((s) => s.id === sesionId)
        const respuestaTexto = `Perfecto, agendé "${sesion?.titulo}" en tu agenda.`
        setRespuesta(respuestaTexto)
        setEstado("respondiendo")
        hablar(respuestaTexto)
        toast.success(`Agendaste: ${sesion?.titulo}`)
      } else {
        const error = await res.json()
        const respuestaTexto = `Error al agendar: ${error.error || "No se pudo agregar la sesión."}`
        setRespuesta(respuestaTexto)
        setEstado("respondiendo")
        hablar(respuestaTexto)
      }
    } catch (error) {
      console.error("Error al inscribirse:", error)
      const respuestaTexto = "Hubo un error al intentar agendar la sesión."
      setRespuesta(respuestaTexto)
      setEstado("respondiendo")
      hablar(respuestaTexto)
    }
  }

  function iniciarEscucha() {
    if (!recognitionRef.current) {
      toast.error("Tu navegador no soporta reconocimiento de voz")
      return
    }
    setMostrarPanel(true)
    setEstado("escuchando")
    setTranscripcion("")
    setRespuesta("")
    setSesionSugerida(null)
    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error("Error al iniciar reconocimiento:", error)
      setEstado("inactivo")
    }
  }

  function detenerEscucha() {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setEstado("inactivo")
    setTranscripcion("")
    setRespuesta("")
    setSesionSugerida(null)
  }

  function cerrarPanel() {
    detenerEscucha()
    setMostrarPanel(false)
  }

  return (
    <>
      {/* Botón flotante del asistente */}
      <button
        onClick={mostrarPanel ? cerrarPanel : () => setMostrarPanel(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{ backgroundColor: "#065F46" }}
        aria-label="Asistente de voz"
      >
        <Volume2 size={24} className="text-white" />
      </button>

      {/* Panel del asistente */}
      {mostrarPanel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={cerrarPanel}>
          <Card
            ref={panelRef}
            className="w-full max-w-md p-6 dark:bg-[#1E293B] border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${estado === "escuchando" ? "bg-red-500 animate-pulse" : estado === "respondiendo" ? "bg-green-500" : estado === "procesando" ? "bg-yellow-500" : "bg-gray-400"}`} />
                <h3 className="font-bold text-gray-900 dark:text-white">Asistente de Voz</h3>
              </div>
              <button onClick={cerrarPanel} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                <X size={20} />
              </button>
            </div>

            {/* Estado */}
            <div className="mb-4">
              {estado === "inactivo" && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Presiona el micrófono y pregunta por las sesiones del día, o pide agregar una a tu agenda.
                </p>
              )}
              {estado === "escuchando" && (
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Escuchando... habla ahora
                </p>
              )}
              {estado === "procesando" && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  Procesando tu petición...
                </p>
              )}
              {estado === "respondiendo" && (
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Respondiendo...
                </p>
              )}
            </div>

            {/* Transcripción */}
            {transcripcion && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tú dijiste:</p>
                <p className="text-sm text-gray-900 dark:text-white italic">"{transcripcion}"</p>
              </div>
            )}

            {/* Respuesta */}
            {respuesta && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Asistente:</p>
                <p className="text-sm text-gray-900 dark:text-white">{respuesta}</p>
              </div>
            )}

            {/* Botón de acción para agregar sesión sugerida */}
            {sesionSugerida && estado === "respondiendo" && (
              <div className="mb-4">
                <Button
                  onClick={async () => {
                    await inscribirSesion(sesionSugerida.id)
                    setSesionSugerida(null)
                  }}
                  className="w-full"
                  style={{ backgroundColor: "#065F46" }}
                >
                  Agregar "{sesionSugerida.titulo}" a mi agenda
                </Button>
              </div>
            )}

            {/* Controles */}
            <div className="flex gap-2">
              {estado !== "escuchando" ? (
                <Button
                  onClick={iniciarEscucha}
                  className="flex-1 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#065F46" }}
                >
                  <Mic size={18} />
                  Hablar
                </Button>
              ) : (
                <Button
                  onClick={detenerEscucha}
                  variant="destructive"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <MicOff size={18} />
                  Detener
                </Button>
              )}
            </div>

            {/* Ayuda */}
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p className="font-semibold mb-1">Comandos de voz:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>"Qué sesiones hay hoy"</li>
                <li>"Sesiones del lunes"</li>
                <li>"Sesiones del martes"</li>
                <li>"Qué hay el miércoles"</li>
                <li>"Agregar [título] a mi agenda"</li>
                <li>"Mis sesiones agendadas"</li>
              </ul>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
