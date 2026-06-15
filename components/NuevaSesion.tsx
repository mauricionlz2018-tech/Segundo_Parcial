"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Upload, AlertTriangle } from "lucide-react"
import type { Sesion, SesionFormData } from "@/types"

interface Espacio {
  id: string
  nombre: string
  descripcion: string | null
  capacidad_maxima: number
}

interface NuevaSesionProps {
  onClose: () => void
  onSave: (data: SesionFormData) => Promise<void>
  sesiones: Sesion[]
}

interface FormState { 
  titulo: string
  tipo: string
  dia: string
  hora_inicio: string
  hora_fin: string
  cupos_total: number | ""
  lugar: string
  descripcion: string
  ponente: string
  perfil_profesional: string
  afiliacion: string
  biografia: string
}

const EMPTY_FORM: FormState = {
  titulo: "", tipo: "Conferencia", dia: "", hora_inicio: "",
  hora_fin: "", cupos_total: "", lugar: "", descripcion: "",
  ponente: "", perfil_profesional: "", afiliacion: "", biografia: "",
}

function toMinutes(time: string): number {
  const parts = String(time).split(":")
  const hh = Number(parts[0] ?? 0)
  const mm = Number(parts[1] ?? 0)
  return hh * 60 + mm
}

export default function NuevaSesion({ onClose, onSave, sesiones }: NuevaSesionProps) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM, dia: todayStr })
  const [speakerPhotoUrl, setSpeakerPhotoUrl] = useState<string | null>(null)
  const [speakerPhotoBase64, setSpeakerPhotoBase64] = useState<string | null>(null)
  const [institutionLogoUrl, setInstitutionLogoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [espacios, setEspacios] = useState<Espacio[]>([])
  const [espaciosLoading, setEspaciosLoading] = useState(true)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    async function fetchEspacios() {
      try {
        const response = await fetch("/api/espacios")
        const data = await response.json()
        setEspacios(data.data || [])
      } catch (err) {
        console.error("Error al cargar espacios:", err)
        setEspacios([])
      } finally {
        setEspaciosLoading(false)
      }
    }
    fetchEspacios()
  }, [])

  const conflict = useMemo(() => {
    if (!form.lugar || !form.hora_inicio || !form.hora_fin || !form.dia) return null
    const start = toMinutes(form.hora_inicio)
    const end = toMinutes(form.hora_fin)
    if (start >= end) return null
    const conflicting = sesiones.find((s) => {
      if (s.lugar.toLowerCase() !== form.lugar.toLowerCase() || s.dia !== form.dia) return false
      const existingStart = toMinutes(s.hora_inicio)
      const existingEnd = toMinutes(s.hora_fin)
      return start < existingEnd && end > existingStart
    })
    if (conflicting) {
      return `Conflicto detectado: El ${form.lugar} ya está ocupado de ${conflicting.hora_inicio} a ${conflicting.hora_fin} hrs. Seleccione otro horario o escenario.`
    }
    return null
  }, [form.lugar, form.hora_inicio, form.hora_fin, form.dia, sesiones])

  function handleSpeakerPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSpeakerPhotoUrl(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64String = event.target?.result as string
      setSpeakerPhotoBase64(base64String)
    }
    reader.readAsDataURL(file)
  }

  function handleInstitutionLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setInstitutionLogoUrl(URL.createObjectURL(file))
  }

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.value
      setForm((f) => ({ ...f, [field]: val }))
    }
  }

  function handleCuposChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    const numVal = val === "" ? "" : Number(val)
    setForm((f) => ({ ...f, cupos_total: numVal }))
  }

  async function handleSubmit() {
    if (!form.titulo.trim() || !form.ponente.trim()) {
      setError("El nombre de la sesión y el conferencista son obligatorios.")
      return
    }

    if (!/[a-zA-ZáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]/.test(form.ponente)) {
      setError("El nombre del conferencista debe contener letras válidas, no solo números.")
      return
    }

    if (form.hora_inicio && form.hora_inicio > "16:30") {
      setError("La hora de inicio no puede ser mayor a 16:30 hrs.")
      return
    }

    if (form.hora_fin && form.hora_fin > "16:30") {
      setError("La hora de finalización no puede ser mayor a 16:30 hrs.")
      return
    }

    if (form.hora_inicio && form.hora_fin && form.hora_inicio >= form.hora_fin) {
      setError("La hora de inicio debe ser menor a la hora de finalización.")
      return
    }

    if (form.cupos_total === "" || form.cupos_total === 0) {
      setError("El cupo máximo es obligatorio y debe ser al menos 1 persona.")
      return
    }

    if (form.cupos_total > 100) {
      setError("El cupo máximo no puede ser mayor a 100 personas.")
      return
    }

    if (form.cupos_total < 1) {
      setError("El cupo máximo debe ser al menos 1 persona.")
      return
    }

    if (conflict) {
      setError("Resuelve el conflicto de horario antes de guardar.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({
        titulo: form.titulo, 
        ponente: form.ponente, 
        dia: form.dia,
        hora_inicio: form.hora_inicio, 
        hora_fin: form.hora_fin,
        tipo: form.tipo, 
        lugar: form.lugar,
        cupos_total: typeof form.cupos_total === "string" ? Number(form.cupos_total) : form.cupos_total, 
        descripcion: form.descripcion,
        perfil_profesional: form.perfil_profesional,
        afiliacion: form.afiliacion,
        biografia: form.biografia,
        foto_ponente: speakerPhotoBase64,
        logo_institucion: institutionLogoUrl,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar la sesión.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-[#FBF8FF] dark:bg-[#0F172A] overflow-auto flex flex-col">
      <div className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#1A1F2E] border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-[#1A1B22] dark:text-white">Nueva sesión</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Completa la información detallada para formalizar la nueva sesión académica en el sistema institucional.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCancelConfirm(true)}
            className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-2 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="text-xs font-semibold text-black dark:text-white bg-[#53F000] dark:bg-[#10B981] px-4 py-2 rounded-md hover:opacity-90 dark:hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
          >
            {saving ? "Guardando..." : "Guardar Registro"}
          </button>
        </div>
      </div>

      <div className="flex gap-5 px-8 py-6 flex-1">
        <div className="flex-1 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-[#1A1B22] dark:text-white mb-5">Información de la sesión <span className="text-red-500">*Campos obligatorios</span></h2>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 text-xs rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Nombre de la sesión <span className="text-red-500">*</span></p>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs placeholder-gray-300 dark:placeholder-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none focus:border-[#0F6B44] dark:focus:border-[#10B981] transition-colors"
                value={form.titulo} onChange={set("titulo")}
                placeholder="Ej. Simposio Internacional de Ingeniería Sustentable"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Tipo de sesión</p>
                <select
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none focus:border-[#0F6B44] dark:focus:border-[#10B981] transition-colors"
                  value={form.tipo} onChange={set("tipo")}
                >
                  <option>Conferencia</option>
                  <option>Taller</option>
                  <option>Inauguración</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Fecha</p>
                <input type="date"
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none focus:border-[#0F6B44] dark:focus:border-[#10B981] transition-colors"
                  value={form.dia} onChange={set("dia")}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Hora de inicio</p>
                <input type="time"
                  className={`w-full border rounded-md px-3 py-2 text-xs bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none transition-colors ${
                    form.hora_inicio && form.hora_inicio > "16:30"
                      ? "border-red-400 dark:border-red-500 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-[#0F6B44] dark:focus:border-[#10B981]"
                  }`}
                  value={form.hora_inicio} onChange={set("hora_inicio")}
                />
                {form.hora_inicio && form.hora_inicio > "16:30" && (
                  <p className="text-[10px] text-red-500 mt-1">No permitida después de 16:30</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Hora de finalización</p>
                <input type="time"
                  className={`w-full border rounded-md px-3 py-2 text-xs bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none transition-colors ${
                    form.hora_fin && form.hora_fin > "16:30"
                      ? "border-red-400 dark:border-red-500 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-[#0F6B44] dark:focus:border-[#10B981]"
                  }`}
                  value={form.hora_fin} onChange={set("hora_fin")}
                />
                {form.hora_fin && form.hora_fin > "16:30" && (
                  <p className="text-[10px] text-red-500 mt-1">No permitida después de 16:30</p>
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Cupo máximo <span className="text-red-500">*</span></p>
                <input type="number" min={1} max={100}
                  className={`w-full border rounded-md px-3 py-2 text-xs bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none transition-colors ${
                    form.cupos_total !== "" && Number(form.cupos_total) > 100
                      ? "border-red-400 dark:border-red-500 focus:border-red-500"
                      : "border-gray-200 dark:border-gray-600 focus:border-[#0F6B44] dark:focus:border-[#10B981]"
                  }`}
                  value={form.cupos_total} onChange={handleCuposChange}
                  placeholder="Ej. 50"
                />
                {form.cupos_total !== "" && Number(form.cupos_total) > 100 && (
                  <p className="text-[10px] text-red-500 mt-1">El cupo máximo no puede ser mayor a 100</p>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Escenario <span className="text-red-500">*</span></p>
              <select
                className={`w-full border rounded-md px-3 py-2 text-xs bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none transition-colors ${
                  conflict ? "border-amber-400 dark:border-amber-500 focus:border-amber-500 dark:focus:border-amber-600" : "border-gray-200 dark:border-gray-600 focus:border-[#0F6B44] dark:focus:border-[#10B981]"
                }`}
                value={form.lugar}
                onChange={set("lugar")}
                disabled={espaciosLoading}
              >
                <option value="">
                  {espaciosLoading ? "Cargando espacios..." : "Selecciona un escenario"}
                </option>
                {espacios.map((espacio) => (
                  <option key={espacio.id} value={espacio.nombre}>
                    {espacio.nombre}
                  </option>
                ))}
              </select>
              {conflict && (
                <div className="mt-2 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-[11px] rounded-md px-3 py-2">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  <span>{conflict}</span>
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Descripción breve (opcional)</p>
              <textarea rows={4}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs resize-none bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-[#0F6B44] dark:focus:border-[#10B981] transition-colors"
                value={form.descripcion} onChange={set("descripcion")}
                placeholder="Detalla los objetivos y temas principales a tratar en la sesión..."
              />
            </div>
          </div>
        </div>

        <div className="w-[300px] shrink-0 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
          <h2 className="text-sm font-semibold text-[#0F6B44] dark:text-[#10B981] mb-5 tracking-wide">
            Información del ponente
          </h2>

          <div className="space-y-4 text-xs">
            <label className="w-full h-28 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0F6B44] dark:hover:border-[#10B981] transition-colors overflow-hidden">
              {speakerPhotoUrl
                ? <img src={speakerPhotoUrl} alt="Ponente" className="h-full w-full object-cover" />
                : (<>
                    <Upload size={18} className="text-gray-300 dark:text-gray-600 mb-1" />
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Cargar fotografía</span>
                    <span className="text-[9px] text-gray-500 dark:text-gray-500">PNG, JPG hasta 5 MB</span>
                  </>)
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleSpeakerPhotoChange} />
            </label>

            <div>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Nombre completo <span className="text-red-500">*</span></p>
              <input
                className={`w-full border rounded-md px-3 py-2 text-xs placeholder-gray-300 dark:placeholder-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none transition-colors ${
                  form.ponente && !/[a-zA-ZáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]/.test(form.ponente)
                    ? "border-red-400 dark:border-red-500 focus:border-red-500"
                    : "border-gray-200 dark:border-gray-600 focus:border-[#0F6B44] dark:focus:border-[#10B981]"
                }`}
                value={form.ponente} onChange={set("ponente")}
                placeholder="Dr. Alejandro Silva Morales"
              />
              {form.ponente && !/[a-zA-ZáéíóúàèìòùäëïöüÁÉÍÓÚÀÈÌÒÙÄËÏÖÜ]/.test(form.ponente) && (
                <p className="text-[10px] text-red-500 mt-1">Debe contener letras válidas, no solo números</p>
              )}
            </div>

            <div>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Perfil profesional (grado)</p>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs placeholder-gray-300 dark:placeholder-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none focus:border-[#0F6B44] dark:focus:border-[#10B981] transition-colors"
                value={form.perfil_profesional} onChange={set("perfil_profesional")}
                placeholder="Ej. Doctor en Ciencias Biológicas"
              />
            </div>

            <div>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Afiliación institucional (opcional)</p>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs placeholder-gray-300 dark:placeholder-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none focus:border-[#0F6B44] dark:focus:border-[#10B981] transition-colors"
                value={form.afiliacion} onChange={set("afiliacion")}
                placeholder="Universidad Autónoma Metropolitana"
              />
            </div>

            <label className="w-full h-20 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#0F6B44] dark:hover:border-[#10B981] transition-colors overflow-hidden">
              {institutionLogoUrl
                ? <img src={institutionLogoUrl} alt="Institución" className="h-full w-full object-contain p-2" />
                : (<>
                    <Upload size={16} className="text-gray-300 dark:text-gray-600 mb-1" />
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">Cargar logo de la institución</span>
                    <span className="text-[9px] text-gray-500 dark:text-gray-500">PNG, JPG hasta 5 MB</span>
                  </>)
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleInstitutionLogoChange} />
            </label>

            <div>
              <p className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold mb-1">Biografía / Reseña curricular</p>
              <textarea rows={4}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs resize-none placeholder-gray-300 dark:placeholder-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white focus:outline-none focus:border-[#0F6B44] dark:focus:border-[#10B981] transition-colors"
                value={form.biografia} onChange={set("biografia")}
                placeholder="Resumen de trayectoria profesional y académica..."
              />
            </div>
          </div>
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.35)" }}>
          <div className="bg-white dark:bg-[#1E293B] rounded-xl shadow-xl w-[340px] px-6 py-6 text-xs">
            <div className="flex flex-col items-center text-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-600" />
              <p className="text-sm font-bold text-gray-900 dark:text-white">¿Cancelar registro?</p>
            </div>
            <p className="text-[12px] text-gray-600 dark:text-gray-400 text-center mb-5">Se perderán todos los datos ingresados. ¿Deseas cancelar el proceso?</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={onClose}
                className="w-full bg-[#C40000] text-white text-xs font-semibold py-2 rounded-md hover:bg-red-700 transition-colors cursor-pointer"
              >
                Cancelar registro
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-400 text-xs font-semibold py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Continuar editando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
