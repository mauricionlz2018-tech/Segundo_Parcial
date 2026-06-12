"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, CheckCircle2, X } from "lucide-react"

const CARRERAS = [
  "Ingeniería en Innovación Agrícola Sustentable",
  "Ingeniería en Sistemas Computacionales",
  "Licenciatura en Contaduría",
]

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [carrera, setCarrera] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [assignedUsername, setAssignedUsername] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  function generateUsername(name: string) {
    const parts = name.trim().toLowerCase().split(/\s+/)
    const base = parts.slice(0, 2).join(".")
    const random = Math.floor(100 + Math.random() * 900)
    return `${base}${random}`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones para continuar.")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    setLoading(true)
    const username = generateUsername(fullName)

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, carrera, username }),
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.error ?? "No se pudo crear la cuenta.")
      setLoading(false)
      return
    }

    setAssignedUsername(payload?.user?.username ?? username)
    setSuccess(true)
    setLoading(false)
  }

  return (
    <>
      <style>{`
        .register-bg {
          background-image: repeating-linear-gradient(135deg, #e5e7eb 0px, #e5e7eb 1px, transparent 1px, transparent 12px);
          background-color: #f3f4f6;
        }
        .dark .register-bg {
          background-image: repeating-linear-gradient(135deg, #1e293b 0px, #1e293b 1px, transparent 1px, transparent 12px);
          background-color: #0F172A;
        }
      `}</style>

      {success ? (
        <div className="min-h-screen flex items-center justify-center px-4 register-bg">
          <div className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg dark:shadow-xl px-8 py-10 text-center border border-gray-200 dark:border-gray-700">
            <CheckCircle2 size={52} className="mx-auto mb-4 text-[#065F46] dark:text-[#10B981]" />
            <h2 className="text-xl font-bold text-[#1A1B22] dark:text-white mb-2">¡Cuenta creada!</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Tu cuenta ya está lista para iniciar sesión.
            </p>
            
            <div className="rounded-xl px-5 py-4 mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">✓ Información enviada</p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                Te hemos enviado tu <strong>usuario y contraseña</strong> al correo registrado. Revisa tu bandeja de entrada.
              </p>
        </div>
        </div>

        {/* Modal de Términos y Condiciones */}
        {showTermsModal && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-[#1A1B22] dark:text-white">Términos y Condiciones</h2>
                <button onClick={() => setShowTermsModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition">
                  <X size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <section>
                  <h3 className="font-bold text-[#065F46] dark:text-[#10B981] mb-2">1. Aceptación de Términos</h3>
                  <p>Al registrarse en la plataforma de UES San José del Rincón, usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguno de estos términos, le solicitamos que no utilice la plataforma.</p>
                </section>
                <section>
                  <h3 className="font-bold text-[#065F46] dark:text-[#10B981] mb-2">2. Uso de la Plataforma</h3>
                  <p>La plataforma está diseñada exclusivamente para estudiantes de la UES y proporciona acceso a información sobre eventos, conferencias y sesiones académicas. El usuario se compromete a utilizar la plataforma únicamente para fines académicos y autorizados.</p>
                </section>
                <section>
                  <h3 className="font-bold text-[#065F46] dark:text-[#10B981] mb-2">3. Protección de Datos</h3>
                  <p>La información personal proporcionada al registrarse será utilizada únicamente para:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Gestionar su cuenta de usuario</li>
                    <li>Enviar notificaciones sobre eventos académicos</li>
                    <li>Mejorar la experiencia en la plataforma</li>
                    <li>Cumplir con obligaciones legales y regulatorias</li>
                  </ul>
                </section>
                <section>
                  <h3 className="font-bold text-[#065F46] dark:text-[#10B981] mb-2">4. Responsabilidad del Usuario</h3>
                  <p>El usuario es responsable de:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Mantener confidencial su contraseña</li>
                    <li>No compartir sus credenciales con terceros</li>
                    <li>Notificar a la UES en caso de acceso no autorizado</li>
                    <li>No usar la plataforma para actividades ilícitas</li>
                  </ul>
                </section>
                <section>
                  <h3 className="font-bold text-[#065F46] dark:text-[#10B981] mb-2">5. Limitación de Responsabilidad</h3>
                  <p>La UES no será responsable por:</p>
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Interrupciones en el servicio de la plataforma</li>
                    <li>Pérdida de datos debido a acciones del usuario</li>
                    <li>Daños indirectos derivados del uso de la plataforma</li>
                  </ul>
                </section>
                <section>
                  <h3 className="font-bold text-[#065F46] dark:text-[#10B981] mb-2">6. Modificación de Términos</h3>
                  <p>La UES se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Los cambios serán notificados a través de la plataforma.</p>
                </section>
                <section>
                  <h3 className="font-bold text-[#065F46] dark:text-[#10B981] mb-2">7. Contacto</h3>
                  <p>Si tiene preguntas sobre estos términos y condiciones, contáctenos a través del correo de soporte institucional.</p>
                </section>
                <div className="text-xs text-gray-600 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p>Última actualización: {new Date().toLocaleDateString("es-ES")}</p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                <button onClick={() => setShowTermsModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  Cerrar
                </button>
                <button onClick={() => { setAcceptTerms(true); setShowTermsModal(false); }} className="flex-1 px-4 py-2 rounded-lg bg-[#065F46] dark:bg-[#10B981] text-white font-medium hover:opacity-90 transition">
                  Aceptar y Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full py-3 rounded-lg text-sm font-bold text-black dark:text-white bg-[#64FC05] dark:bg-[#10B981] hover:opacity-90 transition"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center px-4 py-10 register-bg">
          <div className="w-full max-w-sm">
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg dark:shadow-xl px-7 py-8 border border-gray-200 dark:border-gray-700">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative h-24 w-24">
              <Image
                src="/images/Umb_logo.png"
                alt="Logo"
                fill
                className="object-cover rounded-bl-3xl"
                sizes="64px"
              />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-1 text-center">
              UES San José del Rincón
            </p>
            <h1 className="text-2xl font-bold text-[#1A1B22] dark:text-white">Crear cuenta</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">
              Crea una cuenta para acceder a la información de los eventos próximos de la UES San José del Rincón.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Nombre completo */}
            <div className="flex flex-col gap-1">
              <label htmlFor="fullName" className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Nombre Completo
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ingresa tu nombre"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1B22] dark:text-white outline-none focus:border-[#64FC05] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#64FC05] dark:focus:ring-[#10B981] transition bg-gray-50/40 dark:bg-[#0F172A]"
              />
            </div>

            {/* Correo */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Correo Institucional o Matrícula
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ues.edu.mx"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1B22] dark:text-white outline-none focus:border-[#64FC05] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#64FC05] dark:focus:ring-[#10B981] transition bg-gray-50/40 dark:bg-[#0F172A]"
              />
            </div>

            {/* Carrera */}
            <div className="flex flex-col gap-1">
              <label htmlFor="carrera" className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Carrera
              </label>
              <div className="relative">
                <select
                  id="carrera"
                  required
                  value={carrera}
                  onChange={(e) => setCarrera(e.target.value)}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1B22] dark:text-white outline-none focus:border-[#64FC05] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#64FC05] dark:focus:ring-[#10B981] transition bg-gray-50/40 dark:bg-[#0F172A] appearance-none pr-8"
                >
                  <option value="" disabled>Selecciona tu carrera</option>
                  {CARRERAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Contraseñas en fila */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 pr-8 text-sm text-[#1A1B22] dark:text-white outline-none focus:border-[#64FC05] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#64FC05] dark:focus:ring-[#10B981] transition bg-gray-50/40 dark:bg-[#0F172A] [&::-ms-reveal]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all ${
                      showPassword
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-gray-400 dark:text-gray-600"
                    }`}
                    aria-label="toggle password"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="confirm" className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Confirmar
                </label>
                <div className="relative">
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 pr-8 text-sm text-[#1A1B22] dark:text-white outline-none focus:border-[#64FC05] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#64FC05] dark:focus:ring-[#10B981] transition bg-gray-50/40 dark:bg-[#0F172A] [&::-ms-reveal]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 transition-all ${
                      showConfirm
                        ? "text-gray-600 dark:text-gray-400"
                        : "text-gray-400 dark:text-gray-600"
                    }`}
                    aria-label="toggle confirmation"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Términos y condiciones */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#065F46] dark:accent-[#10B981] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                Acepto los{" "}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[#065F46] dark:text-[#10B981] font-semibold hover:underline"
                >
                  términos y condiciones
                </button>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold text-black dark:text-white transition-opacity disabled:opacity-60 mt-1 bg-[#64FC05] dark:bg-[#10B981] hover:opacity-90"
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5">
            ¿Ya eres parte del sistema?{" "}
            <Link href="/auth/login" className="text-[#065F46] dark:text-[#10B981] font-semibold hover:underline">
              Iniciar sesión aquí
            </Link>
          </p>
        </div>

