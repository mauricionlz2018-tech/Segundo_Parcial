const days = [
  {
    date: "1 Dic",
    day: "Lunes",
    events: [
      { time: "09:00 AM", title: "Ceremonia de InauguraciÃ³n", type: "Apertura" },
      { time: "10:30 AM", title: "Conferencia Magistral â€“ InnovaciÃ³n AgrÃ­cola", type: "Ponencia" },
      { time: "12:00 PM", title: "Taller: Herramientas para la Sustentabilidad", type: "Taller" },
      { time: "04:00 PM", title: "Mesa Redonda â€“ TecnologÃ­a y Sociedad", type: "Panel" },
    ],
  },
  {
    date: "2 Dic",
    day: "Martes",
    events: [
      { time: "09:00 AM", title: "Ponencia: Sistemas Computacionales Emergentes", type: "Ponencia" },
      { time: "11:00 AM", title: "Taller: ProgramaciÃ³n y IA", type: "Taller" },
      { time: "03:00 PM", title: "ExposiciÃ³n de Proyectos Estudiantiles", type: "ExposiciÃ³n" },
    ],
  },
  {
    date: "3 Dic",
    day: "MiÃ©rcoles",
    events: [
      { time: "09:00 AM", title: "Conferencia: ContadurÃ­a Digital", type: "Ponencia" },
      { time: "11:00 AM", title: "Panel: Finanzas y Emprendimiento", type: "Panel" },
      { time: "02:00 PM", title: "Actividades Culturales", type: "Cultural" },
    ],
  },
  {
    date: "4 Dic",
    day: "Jueves",
    events: [
      { time: "09:00 AM", title: "Simposio Interdisciplinario", type: "Ponencia" },
      { time: "11:30 AM", title: "Taller: Desarrollo Sustentable", type: "Taller" },
      { time: "03:00 PM", title: "Networking Estudiantil", type: "Networking" },
    ],
  },
  {
    date: "5 Dic",
    day: "Viernes",
    events: [
      { time: "09:00 AM", title: "PresentaciÃ³n de Resultados", type: "Ponencia" },
      { time: "11:00 AM", title: "Reconocimientos y Clausura", type: "Apertura" },
    ],
  },
]

const typeColors: Record<string, string> = {
  Apertura: "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  Ponencia: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800",
  Taller: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
  Panel: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800",
  ExposiciÃ³n: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-800",
  Cultural: "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-200 border-pink-200 dark:border-pink-800",
  Networking: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-800",
}

export default function Schedule() {
  return (
    <section id="cronograma" className="py-24 bg-white dark:bg-[#0F172A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#065F46] dark:text-[#10B981] px-4 py-1.5 bg-[#EAFBE2] dark:bg-[#10B981]/20 rounded-full mb-4">
            Programa del Evento
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A1B22] dark:text-white text-balance">
            Cronograma <span className="text-[#065F46] dark:text-[#10B981]">2025</span>
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            Del 1 al 5 de Diciembre de 2025 en San JosÃ© del RincÃ³n, Estado de MÃ©xico.
          </p>
        </div>

        {/* Days grid */}
        <div className="grid md:grid-cols-5 gap-4">
          {days.map((day) => (
            <div key={day.date} className="flex flex-col gap-3">
              {/* Day header */}
              <div className="bg-[#065F46] dark:bg-[#10B981]/20 text-white dark:text-[#10B981] rounded-xl p-4 text-center border border-[#065F46] dark:border-[#10B981]/40">
                <p className="text-[#64FC05] dark:text-[#86EFAC] font-bold text-xl">{day.date}</p>
                <p className="text-white/70 dark:text-[#10B981]/70 text-xs uppercase tracking-wider">{day.day}</p>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-2">
                {day.events.map((event) => (
                  <div
                    key={event.title}
                    className="bg-white dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-[#065F46] dark:hover:border-[#10B981] hover:shadow-sm dark:hover:shadow-lg transition-all"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{event.time}</p>
                    <p className="text-sm font-medium text-[#1A1B22] dark:text-white leading-snug mb-2">{event.title}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeColors[event.type] ?? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"}`}
                    >
                      {event.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
