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
    <section id="registro" className="py-24 bg-brand-green-dark relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" aria-hidden="true" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left – Info */}
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand-gold px-4 py-1.5 bg-brand-gold/20 border border-brand-gold/30 rounded-full mb-6">
              Únete al Evento
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold text-primary-foreground mb-6 text-balance">
              Regístrate a la{" "}
              <span className="text-brand-gold">Jornada Académica</span>
            </h2>
            <p className="text-primary-foreground/70 text-lg leading-relaxed mb-8">
              Participa en conferencias, talleres y actividades culturales. El registro es gratuito para estudiantes y comunidad universitaria.
            </p>

            <ul className="flex flex-col gap-4">
              {[
                "Acceso a todas las conferencias y ponencias",
                "Participación en talleres especializados",
                "Certificado de participación digital",
                "Networking con expertos e investigadores",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-primary-foreground/80 text-sm">
                  <CheckCircle2 size={18} className="text-brand-gold mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right – Form */}
          <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-2">¡Registro Exitoso!</h3>
                <p className="text-muted-foreground">
                  Gracias <strong>{form.name}</strong>, recibirás más información en{" "}
                  <strong>{form.email}</strong>.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-sm text-primary hover:underline"
                >
                  Registrar otra persona
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Formulario de Registro
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">
                      Nombre completo
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Tu nombre"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Correo electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="career" className="text-sm font-medium text-foreground">
                      Carrera
                    </label>
                    <select
                      id="career"
                      required
                      value={form.career}
                      onChange={(e) => setForm({ ...form, career: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
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
                    <span className="text-sm font-medium text-foreground">Participas como</span>
                    <div className="flex gap-4">
                      {["estudiante", "ponente", "docente"].map((r) => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground capitalize">
                          <input
                            type="radio"
                            name="role"
                            value={r}
                            checked={form.role === r}
                            onChange={() => setForm({ ...form, role: r })}
                            className="accent-primary"
                          />
                          {r}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-md mt-2"
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
