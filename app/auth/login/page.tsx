"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

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
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top-left, #e8fce8 0%, #f0fdf0 40%, #f5f5f5 100%)",
      }}
    >
      {/* Decorative building image — top right */}

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Brand header above card */}
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold text-[#1A1B22] tracking-wide uppercase">
            UES San José del Rincón
          </h1>
          <div className="flex items-center justify-center gap-3 mt-1">
            <div className="h-px w-10 bg-gray-300" />
            <p className="text-[10px] font-medium tracking-widest text-gray-400 uppercase">
              Universidad Mexiquense del Bicentenario
            </p>
            <div className="h-px w-10 bg-gray-300" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg px-7 py-8">
          <h2 className="text-xl font-bold text-[#1A1B22] mb-0.5">Inicia sesión</h2>
          <p className="text-xs text-gray-400 mb-6">Accede al panel de control institucional.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Usuario */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Usuario o correo
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario o correo"
                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1B22] outline-none focus:border-[#64FC05] focus:ring-1 focus:ring-[#64FC05] transition bg-gray-50/50"
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-[#1A1B22] outline-none focus:border-[#64FC05] focus:ring-1 focus:ring-[#64FC05] transition bg-gray-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  className="w-3.5 h-3.5 accent-[#64FC05] rounded"
                />
                <span className="text-xs text-gray-500">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetLoading}
                className="text-xs text-[#065F46] hover:underline font-medium disabled:opacity-60"
              >
                {resetLoading ? "Enviando..." : "¿Olvidaste tu contraseña?"}
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {success && (
              <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                {success}
              </p>
            )}

            {resetToken && (
              <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <div className="font-mono">Token: {resetToken}</div>
                <Link
                  href={`/auth/reset?token=${resetToken}`}
                  className="text-[#065F46] font-semibold hover:underline"
                >
                  Ir a restablecer contrasena
                </Link>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold text-black transition-opacity disabled:opacity-60 mt-1"
              style={{ backgroundColor: "#64FC05" }}
            >
              {loading ? "Ingresando..." : "Ingresar al sistema"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-5">
            ¿No tienes una cuenta académica?{" "}
            <Link href="/auth/register" className="text-[#065F46] font-semibold hover:underline">
              Crea una cuenta
            </Link>
          </p>

          {/* Dots indicator */}
          <div className="flex justify-center gap-1.5 mt-5">
            <span className="w-2 h-2 rounded-full bg-[#1A1B22]" />
            <span className="w-2 h-2 rounded-full bg-gray-300" />
            <span className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    </div>
  )
}
