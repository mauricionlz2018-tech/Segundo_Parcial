export default function About() {
  return (
    <section id="sedes" className="py-10 px-6 lg:px-10" style={{ backgroundColor: "#FBF8FF" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Left – text */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-black mb-4">Conocenos</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              La Universidad Mexiquense del Bicentenario, UES San José del Rincón se enorgullece en presentar la{" "}
              <strong>12va Jornada Académica y Cultural</strong>
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Este espacio está diseñado para fomentar el intercambio de ideas entre estudiantes, investigadores y expertos globales, consolidando nuestra misión de excelencia educativa y compromiso social.
            </p>
          </div>

          {/* Right – stat cards */}
          <div className="flex gap-4 md:shrink-0">
            {/* Card 1 – white */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm px-8 py-6 flex flex-col items-center min-w-[110px]">
              <span className="text-3xl font-bold" style={{ color: "#735B24" }}>10+</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Ponentes</span>
            </div>
            {/* Card 2 – green */}
            <div className="rounded-lg px-8 py-6 flex flex-col items-center min-w-[110px]" style={{ backgroundColor: "#64FC05" }}>
              <span className="text-3xl font-bold text-black">2</span>
              <span className="text-xs font-semibold text-black uppercase tracking-wide mt-1">Talleres</span>
            </div>
          </div>
        </div>

        {/* Divider */}
      </div>
    </section>
  )
}
