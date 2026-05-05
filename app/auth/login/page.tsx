"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setResetToken(null)
    setLoading(true)

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.error ?? "Usuario o contraseña incorrectos. Intenta de nuevo.")
      setLoading(false)
      return
    }

    setLoading(false)

    if (payload?.user?.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/")
    }
  }

  async function handleResetPassword() {
    setError("")
    setSuccess("")
    setResetToken(null)

    const value = email.trim()
    if (!value) {
      setError("Ingresa tu usuario o correo para recuperar la contraseña.")
      return
    }

    setResetLoading(true)
    const response = await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: value }),
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.error ?? "No se pudo iniciar la recuperación.")
      setResetLoading(false)
      return
    }

    if (payload?.resetToken) {
      setResetToken(payload.resetToken)
      setSuccess("Usa el token para restablecer tu contraseña.")
    } else {
      setSuccess("Si tu cuenta existe, podras restablecer tu contrasena.")
    }
    setResetLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden dark:bg-[#0F172A]"
      style={{
        background: "radial-gradient(ellipse at top-left, #e8fce8 0%, #f0fdf0 40%, #f5f5f5 100%)",
      }}
    >
      {/* Apply dark mode background override */}
      <div className="absolute inset-0 dark:bg-[#0F172A] dark:opacity-100" style={{display: 'none'}} />

      {/* Boton de regreso */}
      <button
        onClick={() => window.location.href = '/'}
        className="absolute top-6 left-6 z-20 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-colors backdrop-blur-sm"
        aria-label="Regresar a la pagina principal"
      >
        <ArrowLeft size={20} className="text-[#1A1B22] dark:text-white" />
      </button>

      {/* Decorative building image — top right */}

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Brand header above card */}
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold text-[#1A1B22] dark:text-white tracking-wide uppercase">
            UES San José del Rincón
          </h1>
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="h-px w-10 bg-gray-300 dark:bg-gray-700" />
            <p className="text-[10px] font-medium tracking-widest text-gray-400 dark:text-gray-500 uppercase">
              Universidad Mexiquense del Bicentenario
            </p>
            <div className="h-px w-10 bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg dark:shadow-xl px-7 py-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-[#1A1B22] dark:text-white mb-0.5">Inicia sesión</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Accede al panel de control institucional.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Usuario */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usuario o correo
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario o correo"
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1B22] dark:text-white outline-none focus:border-[#64FC05] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#64FC05] dark:focus:ring-[#10B981] transition bg-gray-50/50 dark:bg-[#0F172A]"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-[#1A1B22] dark:text-white outline-none focus:border-[#64FC05] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#64FC05] dark:focus:ring-[#10B981] transition bg-gray-50/50 dark:bg-[#0F172A]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Recordarme + olvidaste */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#64FC05] dark:accent-[#10B981] rounded"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="text-xs text-[#065F46] dark:text-[#10B981] hover:underline font-medium disabled:opacity-60"
              >
                {resetLoading ? "Enviando..." : "¿Olvidaste tu contraseña?"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {success && (
              <p className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2">
                {success}
              </p>
            )}

            {resetToken && (
              <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2">
                <div className="font-mono">Token: {resetToken}</div>
                <Link
                  href={`/auth/reset?token=${resetToken}`}
                  className="text-[#065F46] dark:text-[#10B981] font-semibold hover:underline"
                >
                  Ir a restablecer contrasena
                </Link>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold text-black dark:text-white transition-opacity disabled:opacity-60 mt-1 bg-[#64FC05] dark:bg-[#10B981] hover:opacity-90"
            >
              {loading ? "Ingresando..." : "Ingresar al sistema"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-5">
            ¿No tienes una cuenta académica?{" "}
            <Link href="/auth/register" className="text-[#065F46] dark:text-[#10B981] font-semibold hover:underline">
              Crea una cuenta
            </Link>
          </p>
          
          <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => window.location.href = '/'}
              className="w-full py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Volver a pagina principal
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-1.5 mt-5">
            <span className="w-2 h-2 rounded-full bg-[#1A1B22] dark:bg-white" />
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
            <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    </div>
  )
}
