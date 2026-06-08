"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import About from "@/components/about"
import Programs from "@/components/programs"
import Footer from "@/components/footer"
import VoiceAssistant from "@/components/VoiceAssistant"
import { CalendarDays, BookOpen, User } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        if (!cancelled) {
          const data = res.ok ? await res.json().catch(() => null) : null
          setUser(data?.user || null)
        }
      } catch {
        if (!cancelled) setUser(null)
      } finally {
        if (!cancelled) setLoadingAuth(false)
      }
    }
    loadUser()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main>
      <Navbar />
      <Hero usuario={user} loadingAuth={loadingAuth} />
      {!loadingAuth && user && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-xl rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-10">
              <p className="text-black dark:text-white text-3xl font-bold mb-2">
                Hola, {user?.full_name || user?.username}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                ¿Qué quieres hacer hoy?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                <Link
                  href="/perfil"
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-[#64FC05] dark:hover:border-[#10B981] dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#64FC05] dark:bg-[#10B981] text-black dark:text-white">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1B22] dark:text-white group-hover:text-[#065F46] dark:group-hover:text-[#10B981]">
                      Personalizar mi perfil
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Edita nombre, carrera y más
                    </p>
                  </div>
                </Link>

                <Link
                  href="/cronograma"
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-[#64FC05] dark:hover:border-[#10B981] dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#64FC05] dark:bg-[#10B981] text-black dark:text-white">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1B22] dark:text-white group-hover:text-[#065F46] dark:group-hover:text-[#10B981]">
                      Ver cronograma de la Jornada
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Consulta todas las actividades y horarios
                    </p>
                  </div>
                </Link>

                <Link
                  href="/sesiones"
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-[#64FC05] dark:hover:border-[#10B981] dark:hover:bg-gray-800 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#64FC05] dark:bg-[#10B981] text-black dark:text-white">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1B22] dark:text-white group-hover:text-[#065F46] dark:group-hover:text-[#10B981]">
                      Explorar sesiones académicas
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Revisa las charlas y talleres disponibles
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
      <About />
      <Programs />
      <Footer />
      <VoiceAssistant />
    </main>
  )
}
