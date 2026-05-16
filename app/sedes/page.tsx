import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Image from "next/image"
import { MapPin, CheckCircle } from "lucide-react"

const sedes = [
  {
    nombre: "Edificio Principal UMB",
    descripcion:
      "Sede central del evento. Aquí se realizarán las conferencias magistrales, la ceremonia de inauguración y clausura, y la feria de proyectos estudiantiles.",
    direccion: "Carretera Toluca–San José del Rincón Km. 64, San José del Rincón, Estado de México.",
    eventos: ["Inauguración", "Conferencias magistrales", "Clausura", "Feria de proyectos"],
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-04-08%20at%204.09.00%20PM%20%281%29-pZSBLdQzx0kmKqyPPsoutuahmNs7ml.jpeg",
    badge: "Sede Principal",
    badgeBg: "#164739",
    badgeText: "#ffffff",
  },
  {
    nombre: "Aula Magna — Interior UMB",
    descripcion:
      "Espacio interior destinado para talleres prácticos, paneles de discusión y todas las actividades académicas y culturales del programa.",
    direccion: "Interior del edificio UMB, San José del Rincón, Estado de México.",
    eventos: ["Talleres", "Paneles", "Actividades culturales", "Presentaciones"],
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-04-08%20at%204.09.00%20PM%20%282%29-9NH5eoE2K1gAhOgmH4H2C3S2a8yNGf.jpeg",
    badge: "Aula Magna",
    badgeBg: "#3F4942",
    badgeText: "#ffffff",
  },
  {
    nombre: "Explanada UMB",
    descripcion:
      "Área exterior de la universidad para actividades al aire libre como el Torneo de Robots, la Elección de Chica y Chico UESSJR 2025 y la ceremonia de cierre.",
    direccion: "Área exterior, Edificio UMB y Explanada municipal de San José del Rincón.",
    eventos: ["Torneo de Robots", "Elección UESSJR 2025", "Cierre del evento"],
    imagen:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-04-08%20at%204.09.00%20PM%20%285%29-rx335vacamLqDeeMUa7o3g4XVw9r8i.jpeg",
    badge: "Área Exterior",
    badgeBg: "#735B24",
    badgeText: "#ffffff",
  },
]

export default function SedesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="pt-14">
        {/* Header */}
        <div
          className="px-6 lg:px-16 py-12"
          style={{ background: "linear-gradient(135deg, #64FC05 0%, #006341 100%)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/images/sanjose.png"
              alt="San José del Rincón"
              width={56}
              height={56}
              className="rounded-md"
            />
            <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
              12va Jornada Académica y Cultural
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">Sedes del Evento</h1>
          <p className="text-white/75 mt-2 text-sm">
            Conoce los espacios donde se desarrollará la jornada — 1 al 5 de Diciembre, 2025
          </p>
        </div>

        {/* Sedes */}
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12 flex flex-col gap-8">
          {sedes.map((sede, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900"
              style={{ boxShadow: "0 1px 8px 0 rgba(0,0,0,0.05)" }}
            >
              {/* Image */}
              <div className="md:w-64 lg:w-72 shrink-0 h-52 md:h-auto relative">
                <Image
                  src={sede.imagen}
                  alt={sede.nombre}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 288px"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col justify-between px-7 py-6 gap-4 flex-1">
                <div className="flex flex-col gap-3">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full w-fit tracking-wide"
                    style={{ backgroundColor: sede.badgeBg, color: sede.badgeText }}
                  >
                    {sede.badge}
                  </span>
                  <h2 className="text-lg font-bold text-[#1A1B22] dark:text-white">{sede.nombre}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{sede.descripcion}</p>

                  {/* Address */}
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-400 dark:text-gray-500">{sede.direccion}</p>
                  </div>
                </div>

                {/* Events */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Actividades
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sede.eventos.map((ev) => (
                      <span
                        key={ev}
                        className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1"
                      >
                        <CheckCircle size={10} style={{ color: "#064E3B" }} />
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
