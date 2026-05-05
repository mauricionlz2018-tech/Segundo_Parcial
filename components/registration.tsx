"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"

const careers = [
  "Ingeniería en Innovación Agrícola Sustentable",
  "Ingeniería en Sistemas Computacionales",
  "Licenciatura en Contaduría",
  "Otra",
]

export default function Registration() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    career: "",
    role: "estudiante",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="registro" className="py-24 bg-[#0F6B44] dark:bg-[#0F172A] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left – Info */}
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#64FC05] dark:text-[#64FC05] px-4 py-1.5 bg-[#64FC05]/20 dark:bg-[#64FC05]/20 border border-[#64FC05]/30 dark:border-[#64FC05]/30 rounded-full mb-6">
              Únete al Evento
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white dark:text-white mb-6 text-balance">
              Regístrate a la{" "}
              <span className="text-[#64FC05] dark:text-[#64FC05]">Jornada Académica</span>
            </h2>
            <p className="text-white/70 dark:text-gray-300 text-lg leading-relaxed mb-8">
              Participa en conferencias, talleres y actividades culturales. El registro es gratuito para estudiantes y comunidad universitaria.
            </p>

            <ul className="flex flex-col gap-4">
              {[
                "Acceso a todas las conferencias y ponencias",
                "Participación en talleres especializados",
                "Certificado de participación digital",
                "Networking con expertos e investigadores",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/80 dark:text-gray-300 text-sm">
                  <CheckCircle2 size={18} className="text-[#64FC05] dark:text-[#64FC05] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right – Form */}
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-[#10B981]/10 dark:bg-[#10B981]/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-[#10B981] dark:text-[#10B981]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-2">¡Registro Exitoso!</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Gracias <strong>{form.name}</strong>, recibirás más información en{" "}
                  <strong>{form.email}</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm text-[#10B981] dark:text-[#10B981] hover:underline"
                >
                  Registrar otra persona
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Formulario de Registro
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-gray-900 dark:text-white">
                      Nombre completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] dark:focus:ring-[#10B981] transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-white">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10B981] dark:focus:ring-[#10B981] transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="career" className="text-sm font-medium text-gray-900 dark:text-white">
                      Carrera
                    </label>
                    <select
                      id="career"
                      required
                      value={form.career}
                      onChange={(e) => setForm({ ...form, career: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0F172A] text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981] dark:focus:ring-[#10B981] transition"
                    >
                      <option value="">Selecciona tu carrera</option>
                      {careers.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Participas como</span>
                    <div className="flex gap-4">
                      {["estudiante", "ponente", "docente"].map((r) => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 capitalize">
                          <input
                            type="radio"
                            name="role"
                            value={r}
                            checked={form.role === r}
                            onChange={() => setForm({ ...form, role: r })}
                            className="accent-[#10B981]"
                          />
                          {r}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#10B981] dark:bg-[#10B981] text-white dark:text-white font-semibold rounded-lg hover:bg-[#0B8B6A] dark:hover:bg-[#0B8B6A] transition-all hover:scale-[1.02] shadow-md mt-2"
                  >
                    Registrarme al Evento
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
