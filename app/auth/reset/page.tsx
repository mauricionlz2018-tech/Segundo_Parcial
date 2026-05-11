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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">¡Contraseña Actualizada!</h1>
          <p className="text-gray-600 mb-6">
            Tu contraseña ha sido cambiada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/Umb_logo.png"
              alt="UES"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="font-bold text-xl">UES</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Nueva Contraseña</h1>
            <p className="text-gray-600 text-sm mt-2">
              Ingresa el token del correo y tu nueva contraseña
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Token Input */}
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                Token de Recuperación
              </label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Copia el token del correo aquí"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                disabled={loading}
              />
              <p className="text-gray-500 text-xs mt-1">
                📧 Busca el token en el correo que recibiste
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 [&::-ms-reveal]:hidden"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-700 transition-all ${
                    showPassword ? "text-gray-700" : "text-gray-500"
                  }`}
                  aria-label="toggle password"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 [&::-ms-reveal]:hidden"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 hover:text-gray-700 transition-all ${
                    showConfirm ? "text-gray-700" : "text-gray-500"
                  }`}
                  aria-label="toggle confirmation"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              ✓ Mínimo 6 caracteres
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Actualizando..." : "Cambiar Contraseña"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿No tienes un token?{" "}
              <Link href="/auth/request-reset" className="text-indigo-600 font-medium hover:underline">
                Solicitar nuevo
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600 text-sm">
          <p>&copy; 2026 Universidad Especializada de El Salvador. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
