"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden.")
      return
    }

    if (!token) {
      setError("Token invalido o expirado.")
      return
    }

    setLoading(true)
    const response = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      setError(payload?.error ?? "No se pudo actualizar la contrasena.")
      setLoading(false)
      return
    }

    router.push("/auth/login")
  }

  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #64FC05 0%, #006341 100%)" }}
      >
        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-[#1A1B22] mb-2">Sesion no valida</h1>
          <p className="text-sm text-gray-500 mb-6">
            El enlace de recuperacion expiro o no es valido. Solicita uno nuevo.
          </p>
          <Link
            href="/auth/login"
            className="inline-block w-full py-2.5 rounded-lg text-sm font-semibold text-black text-center"
            style={{ backgroundColor: "#64FC05" }}
          >
            Ir al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #64FC05 0%, #006341 100%)" }}
    >
      <div className="bg-white rounded-2xl shadow-xl px-8 py-10 max-w-md w-full">
        <h1 className="text-2xl font-bold text-[#1A1B22] mb-2">Restablecer contrasena</h1>
        <p className="text-xs text-gray-400 mb-6">
          Crea una nueva contrasena para tu cuenta.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Nueva contrasena
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1B22] outline-none focus:border-[#64FC05] focus:ring-1 focus:ring-[#64FC05] transition bg-gray-50/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Confirmar contrasena
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-[#1A1B22] outline-none focus:border-[#64FC05] focus:ring-1 focus:ring-[#64FC05] transition bg-gray-50/50"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-sm font-bold text-black transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#64FC05" }}
          >
            {loading ? "Guardando..." : "Actualizar contrasena"}
          </button>
        </form>
      </div>
    </div>
  )
}
