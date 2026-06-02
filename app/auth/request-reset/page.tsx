"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, CheckCircle2, Copy, AlertCircle, Loader } from "lucide-react"

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
    
    // Primero verificar si el email existe
    try {
      const checkResponse = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim().toLowerCase() }),
      })
      
      const checkData = await checkResponse.json()
      
      if (!checkData.exists) {
        setError("❌ Este correo o usuario no está registrado en el sistema.")
        setLoading(false)
        return
      }
    } catch (err) {
      console.error("Error verificando email:", err)
    }

    // Si existe, proceder con el reset
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF8FF] dark:bg-[#0F172A] px-4">
        <style>{`
          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          .animate-slide-in { animation: slideInDown 0.6s ease-out; }
          .animate-scale { animation: scaleIn 0.5s ease-out; }
          .animate-pulse-custom { animation: pulse 2s ease-in-out infinite; }
        `}</style>
        <div className="text-center max-w-md animate-slide-in">
          <div className="flex justify-center mb-4">
            <div className="animate-scale">
              <CheckCircle2 className="w-16 h-16 text-[#10B981] animate-pulse-custom" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1B22] dark:text-white mb-4">¡Correo Enviado!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Se ha enviado un correo con instrucciones para recuperar tu contraseña.
          </p>
          
          {resetToken && (
            <div className="bg-[#EAFBE2] dark:bg-[#10B981]/20 border-2 border-[#10B981] rounded-lg p-4 mb-6 transition-all duration-300">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Tu token de recuperación:</p>
              <div className="bg-white dark:bg-[#0F172A] p-3 rounded border border-gray-300 dark:border-gray-700 break-all font-mono text-sm flex items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-[#1e2a3f] transition-colors">
                <span className="dark:text-white">{resetToken}</span>
                <button
                  onClick={copyToken}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded flex-shrink-0 transition-all duration-200 hover:scale-110"
                  title="Copiar"
                >
                  <Copy className="w-4 h-4 text-[#0F6B44] dark:text-[#10B981]" />
                </button>
              </div>
              {copied && <p className="text-[#0F6B44] dark:text-[#10B981] text-sm mt-2">Copiado</p>}
            </div>
          )}
          
          <Link
            href="/auth/reset"
            className="inline-block px-6 py-2 bg-[#0F6B44] hover:bg-[#0A4A2F] text-white rounded-lg transition mb-4"
          >
            Ir a Recuperar Contraseña
          </Link>
          <br />
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2 text-[#0F6B44] dark:text-[#10B981] hover:text-[#0A4A2F] dark:hover:text-[#86EFAC] transition"
          >
            Volver al Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8FF] dark:bg-[#0F172A]">
      <style>{`
        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-slide-in-down { animation: slideInDown 0.5s ease-out; }
        .animate-slide-in-up { animation: slideInUp 0.5s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .transition-all { transition: all 0.3s ease-out; }
      `}</style>
      
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
        <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow-lg p-8 max-w-md w-full border border-gray-100 dark:border-gray-700 animate-slide-in-down">
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
            <h1 className="text-2xl font-bold text-[#1A1B22] dark:text-white">Recuperar Contraseña</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
              Ingresa tu usuario o correo para recibir el token
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 text-red-700 dark:text-red-400 text-sm flex items-center gap-2 animate-slide-in-up ${error.includes("registrado") ? "animate-shake" : ""}`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuario o Correo Electrónico
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="tu.usuario o tu@email.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] bg-white dark:bg-[#0F172A] text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#0F6B44] hover:bg-[#0A4A2F] text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Enviar Token
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              ¿Recuerdas tu contraseña?{" "}
              <Link href="/auth/login" className="text-[#0F6B44] dark:text-[#10B981] font-medium hover:underline">
                Volver al Login
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
