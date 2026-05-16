"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut, User, AlertCircle } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Cronograma", href: "/cronograma" },
  { label: "Sedes", href: "/sedes" },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; role: string; username: string } | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const response = await fetch("/api/auth/me")
      if (!response.ok) {
        setUser(null)
        setRole(null)
        return
      }

      const payload = await response.json().catch(() => null)
      setUser(payload?.user ?? null)
      setRole(payload?.user?.role ?? null)
    }

    loadUser()
  }, [])

  async function confirmLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setRole(null)
    setShowLogoutConfirm(false)
    router.push("/")
    router.refresh()
  }

  function handleSignOut() {
    setShowLogoutConfirm(true)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1A1F2E] border-b border-gray-100 dark:border-gray-800 shadow-sm dark:shadow-lg">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/sanjose.png"
              alt="San José del Rincón"
              width={80}
              height={80}
            />
            <span className="text-sm font-bold text-black dark:text-white tracking-wide uppercase">
              UES San José del Rincón
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? "text-[#065F46] dark:text-[#10B981] font-semibold"
                    : "text-black dark:text-gray-300 hover:text-[#065F46] dark:hover:text-[#10B981]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm text-[#065F46] dark:text-[#10B981] font-semibold hover:underline"
                  >
                    Panel Admin
                  </Link>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/perfil" className="flex items-center gap-1.5 hover:text-[#065F46] dark:hover:text-[#10B981] transition-colors">
                    <User size={14} />
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </Link>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm text-black dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut size={14} />
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="text-sm text-black dark:text-gray-300 hover:text-[#065F46] dark:hover:text-[#10B981] transition-colors"
                >
                  Registro
                </Link>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold px-4 py-1.5 rounded-md text-black dark:text-gray-900 transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#64FC05" }}
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-black dark:text-white"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#1A1F2E] border-t border-gray-100 dark:border-gray-800">
          <nav className="flex flex-col px-6 py-4 gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm py-1 ${
                  pathname === link.href ? "text-[#065F46] dark:text-[#10B981] font-semibold" : "text-black dark:text-gray-300"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {role === "admin" && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="text-sm text-[#065F46] font-semibold py-1">
                    Panel Admin
                  </Link>
                )}
                <button
                  onClick={() => { setIsOpen(false); handleSignOut() }}
                  className="text-sm text-red-600 dark:text-red-400 py-1 text-left hover:font-semibold transition-colors"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-black py-1"
                >
                  Registro
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold px-4 py-2 rounded-md text-black text-center mt-1"
                  style={{ backgroundColor: "#64FC05" }}
                >
                  Iniciar sesión
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow-xl p-6 max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
              <h2 className="text-lg font-bold text-black dark:text-white">Cerrar Sesión</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              ¿Estás seguro de que deseas cerrar tu sesión?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors font-medium flex items-center gap-2"
              >
                <LogOut size={16} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
