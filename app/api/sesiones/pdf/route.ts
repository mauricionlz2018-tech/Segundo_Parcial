import { NextResponse } from "next/server";
import { PDFDocument, rgb, PageSizes } from "pdf-lib";
import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";

const DARK_GREEN = rgb(6 / 255, 79 / 255, 68 / 255);
const LIGHT_GREEN = rgb(100 / 255, 252 / 255, 5 / 255);
const BLACK = rgb(0.1, 0.1, 0.1);
const GRAY = rgb(0.45, 0.45, 0.45);

function formatDate(dateString: string) {
  try {
    const [y, m, d] = String(dateString).split("T")[0].split("-");
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return `${dayNames[date.getDay()]} ${Number(d)} de ${date.toLocaleString("es-MX", { month: "long" })} de ${y}`;
  } catch {
    return String(dateString);
  }
}

function formatTime(time: string) {
  if (!time || !time.includes(":")) return time ?? "";
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
    // ✅ PostgreSQL: el resultado viene en result.rows
    const result = await pool.query(
      `SELECT dia, hora_inicio, hora_fin, titulo, ponente, lugar, tipo 
       FROM sesiones 
       ORDER BY dia ASC, hora_inicio ASC`
    );

    const rows: any[] = result.rows;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No hay sesiones registradas." }, { status: 404 });
    }

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const margin = 48;
    const usableWidth = width - margin * 2;
    let cursor = height - 52;

    const bold = await pdfDoc.embedFont("Helvetica-Bold");
    const regular = await pdfDoc.embedFont("Helvetica");

    // ── LOGOS ──────────────────────────────────────────────
    const logoUmbPath = path.join(process.cwd(), "public", "images", "Umb_logo.png");
    const logoSanJosePath = path.join(process.cwd(), "public", "images", "sanjose.png");
    const logoColibriPath = path.join(process.cwd(), "public", "images", "Colibri_umb.png");

    let logoX = margin;
    const logoSize = 50;
    const logoSpacing = 10;

    let loadedUmb: Uint8Array | null = null;
    let loadedSanJose: Uint8Array | null = null;
    let loadedColibri: Uint8Array | null = null;

    try { loadedUmb = await fs.readFile(logoUmbPath); } catch { /* sin logo */ }
    try { loadedSanJose = await fs.readFile(logoSanJosePath); } catch { /* sin logo */ }
    try { loadedColibri = await fs.readFile(logoColibriPath); } catch { /* sin logo */ }

    const drawLogo = async (imgBytes: Uint8Array | null) => {
      if (!imgBytes) return;
      try {
        const img = await pdfDoc.embedPng(imgBytes);
        const scale = Math.min(logoSize / img.width, logoSize / img.height);
        const imgWidth = img.width * scale;
        const imgHeight = img.height * scale;
        const yPos = cursor - 48 + (48 - imgHeight) / 2;
        page.drawImage(img, { x: logoX, y: yPos, width: imgWidth, height: imgHeight });
        logoX += imgWidth + logoSpacing;
      } catch { /* imagen inválida, se omite */ }
    };

    await drawLogo(loadedUmb);
    await drawLogo(loadedSanJose);
    await drawLogo(loadedColibri);

    // ── TÍTULO ─────────────────────────────────────────────
    const titleX = logoX + 12;
    page.drawText("12va Jornada Académica y Cultural", {
      x: titleX,
      y: cursor - 26,
      size: 18,
      color: BLACK,
      font: bold,
    });
    page.drawText("Universidad Mexiquense del Bicentenario", {
      x: titleX,
      y: cursor - 42,
      size: 9,
      color: DARK_GREEN,
      font: regular,
    });
    page.drawText("Programa de Actividades", {
      x: titleX,
      y: cursor - 54,
      size: 8,
      color: GRAY,
      font: regular,
    });

    cursor -= 72;

    // ── AGRUPAR POR DÍA ────────────────────────────────────
    const grouped: Record<string, any[]> = {};
    for (const s of rows) {
      const dayKey = formatDate(s.dia);
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(s);
    }

    const headerHeight = 32;
    const rowHeight = 58;

    for (const day of Object.keys(grouped)) {
      const sessions = grouped[day];

      // Nueva página si no cabe el encabezado del día
      if (cursor - headerHeight < 60) {
        page = pdfDoc.addPage(PageSizes.A4);
        cursor = height - 52;
      }

      // Encabezado del día
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
        // Nueva página si no cabe la sesión
        if (cursor - rowHeight < 60) {
          page = pdfDoc.addPage(PageSizes.A4);
          cursor = height - 52;
          // Repetir encabezado del día
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

        // Línea separadora
        page.drawLine({
          start: { x: margin, y: cursor - rowHeight },
          end: { x: margin + usableWidth, y: cursor - rowHeight },
          thickness: 0.5,
          color: GRAY,
        });

        const timeWidth = 140;
        const timeStr = `${formatTime(ses.hora_inicio)} - ${formatTime(ses.hora_fin)}`;

        // Columna izquierda — hora y tipo
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

        // Columna derecha — título, ponente y lugar
        const contentX = margin + timeWidth + 18;
        const maxTitleWidth = usableWidth - timeWidth - 30;

        page.drawText(ses.titulo ?? "Sin título", {
          x: contentX,
          y: cursor - 18,
          size: 11,
          color: BLACK,
          font: bold,
          maxWidth: maxTitleWidth,
        });
        page.drawText(`${ses.ponente ?? "—"}  |  ${ses.lugar ?? "—"}`, {
          x: contentX,
          y: cursor - 32,
          size: 9,
          color: GRAY,
          font: regular,
          maxWidth: maxTitleWidth,
        });

        cursor -= rowHeight;
      }

      cursor -= 14; // espacio entre días
    }

    // ── GENERAR Y DEVOLVER PDF ─────────────────────────────
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