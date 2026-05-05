import { NextResponse } from 'next/server'
import { PDFDocument, rgb } from 'pdf-lib'
import { query } from '@/lib/db'

function getDayName(dayNumber: string | number): string {
  const days: Record<string, string> = {
    '1': 'Lunes',
    '2': 'Martes',
    '3': 'Miércoles',
    '4': 'Jueves',
    '5': 'Viernes',
  }
  return days[String(dayNumber)] || String(dayNumber)
}

export async function GET() {
  try {
    // Traer sesiones de la base de datos
    const sessions: any[] = await query(
      'SELECT * FROM sesiones ORDER BY dia ASC, hora_inicio ASC'
    )

    if (!sessions || sessions.length === 0) {
      return new NextResponse('No hay sesiones disponibles', { status: 404 })
    }

    // Agrupar por día
    const grouped: Record<string, any[]> = {}
    sessions.forEach((session) => {
      const dayNum = String(session.dia)
      if (!grouped[dayNum]) {
        grouped[dayNum] = []
      }
      grouped[dayNum].push(session)
    })

    // Crear PDF
    const pdfDoc = await PDFDocument.create()

    // Colores
    const lightGreen = rgb(100 / 255, 252 / 255, 5 / 255) // #64FC05
    const darkGreen = rgb(6 / 255, 79 / 255, 68 / 255) // #064E3B
    const darkText = rgb(26 / 255, 27 / 255, 34 / 255) // #1A1B22
    const lightText = rgb(100 / 255, 100 / 255, 100 / 255) // gris
    const white = rgb(255 / 255, 255 / 255, 255 / 255)

    const boldFont = await pdfDoc.embedFont('Helvetica-Bold')
    const regularFont = await pdfDoc.embedFont('Helvetica')

    let page = pdfDoc.addPage([595, 842]) // A4
    let yPosition = 800

    // Encabezado con fondo verde
    page.drawRectangle({
      x: 0,
      y: yPosition - 60,
      width: 595,
      height: 60,
      color: lightGreen,
    })

    // Título
    page.drawText('12va JORNADA ACADÉMICA Y CULTURAL', {
      x: 40,
      y: yPosition - 25,
      size: 24,
      color: darkText,
      font: boldFont,
      maxWidth: 515,
    })

    // Subtítulo
    page.drawText('Universidad Mexiquense del Bicentenario', {
      x: 40,
      y: yPosition - 50,
      size: 11,
      color: darkText,
      font: regularFont,
    })

    yPosition -= 80

    // Fecha del evento
    page.drawText('1 al 5 de Diciembre, 2025', {
      x: 40,
      y: yPosition,
      size: 10,
      color: lightText,
      font: regularFont,
    })

    yPosition -= 25

    // Procesar cada día
    const dayOrder = ['1', '2', '3', '4', '5']
    
    for (const dayNum of dayOrder) {
      const daySessions = grouped[dayNum]
      if (!daySessions) continue

      // Verificar si necesitamos nueva página
      if (yPosition < 150) {
        page = pdfDoc.addPage([595, 842])
        yPosition = 800
      }

      // Nombre del día
      const dayName = getDayName(dayNum)
      page.drawRectangle({
        x: 40,
        y: yPosition - 25,
        width: 515,
        height: 25,
        color: darkGreen,
      })

      page.drawText(dayName, {
        x: 50,
        y: yPosition - 15,
        size: 14,
        color: white,
        font: boldFont,
      })

      yPosition -= 35

      // Sesiones del día
      for (const session of daySessions) {
        // Verificar espacio disponible
        if (yPosition < 100) {
          page = pdfDoc.addPage([595, 842])
          yPosition = 800
        }

        // Caja de hora
        page.drawRectangle({
          x: 50,
          y: yPosition - 35,
          width: 70,
          height: 30,
          color: darkGreen,
        })

        page.drawText(session.hora_inicio, {
          x: 55,
          y: yPosition - 18,
          size: 11,
          color: white,
          font: boldFont,
        })

        // Contenedor de la sesión
        page.drawRectangle({
          x: 130,
          y: yPosition - 35,
          width: 425,
          height: 30,
          color: rgb(240 / 255, 250 / 255, 240 / 255), // Fondo muy claro
          borderColor: darkGreen,
          borderWidth: 1,
        })

        // Título de la sesión
        page.drawText(session.titulo, {
          x: 140,
          y: yPosition - 10,
          size: 11,
          color: darkText,
          font: boldFont,
          maxWidth: 400,
        })

        yPosition -= 45

        // Información de la sesión (en gris más pequeño)
        page.drawText(`Ponente: ${session.ponente}`, {
          x: 140,
          y: yPosition,
          size: 8,
          color: lightText,
          font: regularFont,
        })

        yPosition -= 12

        page.drawText(`Lugar: ${session.lugar}`, {
          x: 140,
          y: yPosition,
          size: 8,
          color: lightText,
          font: regularFont,
        })

        yPosition -= 12

        // Tipo de sesión (badge)
        const badgeWidth = 50
        page.drawRectangle({
          x: 140,
          y: yPosition - 10,
          width: badgeWidth,
          height: 12,
          color: rgb(200 / 255, 200 / 255, 200 / 255),
        })

        page.drawText(session.tipo, {
          x: 145,
          y: yPosition - 8,
          size: 7,
          color: darkText,
          font: boldFont,
        })

        yPosition -= 22

        // Línea divisora
        page.drawLine({
          start: { x: 50, y: yPosition },
          end: { x: 555, y: yPosition },
          color: rgb(200 / 255, 200 / 255, 200 / 255),
          thickness: 0.5,
        })

        yPosition -= 10
      }

      yPosition -= 10
    }

    // Generar PDF
    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="cronograma-jornada-2025.pdf"',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Error generando PDF:', error)
    return NextResponse.json(
      { error: 'Error al generar el PDF', details: String(error) },
      { status: 500 }
    )
  }
}
