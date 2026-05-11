"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, CheckCircle2, Copy } from "lucide-react"

export default function RequestResetPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!identifier.trim()) {
      setError("Ingresa tu usuario o correo.")
      return
    }

    setLoading(true)
    const response = await fetch("/api/auth/request-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: identifier.trim().toLowerCase() }),
    })

    const payload = await response.json().catch(() => null)
    setLoading(false)

    if (!response.ok) {
      setError(payload?.error ?? "No se pudo procesar la solicitud.")
      return
    }

    setSuccess(true)
    if (payload?.resetToken) {
      setResetToken(payload.resetToken)
    }
  }

  function copyToken() {
    if (resetToken) {
      navigator.clipboard.writeText(resetToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">¡Correo Enviado!</h1>
          <p className="text-gray-600 mb-6">
            Se ha enviado un correo con instrucciones para recuperar tu contraseña.
          </p>
          
          {resetToken && (
            <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Tu token de recuperación:</p>
              <div className="bg-white p-3 rounded border border-gray-300 break-all font-mono text-sm flex items-center justify-between gap-2">
                <span>{resetToken}</span>
                <button
                  onClick={copyToken}
                  className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                  title="Copiar"
                >
                  <Copy className="w-4 h-4 text-indigo-600" />
                </button>
              </div>
              {copied && <p className="text-green-600 text-sm mt-2">✓ Copiado</p>}
            </div>
          )}
          
          <Link
            href="/auth/reset"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition mb-4"
          >
            Ir a Recuperar Contraseña
          </Link>
          <br />
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2 text-indigo-600 hover:text-indigo-700 transition"
          >
            Volver al Login
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
              <Mail className="w-12 h-12 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Recuperar Contraseña</h1>
            <p className="text-gray-600 text-sm mt-2">
              Ingresa tu usuario o correo para recibir el token
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Usuario o Correo Electrónico
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="tu.usuario o tu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Enviando..." : "Enviar Token"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿Recuerdas tu contraseña?{" "}
              <Link href="/auth/login" className="text-indigo-600 font-medium hover:underline">
                Volver al Login
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
