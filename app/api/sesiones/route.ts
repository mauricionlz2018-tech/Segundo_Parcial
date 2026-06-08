import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const rows = await query(
      'SELECT * FROM sesiones ORDER BY created_at DESC'
    );
    
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    return NextResponse.json({ error: 'Error al obtener sesiones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = uuidv4();
    
    const fotoPonente = body?.foto_ponente ?? null;
    const perfilProfesional = (body?.perfil_profesional ?? "").trim() || null;
    const afiliacion = (body?.afiliacion ?? "").trim() || null;
    const biografia = (body?.biografia ?? "").trim() || null;
    const logoInstitucion = body?.logo_institucion ?? null;

    await query(
      `INSERT INTO sesiones (
         id, titulo, ponente, dia, hora_inicio, hora_fin,
         tipo, lugar, cupos_total, descripcion,
         foto_ponente, perfil_profesional, afiliacion, biografia, logo_institucion
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.titulo ?? null,
        body.ponente ?? null,
        body.dia ?? null,
        body.hora_inicio ?? null,
        body.hora_fin ?? null,
        body.tipo ?? 'Conferencia',
        body.lugar ?? null,
        body.cupos_total ?? 50,
        body.descripcion ?? null,
        fotoPonente,
        perfilProfesional,
        afiliacion,
        biografia,
        logoInstitucion,
      ]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sesión creada exitosamente',
      id: id 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error al crear sesión:', error);
    return NextResponse.json({ success: false, error: 'Error al crear la sesión' }, { status: 500 });
  }
}