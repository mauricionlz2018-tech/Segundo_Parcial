"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut, User } from "lucide-react"
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

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setRole(null)
    router.push("/")
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/" className="text-sm font-bold text-black tracking-wide uppercase">
            UES San José del Rincón
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? "text-[#065F46] font-semibold"
                    : "text-black hover:text-[#065F46]"
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
                    className="text-sm text-[#065F46] font-semibold hover:underline"
                  >
                    Panel Admin
                  </Link>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Link href="/perfil" className="flex items-center gap-1.5 hover:text-[#065F46] transition-colors">
                    <User size={14} />
                    <span className="max-w-[120px] truncate">{user.email}</span>
                  </Link>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm text-black hover:text-red-600 transition-colors"
                >
                  <LogOut size={14} />
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/register"
                  className="text-sm text-black hover:text-[#065F46] transition-colors"
                >
                  Registro
                </Link>
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold px-4 py-1.5 rounded-md text-black transition-opacity hover:opacity-80"
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
            className="md:hidden p-2 text-black"
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <nav className="flex flex-col px-6 py-4 gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm py-1 ${
                  pathname === link.href ? "text-[#065F46] font-semibold" : "text-black"
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
                  className="text-sm text-red-600 py-1 text-left"
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
    </header>
  )
}
