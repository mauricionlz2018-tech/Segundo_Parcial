import Link from "next/link"
import { Share2, BarChart2, Rss } from "lucide-react"

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Cronograma", href: "/cronograma" },
  { label: "Sedes", href: "/sedes" },
]

const legalLinks = [
  { label: "Privacidad", href: "#" },
  { label: "Contacto", href: "#" },
  { label: "Soporte", href: "#" },
]

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-10 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 gap-8">
          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">
              Navegación
            </h3>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-black transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">
              Legal
            </h3>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-black transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-bold text-black uppercase tracking-widest mb-4">
              Síguenos
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <Link href="#" aria-label="Compartir" className="text-gray-500 hover:text-black transition-colors">
                <Share2 size={18} />
              </Link>
              <Link href="#" aria-label="Estadísticas" className="text-gray-500 hover:text-black transition-colors">
                <BarChart2 size={18} />
              </Link>
              <Link href="#" aria-label="Feed RSS" className="text-gray-500 hover:text-black transition-colors">
                <Rss size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
