import { NextResponse } from "next/server";
import { PDFDocument, rgb, PageSizes, StandardFonts } from "pdf-lib";
import { query } from "@/lib/db";

const HEADER_GREEN = rgb(74 / 255, 124 / 255, 89 / 255);
const ROW_GREEN = rgb(234 / 255, 251 / 255, 226 / 255);
const DARK_TEXT = rgb(20 / 255, 20 / 255, 20 / 255);
const MEDIUM_TEXT = rgb(60 / 255, 60 / 255, 60 / 255);

function formatDate(dateString: string) {
  try {
    const [y, m, d] = dateString.split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const dayName = dayNames[date.getDay()];
    return `${dayName} ${Number(d)} de ${date.toLocaleString("es-MX", { month: "long" })} de ${y}`;
  } catch {
    return dateString;
  }
}

function formatTime(time: string) {
  if (!time || !time.includes(":")) return time;
  try {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  } catch {
    return time;
  }
}

export async function GET() {
  try {
    const rows = await query<any[]>(
      `SELECT dia, hora_inicio, hora_fin, titulo, ponente, lugar, tipo 
       FROM sesiones 
       ORDER BY dia ASC, hora_inicio ASC`
    );

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const margin = 44;
    const usableWidth = width - margin * 2;

    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Logo area - top horizontal bar
    page.drawRectangle({
      x: margin,
      y: height - 140,
      width: usableWidth,
      height: 84,
      color: rgb(248 / 255, 249 / 255, 251 / 255),
    });

    // Title area
    page.drawText("Jornada Académica y Cultural 2025", {
      x: margin,
      y: height - 28,
      size: 20,
      color: DARK_TEXT,
      font: bold,
    });

    page.drawText("UNIDAD DE ESTUDIOS SUPERIORES SAN JOSÉ DEL RINCÓN", {
      x: margin,
      y: height - 44,
      size: 8,
      color: MEDIUM_TEXT,
      font: bold,
    });

    page.drawText("Programa de Actividades", {
      x: margin,
      y: height - 56,
      size: 8,
      color: MEDIUM_TEXT,
      font: regular,
    });

    const headerY = height - 108;

    // Main header bar - green background
    page.drawRectangle({
      x: margin,
      y: headerY - 36,
      width: usableWidth,
      height: 36,
      color: HEADER_GREEN,
    });

    // Header text - Horario
    page.drawText("Horario", {
      x: margin + 12,
      y: headerY - 20,
      size: 12,
      color: rgb(1, 1, 1),
      font: bold,
    });

    // Header text - Actividades
    page.drawText("Actividades", {
      x: margin + 180,
      y: headerY - 20,
      size: 12,
      color: rgb(1, 1, 1),
      font: bold,
    });

    // Header date label
    page.drawText("Lunes 1 de diciembre de 2025", {
      x: margin + 340,
      y: headerY - 20,
      size: 10,
      color: rgb(245 / 255, 255 / 255, 230 / 255),
      font: bold,
    });

    let cursor = headerY - 46;

    // Group sessions by day
    const grouped: Record<string, any[]> = {};
    for (const s of rows) {
      const dayKey = formatDate(s.dia);
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(s);
    }

    const dayKeys = Object.keys(grouped);
    for (const day of dayKeys) {
      const sessions = grouped[day];
      const headerHeight = 34;

      if (cursor - 120 < 40) {
        const newPage = pdfDoc.addPage(PageSizes.A4);
        cursor = height - 52;
      }

      // Day header - green bar
      page.drawRectangle({
        x: margin,
        y: cursor - headerHeight,
        width: usableWidth,
        height: headerHeight,
        color: HEADER_GREEN,
      });

      // Day text
      page.drawText(day, {
        x: margin + 12,
        y: cursor - 22,
        size: 12,
        color: rgb(245 / 255, 255 / 255, 230 / 255),
        font: bold,
      });

      cursor -= headerHeight + 8;

      for (const ses of sessions) {
        const rowHeight = 68;

        if (cursor - rowHeight < 60) {
          const newPage = pdfDoc.addPage(PageSizes.A4);
          cursor = height - 52;

          page.drawRectangle({
            x: margin,
            y: cursor - headerHeight,
            width: usableWidth,
            height: headerHeight,
            color: HEADER_GREEN,
          });

          page.drawText(day, {
            x: margin + 12,
            y: cursor - 22,
            size: 12,
            color: rgb(245 / 255, 255 / 255, 230 / 255),
            font: bold,
          });

          cursor -= headerHeight + 8;
        }

        // Left column - horario con fondo verde
        const horarioWidth = 170;
        page.drawRectangle({
          x: margin,
          y: cursor - rowHeight,
          width: horarioWidth,
          height: rowHeight,
          color: HEADER_GREEN,
        });

        const timeStr = `${formatTime(ses.hora_inicio)} - ${formatTime(ses.hora_fin)}`;
        page.drawText(timeStr, {
          x: margin + 10,
          y: cursor - 22,
          size: 10,
          color: rgb(255, 255, 255),
          font: bold,
        });

        // Right column - contenido con fondo verde claro
        page.drawRectangle({
          x: margin + horarioWidth,
          y: cursor - rowHeight,
          width: usableWidth - horarioWidth,
          height: rowHeight,
          color: ROW_GREEN,
        });

        const contentX = margin + horarioWidth + 14;
        const maxTitleWidth = usableWidth - horarioWidth - 28;

        // Tipo de sesión badge
        const tipoY = cursor - 14;
        page.drawText(ses.tipo ?? "", {
          x: contentX,
          y: tipoY,
          size: 9,
          color: MEDIUM_TEXT,
          font: regular,
        });

        // Título
        const tituloY = cursor - 30;
        page.drawText(ses.titulo ?? "", {
          x: contentX,
          y: tituloY,
          size: 11,
          color: DARK_TEXT,
          font: bold,
          maxWidth: maxTitleWidth,
        });

        // Ponente
        const ponenteY = cursor - 46;
        page.drawText(ses.ponente ?? "—", {
          x: contentX,
          y: ponenteY,
          size: 9,
          color: MEDIUM_TEXT,
          font: regular,
        });

        // Lugar
        const lugarY = cursor - 58;
        page.drawText(`Lugar: ${ses.lugar ?? "—"}`, {
          x: contentX,
          y: lugarY,
          size: 9,
          color: MEDIUM_TEXT,
          font: regular,
        });

        cursor -= rowHeight;
      }

      cursor -= 10;
    }

    const pdfBytes = await pdfDoc.save();
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=programa-jornada.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json({ error: "No se pudo generar el PDF." }, { status: 500 });
  }
}
