import { NextResponse } from "next/server";
import { PDFDocument, rgb, PageSizes, StandardFonts } from "pdf-lib";
import pool from "@/lib/db";
import fs from "fs/promises";
import path from "path";

const DARK_GREEN  = rgb(6 / 255, 79 / 255, 68 / 255);
const LIGHT_GREEN = rgb(198 / 255, 239 / 255, 206 / 255);
const LIME_TEXT   = rgb(100 / 255, 252 / 255, 5 / 255);
const WHITE       = rgb(1, 1, 1);
const BLACK       = rgb(0.1, 0.1, 0.1);
const GRAY        = rgb(0.45, 0.45, 0.45);

function formatDate(value: any): string {
  try {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return String(value);
    const day     = date.getUTCDate();
    const month   = date.toLocaleString("es-MX", { month: "long", timeZone: "UTC" });
    const year    = date.getUTCFullYear();
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const dayName  = dayNames[date.getUTCDay()];
    return `${dayName} ${day} de ${month} de ${year}`;
  } catch {
    return String(value);
  }
}

function formatTimeRange(inicio: string, fin: string): string {
  const fmt = (t: string) => {
    if (!t) return "";
    const parts = String(t).split(":");
    const h = parts[0]?.padStart(2, "0") ?? "00";
    const m = parts[1]?.padStart(2, "0") ?? "00";
    return `${h}:${m}`;
  };
  return `${fmt(inicio)} a ${fmt(fin)} hrs`;
}

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT dia, hora_inicio, hora_fin, titulo, ponente, lugar, tipo
       FROM sesiones
       ORDER BY dia ASC, hora_inicio ASC`
    );

    const rows: any[] = result.rows;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "No hay sesiones registradas." }, { status: 404 });
    }

    const pdfDoc  = await PDFDocument.create();
    const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const margin      = 48;
    const usableWidth = width - margin * 2;
    let cursor        = height - 20;

    // ── LOGOS ───────────────────────────────────────────────
    const logoPaths = [
      path.join(process.cwd(), "public", "images", "Umb_logo.png"),
      path.join(process.cwd(), "public", "images", "sanjose.png"),
      path.join(process.cwd(), "public", "images", "Colibri_umb.png"),
    ];

    const logoHeight  = 52;
    const headerHeight = logoHeight + 16;
    const logoY        = cursor - headerHeight + 8;

    const validLogos: { img: any; w: number; h: number }[] = [];
    for (const p of logoPaths) {
      try {
        const bytes = await fs.readFile(p);
        const img   = await pdfDoc.embedPng(bytes).catch(() => pdfDoc.embedJpg(bytes));
        const scale = Math.min(logoHeight / img.height, 80 / img.width);
        validLogos.push({ img, w: img.width * scale, h: img.height * scale });
      } catch { /* logo no disponible, se omite */ }
    }

    if (validLogos.length > 0) {
      const totalLogoW = validLogos.reduce((s, l) => s + l.w, 0);
      const gap        = validLogos.length > 1
        ? (usableWidth - totalLogoW) / (validLogos.length - 1)
        : 0;
      let lx = margin;
      for (const { img, w, h } of validLogos) {
        page.drawImage(img, {
          x: lx,
          y: logoY + (logoHeight - h) / 2,
          width: w,
          height: h,
        });
        lx += w + gap;
      }
    }

    cursor -= headerHeight + 4;

    // ── TÍTULO ──────────────────────────────────────────────
    const title1  = "12va Jornada Académica y Cultural 2025";
    const title1W = bold.widthOfTextAtSize(title1, 20);
    page.drawText(title1, {
      x: margin + (usableWidth - title1W) / 2,
      y: cursor - 22,
      size: 20,
      color: BLACK,
      font: bold,
    });

    const sub1  = "UNIDAD DE ESTUDIOS SUPERIORES SAN JOSÉ DEL RINCÓN";
    const sub1W = regular.widthOfTextAtSize(sub1, 8);
    page.drawText(sub1, {
      x: margin + (usableWidth - sub1W) / 2,
      y: cursor - 36,
      size: 8,
      color: GRAY,
      font: regular,
    });

    const sub2  = "PROGRAMA DE ACTIVIDADES";
    const sub2W = bold.widthOfTextAtSize(sub2, 9);
    page.drawText(sub2, {
      x: margin + (usableWidth - sub2W) / 2,
      y: cursor - 50,
      size: 9,
      color: BLACK,
      font: bold,
    });

    cursor -= 68;

    // ── CONSTANTES DE TABLA ─────────────────────────────────
    const colTimeW  = 150;
    const dayHeaderH = 30;
    const rowH       = 70;

    // ── AGRUPAR POR DÍA ─────────────────────────────────────
    const grouped: Record<string, any[]> = {};
    for (const s of rows) {
      const key = formatDate(s.dia);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    }

    for (const day of Object.keys(grouped)) {
      const sessions = grouped[day];

      if (cursor - dayHeaderH - rowH < 40) {
        page   = pdfDoc.addPage(PageSizes.A4);
        cursor = height - 40;
      }

      // ── Encabezado del día ──────────────────────────────
      page.drawRectangle({
        x: margin,
        y: cursor - dayHeaderH,
        width: usableWidth,
        height: dayHeaderH,
        color: DARK_GREEN,
      });
      page.drawText("Horario", {
        x: margin + 10,
        y: cursor - 20,
        size: 10,
        color: WHITE,
        font: bold,
      });
      const dayTextW = bold.widthOfTextAtSize(day, 12);
      page.drawText(day, {
        x: margin + usableWidth - dayTextW - 12,
        y: cursor - 20,
        size: 12,
        color: LIME_TEXT,
        font: bold,
      });
      cursor -= dayHeaderH + 4;

      // ── Sesiones ────────────────────────────────────────
      for (const ses of sessions) {
        if (cursor - rowH < 40) {
          page   = pdfDoc.addPage(PageSizes.A4);
          cursor = height - 40;
          // Repetir encabezado del día en nueva página
          page.drawRectangle({
            x: margin,
            y: cursor - dayHeaderH,
            width: usableWidth,
            height: dayHeaderH,
            color: DARK_GREEN,
          });
          page.drawText("Horario", {
            x: margin + 10,
            y: cursor - 20,
            size: 10,
            color: WHITE,
            font: bold,
          });
          const dw = bold.widthOfTextAtSize(day, 12);
          page.drawText(day, {
            x: margin + usableWidth - dw - 12,
            y: cursor - 20,
            size: 12,
            color: LIME_TEXT,
            font: bold,
          });
          cursor -= dayHeaderH + 4;
        }

        // Celda izquierda — hora (verde oscuro)
        page.drawRectangle({
          x: margin,
          y: cursor - rowH,
          width: colTimeW,
          height: rowH,
          color: DARK_GREEN,
        });
        page.drawText(formatTimeRange(ses.hora_inicio, ses.hora_fin), {
          x: margin + 8,
          y: cursor - rowH / 2 + 4,
          size: 9,
          color: WHITE,
          font: bold,
          maxWidth: colTimeW - 12,
        });

        // Celda derecha — contenido (verde claro)
        page.drawRectangle({
          x: margin + colTimeW,
          y: cursor - rowH,
          width: usableWidth - colTimeW,
          height: rowH,
          color: LIGHT_GREEN,
        });

        const cx     = margin + colTimeW + 14;
        const maxW   = usableWidth - colTimeW - 24;
        const titulo  = ses.titulo  ?? "Sin título";
        const ponente = ses.ponente ?? "—";
        const lugar   = ses.lugar   ?? "—";

        // Título centrado en negrita
        const tW = bold.widthOfTextAtSize(titulo, 11);
        page.drawText(titulo, {
          x: tW < maxW ? cx + (maxW - tW) / 2 : cx,
          y: cursor - 20,
          size: 11,
          color: BLACK,
          font: bold,
          maxWidth: maxW,
        });

        // Ponente centrado
        const pW = regular.widthOfTextAtSize(ponente, 9);
        page.drawText(ponente, {
          x: pW < maxW ? cx + (maxW - pW) / 2 : cx,
          y: cursor - 34,
          size: 9,
          color: GRAY,
          font: regular,
          maxWidth: maxW,
        });

        // Lugar centrado en negrita
        const lW = bold.widthOfTextAtSize(lugar, 9);
        page.drawText(lugar, {
          x: lW < maxW ? cx + (maxW - lW) / 2 : cx,
          y: cursor - 48,
          size: 9,
          color: BLACK,
          font: bold,
          maxWidth: maxW,
        });

        cursor -= rowH;
      }

      cursor -= 10;
    }

    // ── GENERAR PDF ─────────────────────────────────────────
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