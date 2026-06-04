import { NextResponse } from "next/server";
import { PDFDocument, rgb, PageSizes } from "pdf-lib";
import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";

const SECTION_BG = rgb(245 / 255, 245 / 255, 245 / 255);
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

function buildRows(sessions: any[]) {
  return sessions.map((s) => ({
    dia: formatDate(s.dia),
    bloque: `${formatTime(s.hora_inicio)} - ${formatTime(s.hora_fin)}`,
    titulo: s.titulo,
    ponente: s.ponente,
    lugar: s.lugar,
    tipo: s.tipo,
  }));
}

export async function GET() {
  try {
    const [rows] = (await pool.query(
      `SELECT dia, hora_inicio, hora_fin, titulo, ponente, lugar, tipo, cupos_total, cupos_ocupados FROM sesiones ORDER BY dia ASC, hora_inicio ASC`
    )) as any[];
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width } = page.getSize();
    const margin = 48;
    const usableWidth = width - margin * 2;
    let cursor = page.getHeight() - 52;

    const bold = await pdfDoc.embedFont("Helvetica-Bold");
    const regular = await pdfDoc.embedFont("Helvetica");

    // ==== Encabezado con logos ====
    const logoUmbPath = path.join(process.cwd(), "public", "images", "Umb_logo.png");
    const logoSanJosePath = path.join(process.cwd(), "public", "images", "sanjose.png");
    const logoColibriPath = path.join(process.cwd(), "public", "images", "Colibri_umb.png");

    let logoX = margin;
    const headerTop = cursor - 2;
    const headerBottom = cursor - 58;

    const logoSize = 28;
    const logoSpacing = 10;

    let loadedUmb: Uint8Array | null = null;
    let loadedSanJose: Uint8Array | null = null;
    let loadedColibri: Uint8Array | null = null;

    try { loadedUmb = await fs.readFile(logoUmbPath); } catch { /* continue */ }
    try { loadedSanJose = await fs.readFile(logoSanJosePath); } catch { /* continue */ }
    try { loadedColibri = await fs.readFile(logoColibriPath); } catch { /* continue */ }

    const drawLogo = async (imgBytes: Uint8Array | null, fallbackColor: string) => {
      if (!imgBytes) return 0;
      try {
        const img = await pdfDoc.embedPng(imgBytes);
        const imgWidth = Math.min(logoSize, img.width);
        const imgHeight = Math.min(logoSize, img.height);
        const ox = logoX;
        const oy = headerBottom + (58 - imgHeight) / 2;
        page.drawImage(img, { x: ox, y: oy, width: imgWidth, height: imgHeight });
        const advance = imgWidth + logoSpacing;
        logoX += advance;
        return advance;
      } catch {
        return 0;
      }
    };

    const fallbackW = 28;
    const fallbackH = 28;
    const drawFallback = (color: string) => {
      const ox = logoX;
      const oy = headerBottom + (58 - fallbackH) / 2;
      page.drawRectangle({ x: ox, y: oy, width: fallbackW, height: fallbackH, color: rgb(parseInt(color.slice(1, 3), 16) / 255, parseInt(color.slice(3, 5), 16) / 255, parseInt(color.slice(5, 7), 16) / 255) });
      page.drawText("", { x: ox + 4, y: oy + 8, size: 6, color: BLACK, font: regular });
      logoX += fallbackW + logoSpacing;
      return fallbackW + logoSpacing;
    };

    await drawLogo(loadedUmb, "#3F4942");
    await drawLogo(loadedSanJose, "#006341");
    await drawLogo(loadedColibri, "#0F4C3C");

    const rightContentX = logoX + 12;
    page.drawText("12va Jornada Académica y Cultural", { x: rightContentX, y: cursor - 26, size: 18, color: BLACK, font: bold });
    page.drawText("Universidad Mexiquense del Bicentenario", { x: rightContentX, y: cursor - 42, size: 9, color: DARK_GREEN, font: regular });
    page.drawText("Programa de Actividades", { x: rightContentX, y: cursor - 54, size: 8, color: GRAY, font: regular });
    cursor -= 72;

    // ==== Cuerpo por día ====
    const grouped: Record<string, any[]> = {};
    (rows || []).forEach((s) => {
      const key = formatDate(s.dia);
      grouped[key] = grouped[key] || [];
      grouped[key].push(s);
    });

    Object.keys(grouped).forEach((day, dayIdx) => {
      const list = grouped[day];
      const headerHeight = 32;

      if (cursor - headerHeight < 60 && dayIdx > 0) {
        const nextPage = pdfDoc.addPage(PageSizes.A4);
        cursor = nextPage.getHeight() - 52;
      }

      page.drawRectangle({ x: margin, y: cursor - headerHeight, width: usableWidth, height: headerHeight, color: DARK_GREEN });
      page.drawText(day, { x: margin + 12, y: cursor - 22, size: 14, color: LIGHT_GREEN, font: bold });
      cursor -= headerHeight + 8;

      list.forEach((sesion) => {
        const rowHeight = 58;
        if (cursor - rowHeight < 60) {
          const nextPage = pdfDoc.addPage(PageSizes.A4);
          cursor = nextPage.getHeight() - 52;
          page.drawRectangle({ x: margin, y: cursor - headerHeight, width: usableWidth, height: headerHeight, color: DARK_GREEN });
          page.drawText(day, { x: margin + 12, y: cursor - 22, size: 14, color: LIGHT_GREEN, font: bold });
          cursor -= headerHeight + 8;
        }

        page.drawRectangle({ x: margin, y: cursor - rowHeight, width: usableWidth, height: 1, color: GRAY });

        const timeWidth = 140;
        page.drawText(`${formatTime(sesion.hora_inicio)} - ${formatTime(sesion.hora_fin)}`, { x: margin + 6, y: cursor - 18, size: 10, color: DARK_GREEN, font: bold });
        page.drawText(sesion.tipo, { x: margin + 6, y: cursor - 30, size: 9, color: BLACK, font: regular });

        const contentX = margin + timeWidth + 18;
        page.drawText(sesion.titulo, { x: contentX, y: cursor - 18, size: 11, color: BLACK, font: bold, maxWidth: usableWidth - timeWidth - 30 });
        page.drawText(`${sesion.ponente}  |  ${sesion.lugar}`, { x: contentX, y: cursor - 30, size: 9, color: GRAY, font: regular, maxWidth: usableWidth - timeWidth - 30 });

        cursor -= rowHeight;
      });

      cursor -= 14;
    });

    const bytes = await pdfDoc.save();
    return new NextResponse(bytes, {
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
