import { NextResponse } from "next/server";
import { PDFDocument, rgb, PageSizes, StandardFonts, PDFPage } from "pdf-lib";
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

// ✅ Helper: dibuja el encabezado de día en la página dada
function drawDayHeader(
  page: PDFPage,
  margin: number,
  usableWidth: number,
  cursor: number,
  day: string,
  bold: any,
  headerHeight: number
) {
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
}

export async function GET() {
  try {
    const rows = await query<any[]>(
      `SELECT dia, hora_inicio, hora_fin, titulo, ponente, lugar, tipo 
       FROM sesiones 
       ORDER BY dia ASC, hora_inicio ASC`
    );

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: "No se encontraron sesiones." }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // ✅ Función para agregar página y retornarla con su cursor
    const addNewPage = () => {
      const p = pdfDoc.addPage(PageSizes.A4);
      const { height } = p.getSize();
      return { page: p, cursor: height - 52 };
    };

    let { page, cursor } = (() => {
      const p = pdfDoc.addPage(PageSizes.A4);
      const { width, height } = p.getSize();
      const margin = 44;
      const usableWidth = width - margin * 2;

      // Encabezado principal (solo en primera página)
      p.drawRectangle({
        x: margin,
        y: height - 140,
        width: usableWidth,
        height: 84,
        color: rgb(248 / 255, 249 / 255, 251 / 255),
      });

      p.drawText("Jornada Académica y Cultural 2025", {
        x: margin,
        y: height - 28,
        size: 20,
        color: DARK_TEXT,
        font: bold,
      });

      p.drawText("UNIDAD DE ESTUDIOS SUPERIORES SAN JOSÉ DEL RINCÓN", {
        x: margin,
        y: height - 44,
        size: 8,
        color: MEDIUM_TEXT,
        font: bold,
      });

      p.drawText("Programa de Actividades", {
        x: margin,
        y: height - 56,
        size: 8,
        color: MEDIUM_TEXT,
        font: regular,
      });

      const headerY = height - 108;

      p.drawRectangle({
        x: margin,
        y: headerY - 36,
        width: usableWidth,
        height: 36,
        color: HEADER_GREEN,
      });

      p.drawText("Horario", {
        x: margin + 12,
        y: headerY - 20,
        size: 12,
        color: rgb(1, 1, 1),
        font: bold,
      });

      p.drawText("Actividades", {
        x: margin + 180,
        y: headerY - 20,
        size: 12,
        color: rgb(1, 1, 1),
        font: bold,
      });

      p.drawText("Lunes 1 de diciembre de 2025", {
        x: margin + 340,
        y: headerY - 20,
        size: 10,
        color: rgb(245 / 255, 255 / 255, 230 / 255),
        font: bold,
      });

      return { page: p, cursor: headerY - 46 };
    })();

    const margin = 44;
    const { width } = page.getSize();
    const usableWidth = width - margin * 2;
    const headerHeight = 34;
    const rowHeight = 68;
    const horarioWidth = 170;

    // Agrupar por día
    const grouped: Record<string, any[]> = {};
    for (const s of rows) {
      const dayKey = formatDate(s.dia);
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(s);
    }

    for (const day of Object.keys(grouped)) {
      const sessions = grouped[day];

      // ✅ Nueva página si no hay espacio para el encabezado + al menos 1 sesión
      if (cursor - headerHeight - rowHeight < 40) {
        ({ page, cursor } = addNewPage());
      }

      drawDayHeader(page, margin, usableWidth, cursor, day, bold, headerHeight);
      cursor -= headerHeight + 8;

      for (const ses of sessions) {
        // ✅ Nueva página si no cabe la sesión
        if (cursor - rowHeight < 60) {
          ({ page, cursor } = addNewPage());
          // Redibujar encabezado del día en la nueva página
          drawDayHeader(page, margin, usableWidth, cursor, day, bold, headerHeight);
          cursor -= headerHeight + 8;
        }

        // Columna izquierda - horario
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

        // Columna derecha - contenido
        page.drawRectangle({
          x: margin + horarioWidth,
          y: cursor - rowHeight,
          width: usableWidth - horarioWidth,
          height: rowHeight,
          color: ROW_GREEN,
        });

        const contentX = margin + horarioWidth + 14;
        const maxTitleWidth = usableWidth - horarioWidth - 28;

        page.drawText(ses.tipo ?? "", {
          x: contentX,
          y: cursor - 14,
          size: 9,
          color: MEDIUM_TEXT,
          font: regular,
        });

        page.drawText(ses.titulo ?? "", {
          x: contentX,
          y: cursor - 30,
          size: 11,
          color: DARK_TEXT,
          font: bold,
          maxWidth: maxTitleWidth,
        });

        page.drawText(ses.ponente ?? "—", {
          x: contentX,
          y: cursor - 46,
          size: 9,
          color: MEDIUM_TEXT,
          font: regular,
        });

        page.drawText(`Lugar: ${ses.lugar ?? "—"}`, {
          x: contentX,
          y: cursor - 58,
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