import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import InitDB from '@/components/InitDB'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://segundo-parcial.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Agenda Digital UES San José del Rincón | Jornada Académica y Cultural',
    template: '%s | UES San José del Rincón',
  },
  description:
    'Agenda Digital oficial de la Universidad Mexiquense del Bicentenario UES San José del Rincón. Consulta el cronograma, sesiones, talleres y conferencias de la Jornada Académica y Cultural.',
  keywords: [
    'Agenda Digital UES San José del Rincón',
    'UES San José del Rincón',
    'Universidad Mexiquense del Bicentenario',
    'Jornada Académica UES',
    'Jornada Cultural San José del Rincón',
    'UMB San José del Rincón',
    'agenda digital ues san jose del rincon',
    'ues san jose del rincon',
    'eventos UES',
    'cronograma UMB',
    'San José del Rincón Estado de México',
    'UMB Bicentenario',
  ],
  authors: [{ name: 'Universidad Mexiquense del Bicentenario UES San José del Rincón' }],
  creator: 'Universidad Mexiquense del Bicentenario',
  publisher: 'Universidad Mexiquense del Bicentenario',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: siteUrl,
    siteName: 'Agenda Digital UES San José del Rincón',
    title: 'Agenda Digital UES San José del Rincón | Jornada Académica y Cultural',
    description:
      'Agenda Digital oficial de la UES San José del Rincón. Consulta sesiones, talleres y conferencias de la Jornada Académica y Cultural de la Universidad Mexiquense del Bicentenario.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agenda Digital UES San José del Rincón',
    description:
      'Consulta el cronograma oficial de la Jornada Académica y Cultural de la UES San José del Rincón.',
  },
  alternates: {
    canonical: siteUrl,
  },
  category: 'education',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${siteUrl}/#organization`,
      name: 'Universidad Mexiquense del Bicentenario UES San José del Rincón',
      alternateName: ['UES San José del Rincón', 'UMB San José del Rincón', 'UES San Jose del Rincon'],
      url: siteUrl,
      description:
        'Agenda Digital oficial de la Universidad Mexiquense del Bicentenario, Unidad de Estudios Superiores de San José del Rincón, Estado de México.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'San José del Rincón',
        addressRegion: 'Estado de México',
        addressCountry: 'MX',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Agenda Digital UES San José del Rincón',
      description: 'Agenda Digital oficial de la UES San José del Rincón',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'es-MX',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/sesiones?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Event',
      '@id': `${siteUrl}/#jornada`,
      name: 'Jornada Académica y Cultural - UES San José del Rincón',
      description:
        'Jornada Académica y Cultural de la Universidad Mexiquense del Bicentenario, con sesiones, talleres, conferencias y actividades culturales.',
      organizer: { '@id': `${siteUrl}/#organization` },
      location: {
        '@type': 'Place',
        name: 'UES San José del Rincón',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'San José del Rincón',
          addressRegion: 'Estado de México',
          addressCountry: 'MX',
        },
      },
      url: siteUrl,
      inLanguage: 'es-MX',
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} bg-background`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <InitDB />
          {children}
          <Toaster />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
