"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      })

      const text = await response.text()
      let payload: any = null
      try {
        payload = JSON.parse(text)
      } catch {
        payload = null
      }

      if (!response.ok) {
        const mensaje = payload?.error || "Error en el servidor. Intenta de nuevo."
        setError(mensaje)
        setLoading(false)
        return
      }

      setLoading(false)

      const role = payload?.user?.role
      if (role === "admin") {
        window.location.href = "/admin"
      } else {
        window.location.href = "/"
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    router.push("/auth/request-reset")
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
        className="absolute top-6 left-6 z-20 p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-colors backdrop-blur-sm cursor-pointer"
        aria-label="Regresar a la pagina principal"
      >
        <ArrowLeft size={20} className="text-[#1A1B22] dark:text-white" />
      </button>

      {/* Decorative building image — top right */}

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Brand header above card */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Image
              src="/images/sanjose.png"
              alt="San José del Rincón"
              width={90}
              height={90}
            />
          </div>
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
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-[#1A1B22] dark:text-white outline-none focus:border-[#64FC05] dark:focus:border-[#10B981] focus:ring-1 focus:ring-[#64FC05] dark:focus:ring-[#10B981] transition bg-gray-50/50 dark:bg-[#0F172A] [&::-ms-reveal]:hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-600 dark:hover:text-gray-300 transition-all cursor-pointer ${
                    showPassword
                      ? "text-gray-600 dark:text-gray-300"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <Eye size={16} />
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
                className="text-xs text-[#065F46] dark:text-[#10B981] hover:underline font-medium cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold text-black dark:text-white transition-opacity disabled:opacity-60 mt-1 bg-[#64FC05] dark:bg-[#10B981] hover:opacity-90 cursor-pointer"
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
              className="w-full py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
