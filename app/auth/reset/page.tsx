"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, CheckCircle2, Lock } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // Validar token
    if (!token.trim()) {
      setError("Ingresa el token que recibiste por correo.")
      return
    }

    // Validar contraseña
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    // Validar que coincidan
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: token.trim(), 
          password 
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        setError(payload?.error ?? "No se pudo actualizar la contraseña.")
        setLoading(false)
        return
      }

      // Éxito
      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2500)
    } catch (err) {
      setError("Error al procesar la solicitud. Intenta de nuevo.")
      setLoading(false)
    }
  }

  // Pantalla de éxito
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8FF] dark:bg-[#0F172A] px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-[#10B981]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1B22] dark:text-white mb-4">¡Contraseña Actualizada!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Tu contraseña ha sido cambiada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2 bg-[#0F6B44] hover:bg-[#0A4A2F] text-white rounded-lg transition"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8FF] dark:bg-[#0F172A]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1E293B] shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/Umb_logo.png"
              alt="UES"
              width={40}
              height={40}
              className="rounded"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow-lg p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/sanjose.png"
                alt="San José del Rincón"
                width={48}
                height={48}
                className="rounded-md"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#1A1B22] dark:text-white">Nueva Contraseña</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Ingresa el token del correo y tu nueva contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Token Input */}
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Token de Recuperación
              </label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Copia el token del correo aquí"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] font-mono text-sm bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={loading}
              />
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                Busca el token en el correo que recibiste
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 [&::-ms-reveal]:hidden"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-700 dark:hover:text-gray-300 transition-all ${
                    showPassword ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-400"
                  }`}
                  aria-label="toggle password"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 [&::-ms-reveal]:hidden"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-700 dark:hover:text-gray-300 transition-all ${
                    showConfirm ? "text-gray-700 dark:text-gray-300" : "text-gray-500 dark:text-gray-400"
                  }`}
                  aria-label="toggle confirmation"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-[#EAFBE2] dark:bg-[#10B981]/20 border border-[#10B981] rounded-lg p-3 text-sm text-[#0F6B44] dark:text-[#10B981]">
              Mínimo 6 caracteres
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#0F6B44] hover:bg-[#0A4A2F] text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Actualizando..." : "Cambiar Contraseña"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              ¿No tienes un token?{" "}
              <Link href="/auth/request-reset" className="text-[#0F6B44] dark:text-[#10B981] font-medium hover:underline">
                Solicitar nuevo
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-700 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>&copy; 2026 UES San José del Rincón. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
