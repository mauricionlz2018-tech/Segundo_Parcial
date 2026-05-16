import Image from "next/image"
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
    <footer className="bg-white dark:bg-[#1A1F2E] border-t border-gray-200 dark:border-gray-800 py-10 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Brand section */}
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <Image
            src="/images/sanjose.png"
            alt="San José del Rincón"
            width={56}
            height={56}
            className="rounded-md"
          />
          <div>
            <h2 className="text-sm font-bold text-black dark:text-white uppercase tracking-wide">UES San José del Rincón</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Universidad Mexiquense del Bicentenario</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Navigation */}
          <div>
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
              Navegación
            </h3>
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
              Legal
            </h3>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-4">
              Síguenos
            </h3>
            <div className="flex items-center gap-4 mt-1">
              <Link href="#" aria-label="Compartir" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <Share2 size={18} />
              </Link>
              <Link href="#" aria-label="Estadísticas" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <BarChart2 size={18} />
              </Link>
              <Link href="#" aria-label="Feed RSS" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <Rss size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
