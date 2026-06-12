import { NextResponse } from "next/server";
import { PDFDocument, rgb, PageSizes, StandardFonts } from "pdf-lib";
import { query } from "@/lib/db";

const DARK_GREEN = rgb(6 / 255, 79 / 255, 68 / 255);
const LIGHT_GREEN = rgb(100 / 255, 252 / 255, 5 / 255);
const BLACK = rgb(0.1, 0.1, 0.1);
const GRAY = rgb(0.45, 0.45, 0.45);

function formatDate(dateString: string) {
  try {
    const d = new Date(dateString);
    return `${d.getDate()} ${d.toLocaleString("es-MX", { month: "long" })} ${d.getFullYear()}`;
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
    // ✅ Usa la función query() de db.ts que maneja pg correctamente
    const rows = await query<any[]>(
      `SELECT dia, hora_inicio, hora_fin, titulo, ponente, lugar, tipo 
       FROM sesiones 
       ORDER BY dia ASC, hora_inicio ASC`
    );

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const margin = 48;
    const usableWidth = width - margin * 2;
    let cursor = height - 52;

    // ✅ StandardFonts en lugar de strings
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Encabezado
    page.drawText("12va Jornada Académica y Cultural", {
      x: margin,
      y: cursor - 20,
      size: 18,
      color: BLACK,
      font: bold,
    });
    page.drawText("Universidad Mexiquense del Bicentenario", {
      x: margin,
      y: cursor - 36,
      size: 9,
      color: DARK_GREEN,
      font: regular,
    });
    page.drawText("Programa de Actividades", {
      x: margin,
      y: cursor - 48,
      size: 8,
      color: GRAY,
      font: regular,
    });

    cursor -= 72;

    // Agrupar por día
    const grouped: Record<string, any[]> = {};
    for (const s of rows) {
      const dayKey = formatDate(s.dia);
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(s);
    }

    const dayKeys = Object.keys(grouped);
    for (let idx = 0; idx < dayKeys.length; idx++) {
      const day = dayKeys[idx];
      const sessions = grouped[day];
      const headerHeight = 32;

      if (cursor - headerHeight < 60) {
        page = pdfDoc.addPage(PageSizes.A4);
        cursor = height - 52;
      }

      page.drawRectangle({
        x: margin,
        y: cursor - headerHeight,
        width: usableWidth,
        height: headerHeight,
        color: DARK_GREEN,
      });
      page.drawText(day, {
        x: margin + 12,
        y: cursor - 22,
        size: 14,
        color: LIGHT_GREEN,
        font: bold,
      });
      cursor -= headerHeight + 8;

      for (const ses of sessions) {
        const rowHeight = 58;
        if (cursor - rowHeight < 60) {
          page = pdfDoc.addPage(PageSizes.A4);
          cursor = height - 52;
          page.drawRectangle({
            x: margin,
            y: cursor - headerHeight,
            width: usableWidth,
            height: headerHeight,
            color: DARK_GREEN,
          });
          page.drawText(day, {
            x: margin + 12,
            y: cursor - 22,
            size: 14,
            color: LIGHT_GREEN,
            font: bold,
          });
          cursor -= headerHeight + 8;
        }

        page.drawLine({
          start: { x: margin, y: cursor - rowHeight },
          end: { x: margin + usableWidth, y: cursor - rowHeight },
          thickness: 0.5,
          color: GRAY,
        });

        const timeWidth = 140;
        const timeStr = `${formatTime(ses.hora_inicio)} - ${formatTime(ses.hora_fin)}`;
        page.drawText(timeStr, {
          x: margin + 6,
          y: cursor - 18,
          size: 10,
          color: DARK_GREEN,
          font: bold,
        });
        page.drawText(ses.tipo ?? "", {
          x: margin + 6,
          y: cursor - 30,
          size: 9,
          color: BLACK,
          font: regular,
        });

        const contentX = margin + timeWidth + 18;
        const maxTitleWidth = usableWidth - timeWidth - 30;

        page.drawText(ses.titulo ?? "", {
          x: contentX,
          y: cursor - 18,
          size: 11,
          color: BLACK,
          font: bold,
          maxWidth: maxTitleWidth,
        });
        page.drawText(`${ses.ponente ?? ""}  |  ${ses.lugar ?? ""}`, {
          x: contentX,
          y: cursor - 32,
          size: 9,
          color: GRAY,
          font: regular,
          maxWidth: maxTitleWidth,
        });

        cursor -= rowHeight;
      }

      cursor -= 14;
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