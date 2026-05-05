import { NextResponse } from 'next/server'
import { PDFDocument, rgb } from 'pdf-lib'
import mysql from 'mysql2/promise'

function getDayNameFromDate(dateString: string): string {
  const date = new Date(dateString)
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[date.getUTCDay()]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getUTCDate()
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  const month = monthNames[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  return `${day} de ${month} de ${year}`
}

export async function GET() {
  let connection: mysql.Connection | null = null
  try {
    // Conectar directamente a la BD
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT ?? 3306),
    })

    // Ejecutar query
    const [sessions] = await connection.execute('SELECT * FROM sesiones ORDER BY dia ASC, hora_inicio ASC')
    const sessionsList = Array.isArray(sessions) ? sessions : []

    console.log('Sesiones obtenidas:', sessionsList.length)
    
    if (!sessionsList || sessionsList.length === 0) {
      console.error('No hay sesiones en la BD')
      return new NextResponse('No hay sesiones disponibles', { status: 404 })
    }

    // Agrupar por día
    const grouped: Record<string, any[]> = {}
    sessionsList.forEach((session: any) => {
      const dayName = getDayNameFromDate(session.dia)
      if (!grouped[dayName]) {
        grouped[dayName] = []
      }
      grouped[dayName].push(session)
    })

    console.log('Sesiones agrupadas:', Object.keys(grouped))

    // Crear PDF
    const pdfDoc = await PDFDocument.create()

    // Colores
    const lightGreen = rgb(100 / 255, 252 / 255, 5 / 255) // #64FC05
    const darkGreen = rgb(6 / 255, 79 / 255, 68 / 255) // #064E3B
    const darkText = rgb(26 / 255, 27 / 255, 34 / 255) // #1A1B22
    const lightText = rgb(120 / 255, 120 / 255, 120 / 255)
    const white = rgb(255 / 255, 255 / 255, 255 / 255)
    const veryLightGray = rgb(245 / 255, 245 / 255, 245 / 255)

    const boldFont = await pdfDoc.embedFont('Helvetica-Bold')
    const regularFont = await pdfDoc.embedFont('Helvetica')

    let page = pdfDoc.addPage([595, 842]) // A4
    let yPosition = 800

    // ===== ENCABEZADO =====
    page.drawRectangle({
      x: 0,
      y: yPosition - 70,
      width: 595,
      height: 70,
      color: lightGreen,
    })

    page.drawText('12va JORNADA ACADÉMICA Y CULTURAL', {
      x: 40,
      y: yPosition - 30,
      size: 26,
      color: darkText,
      font: boldFont,
    })

    page.drawText('Universidad Mexiquense del Bicentenario', {
      x: 40,
      y: yPosition - 55,
      size: 10,
      color: darkText,
      font: regularFont,
    })

    yPosition -= 85

    // Fecha del evento
    if (sessionsList.length > 0) {
      const firstDate = formatDate(sessionsList[0].dia)
      page.drawText(`Cronograma de Actividades - ${firstDate}`, {
        x: 40,
        y: yPosition,
        size: 11,
        color: darkGreen,
        font: boldFont,
      })
    }

    yPosition -= 25

    // ===== PROCESAMIENTO DE DÍAS Y SESIONES =====
    const dayOrder = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    
    for (const dayName of dayOrder) {
      const daySessions = grouped[dayName]
      if (!daySessions) continue

      // Verificar si necesitamos nueva página
      if (yPosition < 180) {
        page = pdfDoc.addPage([595, 842])
        yPosition = 800
      }

      // ===== ENCABEZADO DEL DÍA =====
      page.drawRectangle({
        x: 40,
        y: yPosition - 30,
        width: 515,
        height: 30,
        color: darkGreen,
      })

      page.drawText(dayName.toUpperCase(), {
        x: 50,
        y: yPosition - 18,
        size: 14,
        color: white,
        font: boldFont,
      })

      yPosition -= 45

      // ===== SESIONES DEL DÍA =====
      for (const session of daySessions) {
        // Verificar espacio
        if (yPosition < 100) {
          page = pdfDoc.addPage([595, 842])
          yPosition = 800
        }

        const sessionHeight = 80
        const timeBoxWidth = 90
        const contentBoxWidth = 425

        // ===== CAJA DE HORA (izquierda) =====
        page.drawRectangle({
          x: 40,
          y: yPosition - sessionHeight,
          width: timeBoxWidth,
          height: sessionHeight,
          color: darkGreen,
        })

        // Hora de inicio
        page.drawText(session.hora_inicio, {
          x: 50,
          y: yPosition - 25,
          size: 12,
          color: lightGreen,
          font: boldFont,
        })

        // Guión
        page.drawText('a', {
          x: 50,
          y: yPosition - 40,
          size: 9,
          color: white,
          font: regularFont,
        })

        // Hora de fin
        page.drawText(session.hora_fin, {
          x: 50,
          y: yPosition - 55,
          size: 12,
          color: lightGreen,
          font: boldFont,
        })

        // ===== CAJA DE CONTENIDO (derecha) =====
        page.drawRectangle({
          x: 40 + timeBoxWidth,
          y: yPosition - sessionHeight,
          width: contentBoxWidth,
          height: sessionHeight,
          color: veryLightGray,
          borderColor: darkGreen,
          borderWidth: 1.5,
        })

        // Título de la sesión (centrado dentro del cuadro)
        const titleX = 40 + timeBoxWidth + 15
        const titleMaxWidth = contentBoxWidth - 30
        page.drawText(session.titulo, {
          x: titleX,
          y: yPosition - 20,
          size: 12,
          color: darkText,
          font: boldFont,
          maxWidth: titleMaxWidth,
        })

        // Ponente
        page.drawText(`Ponente: ${session.ponente}`, {
          x: titleX,
          y: yPosition - 38,
          size: 9,
          color: lightText,
          font: regularFont,
        })

        // Lugar
        page.drawText(`Lugar: ${session.lugar}`, {
          x: titleX,
          y: yPosition - 50,
          size: 9,
          color: lightText,
          font: regularFont,
        })

        // Tipo (badge)
        const badgeX = titleX
        const badgeWidth = 70
        page.drawRectangle({
          x: badgeX,
          y: yPosition - 66,
          width: badgeWidth,
          height: 12,
          color: rgb(220 / 255, 220 / 255, 220 / 255),
        })

        page.drawText(session.tipo, {
          x: badgeX + 5,
          y: yPosition - 64,
          size: 7,
          color: darkText,
          font: boldFont,
        })

        yPosition -= (sessionHeight + 15)
      }

      yPosition -= 10
    }

    // ===== GENERAR PDF =====
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
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}
