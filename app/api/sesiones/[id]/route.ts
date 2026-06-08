import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ⚠️ OBLIGATORIO en Next.js 15+
    const { id } = await params;
    
    const body = await request.json();
    
    console.log('Actualizando sesión:', id, body);
    
    // Validar que la sesión existe
    const existing = await query<{ id: string }[]>(
      'SELECT id FROM sesiones WHERE id = ?',
      [id]
    );
    
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }
    
    // Actualizar - solo los campos que existen en tu BD
    await query(
      `UPDATE sesiones 
       SET titulo = ?,
           ponente = ?,
           dia = ?,
           hora_inicio = ?,
           hora_fin = ?,
           tipo = ?,
           lugar = ?,
           cupos_total = ?,
           descripcion = ?,
           foto_ponente = ?,
           perfil_profesional = ?,
           afiliacion = ?,
           biografia = ?,
           logo_institucion = ?
       WHERE id = ?`,
      [
        body.titulo ?? null,
        body.ponente ?? null,
        body.dia ?? null,
        body.hora_inicio ?? null,
        body.hora_fin ?? null,
        body.tipo ?? 'Conferencia',
        body.lugar ?? null,
        body.cupos_total ?? 50,
        body.descripcion ?? null,
        body.foto_ponente ?? null,
        (body.perfil_profesional ?? "").trim() || null,
        (body.afiliacion ?? "").trim() || null,
        (body.biografia ?? "").trim() || null,
        body.logo_institucion ?? null,
        id
      ]
    );
    
    return NextResponse.json({ success: true, message: 'Sesión actualizada exitosamente' });
    
  } catch (error) {
    console.error('Error al actualizar:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al actualizar la sesión' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('Eliminando sesión:', id);
    
    const existing = await query<{ id: string }[]>(
      'SELECT id FROM sesiones WHERE id = ?',
      [id]
    );
    
    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
    }
    
    await query('DELETE FROM sesiones WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true, message: 'Sesión eliminada exitosamente' });
    
  } catch (error) {
    console.error('Error al eliminar:', error);
    return NextResponse.json({ success: false, error: 'Error al eliminar la sesión' }, { status: 500 });
  }
}