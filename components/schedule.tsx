const days = [
  {
    date: "1 Dic",
    day: "Lunes",
    events: [
      { time: "09:00 AM", title: "Ceremonia de Inauguración", type: "Apertura" },
      { time: "10:30 AM", title: "Conferencia Magistral – Innovación Agrícola", type: "Ponencia" },
      { time: "12:00 PM", title: "Taller: Herramientas para la Sustentabilidad", type: "Taller" },
      { time: "04:00 PM", title: "Mesa Redonda – Tecnología y Sociedad", type: "Panel" },
    ],
  },
  {
    date: "2 Dic",
    day: "Martes",
    events: [
      { time: "09:00 AM", title: "Ponencia: Sistemas Computacionales Emergentes", type: "Ponencia" },
      { time: "11:00 AM", title: "Taller: Programación y IA", type: "Taller" },
      { time: "03:00 PM", title: "Exposición de Proyectos Estudiantiles", type: "Exposición" },
    ],
  },
  {
    date: "3 Dic",
    day: "Miércoles",
    events: [
      { time: "09:00 AM", title: "Conferencia: Contaduría Digital", type: "Ponencia" },
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
      { time: "09:00 AM", title: "Presentación de Resultados", type: "Ponencia" },
      { time: "11:00 AM", title: "Reconocimientos y Clausura", type: "Apertura" },
    ],
  },
]

const typeColors: Record<string, string> = {
  Apertura: "bg-brand-gold/20 text-amber-700 border-brand-gold/30",
  Ponencia: "bg-primary/10 text-primary border-primary/20",
  Taller: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Panel: "bg-blue-50 text-blue-700 border-blue-200",
  Exposición: "bg-purple-50 text-purple-700 border-purple-200",
  Cultural: "bg-pink-50 text-pink-700 border-pink-200",
  Networking: "bg-orange-50 text-orange-700 border-orange-200",
}

export default function Schedule() {
  return (
    <section id="cronograma" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary px-4 py-1.5 bg-secondary rounded-full mb-4">
            Programa del Evento
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-foreground text-balance">
            Cronograma <span className="text-primary">2025</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Del 1 al 5 de Diciembre de 2025 en San José del Rincón, Estado de México.
          </p>
        </div>

        {/* Days grid */}
        <div className="grid md:grid-cols-5 gap-4">
          {days.map((day) => (
            <div key={day.date} className="flex flex-col gap-3">
              {/* Day header */}
              <div className="bg-brand-green-dark text-primary-foreground rounded-xl p-4 text-center">
                <p className="text-brand-gold font-bold text-xl">{day.date}</p>
                <p className="text-primary-foreground/70 text-xs uppercase tracking-wider">{day.day}</p>
              </div>

              {/* Events */}
              <div className="flex flex-col gap-2">
                {day.events.map((event) => (
                  <div
                    key={event.title}
                    className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <p className="text-xs text-muted-foreground mb-1">{event.time}</p>
                    <p className="text-sm font-medium text-foreground leading-snug mb-2">{event.title}</p>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${typeColors[event.type] ?? "bg-muted text-muted-foreground border-border"}`}
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
