"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Users, BookOpen } from "lucide-react"

type Evento = {
  hora: string
  titulo: string
  ponente: string
  cupos: number
  maxCupos: number
  tipo: "Conferencia" | "Cultural" | "Taller" | "Inauguración" | "Cierre"
  lugar: string
}

type Dia = {
  id: string
  label: string
  fecha: string
  eventos: Evento[]
}

const dias: Dia[] = [
  {
    id: "lun",
    label: "Lun 1",
    fecha: "Lunes 1 de Diciembre",
    eventos: [
      {
        hora: "10:00 - 10:10",
        titulo: "Inauguración",
        ponente: "Lic. en Fil. Luis Ramón Vega Ramírez — Coordinador UES San José del Rincón",
        cupos: 45,
        maxCupos: 100,
        tipo: "Inauguración",
        lugar: "Aula Magna",
      },
      {
        hora: "10:10 - 12:00",
        titulo: 'Documental "Batsi: el Ajolote y su reflejo"',
        ponente: "Dra. Aracely Rojas López — Universidad Intercultural del Estado de México",
        cupos: 45,
        maxCupos: 100,
        tipo: "Cultural",
        lugar: "Aula Magna",
      },
      {
        hora: "12:00 - 13:00",
        titulo: "Declamación Vals sin fin",
        ponente: "Liliana Sánchez Javier — Estudiantes de la UES San José del Rincón",
        cupos: 10,
        maxCupos: 30,
        tipo: "Cultural",
        lugar: "Aula Magna",
      },
      {
        hora: "13:00 - 14:00",
        titulo: "Abejas silvestres, maíz y biotecnologías: interacciones desventajosas",
        ponente: "Dra. Adriana Tapia Hernández",
        cupos: 60,
        maxCupos: 100,
        tipo: "Conferencia",
        lugar: "Aula Magna",
      },
    ],
  },
  {
    id: "mar",
    label: "Mar 2",
    fecha: "Martes 2 de Diciembre",
    eventos: [
      {
        hora: "09:00 - 09:10",
        titulo: "Inicio de actividades",
        ponente: "Ing. Jesus Omar Espinoza Díaz",
        cupos: 100,
        maxCupos: 100,
        tipo: "Inauguración",
        lugar: "Aula Magna",
      },
      {
        hora: "10:00 - 11:00",
        titulo: "Cómo construir tu camino como desarrollador de software hasta trabajar en empresas top de Latinoamérica",
        ponente: "Ing. en Computación Victor Manuel Zuñiga Aguilar",
        cupos: 85,
        maxCupos: 100,
        tipo: "Conferencia",
        lugar: "Aula Magna",
      },
      {
        hora: "11:00 - 11:50",
        titulo: "Mosca soldado negra, una aliada para una agricultura sustentable y circular",
        ponente: "Doctorante Brianda Yaret Solorzano Tello",
        cupos: 40,
        maxCupos: 50,
        tipo: "Conferencia",
        lugar: "Aula Magna",
      },
      {
        hora: "11:50 - 12:10",
        titulo: "Narrativa de la historia del municipio de San José del Rincón",
        ponente: "Profesor Jaime Martínez Vázquez",
        cupos: 80,
        maxCupos: 100,
        tipo: "Cultural",
        lugar: "Aula Magna",
      },
      {
        hora: "12:10 - 13:00",
        titulo: "Elementos de la facturación electrónica",
        ponente: "Lic. en Contaduría Julio Cesar Posadas Estrada",
        cupos: 70,
        maxCupos: 100,
        tipo: "Conferencia",
        lugar: "Aula Magna",
      },
      {
        hora: "13:00 - 14:00",
        titulo: "De cero a AI Engineer: Cómo Construir Sistemas de IA del Mundo Real",
        ponente: "Ing. de Software Edgar Zuñiga Aguilar",
        cupos: 65,
        maxCupos: 100,
        tipo: "Conferencia",
        lugar: "Aula Magna",
      },
      {
        hora: "14:30 - 14:50",
        titulo: "Presentación musical",
        ponente: "Mtro. José Julián",
        cupos: 91,
        maxCupos: 100,
        tipo: "Cultural",
        lugar: "Aula Magna",
      },
    ],
  },
  {
    id: "mie",
    label: "Mié 3",
    fecha: "Miércoles 3 de Diciembre",
    eventos: [
      {
        hora: "10:00 - 10:10",
        titulo: "Inicio de actividades",
        ponente: "L.C. Ana Lucina Hernández García",
        cupos: 100,
        maxCupos: 100,
        tipo: "Inauguración",
        lugar: "Aula Magna",
      },
      {
        hora: "11:00 - 11:10",
        titulo: "Interpretación musical",
        ponente: "Joanna Lizbeth Osornio Lara — Estudiante de la UES San José del Rincón",
        cupos: 30,
        maxCupos: 60,
        tipo: "Cultural",
        lugar: "Aula Magna",
      },
      {
        hora: "11:10 - 12:00",
        titulo: "La actuación del Contador como Auditor a nivel Internacional",
        ponente: "C.P.C. Geder Gamaliel Vela Montes",
        cupos: 55,
        maxCupos: 100,
        tipo: "Conferencia",
        lugar: "Aula Magna",
      },
      {
        hora: "12:00 - 13:00",
        titulo: "Taller de Manualidades",
        ponente: "Mtra. Jazmín Mónica Martínez Marín",
        cupos: 18,
        maxCupos: 30,
        tipo: "Taller",
        lugar: "Aula Magna",
      },
    ],
  },
  {
    id: "jue",
    label: "Jue 4",
    fecha: "Jueves 4 de Diciembre",
    eventos: [
      {
        hora: "09:00 - 09:10",
        titulo: "Inicio de actividades",
        ponente: "C.P. Sergio Sánchez Sánchez",
        cupos: 100,
        maxCupos: 100,
        tipo: "Inauguración",
        lugar: "Aula Magna",
      },
      {
        hora: "09:10 - 10:00",
        titulo: "Protección de los Derechos Digitales del Consumidor en el Comercio Electrónico",
        ponente: "Mtra. Liliana Belem Galindo Téllez",
        cupos: 58,
        maxCupos: 80,
        tipo: "Conferencia",
        lugar: "Aula Magna",
      },
      {
        hora: "11:00 - 11:10",
        titulo: "Coreografía de la Banda de Rock Nachtblut",
        ponente: "Estudiantes del grupo 13LC171 de la UES San José del Rincón",
        cupos: 100,
        maxCupos: 100,
        tipo: "Cultural",
        lugar: "Aula Magna",
      },
      {
        hora: "11:10 - 12:00",
        titulo: "Inteligencia computacional: aplicación de lógica difusa en manufactura y energía renovable",
        ponente: "Dr. Everardo Efren Granda Gutiérrez",
        cupos: 42,
        maxCupos: 100,
        tipo: "Conferencia",
        lugar: "Aula Magna",
      },
      {
        hora: "12:10 - 13:00",
        titulo: "Produsan y plantifor rompiendo paradigmas, Sistemas M-5 hacia una Agricultura regenerativa",
        ponente: "Ing. Hilda Merlos Mora e Ing. Gerardo Zacarías Nuñez",
        cupos: 75,
        maxCupos: 100,
        tipo: "Conferencia",
        lugar: "Aula Magna",
      },
    ],
  },
  {
    id: "vie",
    label: "Vie 5",
    fecha: "Viernes 5 de Diciembre",
    eventos: [
      {
        hora: "09:00 - 09:10",
        titulo: "Inicio de actividades",
        ponente: "Ing. Manuel Roberto Chávez Cruz",
        cupos: 100,
        maxCupos: 100,
        tipo: "Inauguración",
        lugar: "Explanada institucional",
      },
      {
        hora: "09:10 - 11:00",
        titulo: "Torneo de Robots",
        ponente: "Facultad de Ingeniería — UES San José del Rincón",
        cupos: 50,
        maxCupos: 100,
        tipo: "Taller",
        lugar: "Explanada institucional",
      },
      {
        hora: "11:00 - 14:00",
        titulo: "Elección de Chica y Chico UESSJR 2025",
        ponente: "Estudiantes, planta docente y administrativa de la UES San José del Rincón",
        cupos: 200,
        maxCupos: 300,
        tipo: "Cultural",
        lugar: "Explanada municipal de San José del Rincón",
      },
      {
        hora: "14:00 - 14:10",
        titulo: "Cierre del evento",
        ponente: "Lic. en Fil. Luis Ramón Vega Ramírez — Coordinador UES San José del Rincón",
        cupos: 200,
        maxCupos: 300,
        tipo: "Cierre",
        lugar: "Explanada municipal de San José del Rincón",
      },
    ],
  },
]

const tipoBadge: Record<string, { bg: string; text: string }> = {
  Conferencia: { bg: "#064E3B", text: "#ffffff" },
  Cultural: { bg: "#FDDC98", text: "#735B24" },
  Taller: { bg: "#1A1B22", text: "#ffffff" },
  Inauguración: { bg: "#3F4942", text: "#ffffff" },
  Cierre: { bg: "#785F28", text: "#ffffff" },
}

export default function CronogramaPage() {
  const [diaActivo, setDiaActivo] = useState<string>("todos")
  const [agendados, setAgendados] = useState<Set<string>>(new Set())

  function toggleAgenda(key: string) {
    setAgendados((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const eventosFiltrados =
    diaActivo === "todos"
      ? dias.flatMap((d) => d.eventos.map((ev) => ({ ...ev, diaId: d.id, diaFecha: d.fecha })))
      : dias
          .filter((d) => d.id === diaActivo)
          .flatMap((d) => d.eventos.map((ev) => ({ ...ev, diaId: d.id, diaFecha: d.fecha })))

  // Split into two columns
  const col1 = eventosFiltrados.filter((_, i) => i % 2 === 0)
  const col2 = eventosFiltrados.filter((_, i) => i % 2 === 1)

  const totalPonentes = dias.reduce((acc, d) => acc + d.eventos.length, 0)

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#FBF8FF" }}>
      <Navbar />
      <div className="pt-14">
        {/* Top two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Left: hero panel */}
          <div
            className="lg:col-span-2 px-8 py-10 flex flex-col justify-between min-h-[240px]"
            style={{ background: "linear-gradient(135deg, #64FC05 0%, #6CEA1D 100%)" }}
          >
            <div>
              <p className="text-xs font-semibold tracking-widest text-white/70 uppercase mb-2">
                Bienvenido al evento
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                12va Jornada<br />Académica y<br />Cultural
              </h1>
              <p className="text-black/150 text-sm leading-relaxed max-w-sm">
                Explora la frontera del conocimiento. Gestiona tu asistencia a las sesiones más innovadoras de la Universidad Mexiquense del Bicentenario.
              </p>
            </div>
            <div className="mt-6">
              <button
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white border border-white/40 hover:bg-white/10 transition"
                style={{ backgroundColor: "#006341" }}
              >
                Descargar Programa PDF
              </button>
            </div>
          </div>

          {/* Right: Mi Agenda */}
          <div className="bg-white border-l border-gray-100 px-6 py-8 flex flex-col gap-6">
            <h2 className="text-sm font-bold text-[#1A1B22]">Mi Agenda Personal</h2>

            {agendados.size === 0 ? (
              <div className="flex flex-col items-center justify-center text-center gap-2 py-6">
                <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <BookOpen size={16} className="text-gray-300" />
                </div>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[160px]">
                  Inicia sesión para agregar tus sesiones preferidas.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {Array.from(agendados).map((key) => (
                  <div key={key} className="text-xs text-[#065F46] bg-green-50 rounded-lg px-3 py-2 font-medium">
                    {key.split("__")[0]}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Progreso de Jornada</span>
                <span className="text-[10px] text-gray-400">20%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: "20%", backgroundColor: "#64FC05" }} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="border border-gray-100 rounded-xl p-3 text-center">
                <p className="text-2xl font-black text-[#735B24]">{String(totalPonentes).padStart(2, "0")}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5 font-semibold">Ponentes Hoy</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#64FC05" }}>
                <p className="text-2xl font-black text-black">20</p>
                <p className="text-[10px] text-black/60 uppercase tracking-wider mt-0.5 font-semibold">Cupos Libres</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sessions section */}
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10">
          {/* Title + filter */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#1A1B22]">Agenda de Sesiones</h2>
            <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M3 6h18M7 12h10M11 18h2" strokeLinecap="round"/>
              </svg>
              Filtrar
            </button>
          </div>

          {/* Day tabs */}
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {[{ id: "todos", label: "Todos" }, ...dias.map((d) => ({ id: d.id, label: d.label }))].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDiaActivo(tab.id)}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition"
                style={
                  diaActivo === tab.id
                    ? { backgroundColor: "#064E3B", color: "#ffffff" }
                    : { backgroundColor: "#f3f4f6", color: "#6b7280" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Two-column events grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Column 1 */}
            <div className="flex flex-col gap-5">
              {col1.map((ev, i) => {
                const key = `${ev.titulo}__${ev.diaId}`
                const isAgendado = agendados.has(key)
                const badge = tipoBadge[ev.tipo] ?? { bg: "#e5e7eb", text: "#374151" }
                return (
                  <EventCard
                    key={`c1-${i}`}
                    ev={ev}
                    badge={badge}
                    isAgendado={isAgendado}
                    onToggle={() => toggleAgenda(key)}
                  />
                )
              })}
            </div>
            {/* Column 2 */}
            <div className="flex flex-col gap-5">
              {col2.map((ev, i) => {
                const key = `${ev.titulo}__${ev.diaId}`
                const isAgendado = agendados.has(key)
                const badge = tipoBadge[ev.tipo] ?? { bg: "#e5e7eb", text: "#374151" }
                return (
                  <EventCard
                    key={`c2-${i}`}
                    ev={ev}
                    badge={badge}
                    isAgendado={isAgendado}
                    onToggle={() => toggleAgenda(key)}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function EventCard({
  ev,
  badge,
  isAgendado,
  onToggle,
}: {
  ev: Evento & { diaFecha: string }
  badge: { bg: string; text: string }
  isAgendado: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      {/* Day + time */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: badge.bg }}>
          {ev.diaFecha.split(" ").slice(0, 1)} &bull; {ev.hora}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-bold text-[#1A1B22] leading-snug">{ev.titulo}</p>

      {/* Ponente */}
      <p className="text-xs text-gray-400">Ponente: {ev.ponente}</p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users size={12} />
          <span>{ev.cupos}/{ev.maxCupos} Cupos</span>
        </div>
        <button
          onClick={onToggle}
          className="px-4 py-1.5 rounded-lg text-xs font-bold border transition"
          style={
            isAgendado
              ? { backgroundColor: "#064E3B", color: "#ffffff", borderColor: "#064E3B" }
              : { backgroundColor: "#ffffff", color: "#064E3B", borderColor: "#064E3B" }
          }
        >
          {isAgendado ? "AGENDADO" : "AGENDAR"}
        </button>
      </div>

      {/* Bottom accent bar */}
      <div className="h-0.5 rounded-full mt-1" style={{ backgroundColor: "#64FC05" }} />
    </div>
  )
}
