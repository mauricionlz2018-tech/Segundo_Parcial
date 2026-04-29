import Link from "next/link"
import Image from "next/image"

export default function Hero() {
  return (
    <section
      id="inicio"
      className="pt-14 min-h-[520px] flex items-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #64FC05 0%, #006341 100%)",
      }}
    >
      {/* Background texture: building louvre grid image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('images/UMB_SAN_JOSE.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
          mixBlendMode: "overlay",
        }}
        aria-hidden="true"
      />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 py-14 w-full">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left content */}
          <div className="flex-1 flex flex-col">
            {/* Badge */}
            <div
              className="self-start text-xs font-semibold px-3 py-1 rounded-full mb-6"
              style={{ backgroundColor: "#FDDC98", color: "#735B24" }}
            >
              San José del Rincón, 2025
            </div>

            {/* Title */}
            <h1 className="font-sans text-5xl sm:text-6xl font-bold text-white leading-tight text-balance mb-8">
              12va Jornada<br />
              Académica y<br />
              Cultural
            </h1>

            {/* CTA + Date row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Link
                href="#registro"
                className="inline-flex items-center justify-center px-6 py-3 rounded-md text-white text-sm font-semibold"
                style={{ backgroundColor: "#3F4942" }}
              >
                Registrarse Ahora
              </Link>
              <div>
                <p className="text-xs text-white/80 uppercase tracking-wider mb-0.5">
                  Fecha del Evento
                </p>
                <p className="text-white font-semibold text-base">
                  1-5 de Diciembre, 2025
                </p>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="flex-shrink-0 w-full md:w-[420px]">
            <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
              <Image
                src="images/Colibri_umb.png"
                alt="Pasillo interior de la Universidad Mexiquense del Bicentenario"
                width={840}
                height={630}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
