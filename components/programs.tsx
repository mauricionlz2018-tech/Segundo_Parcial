import Image from "next/image"

const programs = [
  {
    title: "Ingeniería en Innovación Agrícola Sustentable",
    description:
      "Conocer como innovar las herramientas para mejorar procesos y en la sustentabilidad del ecosistema.",
    image:
      "images/IIAS.jpg",
    alt: "Pasillo interior de la UMB",
  },
  {
    title: "Ingeniería en Sistemas Computacionales",
    description:
      "Exploración sobre nuevas tecnologías emergentes para beneficiar a la sociedad.",
    image:
      "images/Sistemas.png",
    alt: "Edificio exterior de la Universidad Mexiquense del Bicentenario",
  },
  {
    title: "Licenciatura en Contaduría",
    description:
      "Administración y organización para el futuro de la vida contable.",
    image:
      "images/contaduria.jpg",
    alt: "Jardín con letras UMB en la Universidad Mexiquense del Bicentenario",
  },
]

export default function Programs() {
  return (
    <section className="py-12 px-6 lg:px-10" style={{ backgroundColor: "#FBF8FF" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#064E3B" }}>
          Nuestros enfoques
        </h2>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((program) => (
            <article
              key={program.title}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={program.image}
                  alt={program.alt}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1 border-b-4" style={{ borderBottomColor: "#64FC05" }}>
                <h3 className="text-sm font-bold mb-2 leading-snug" style={{ color: "#065F46" }}>
                  {program.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {program.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
