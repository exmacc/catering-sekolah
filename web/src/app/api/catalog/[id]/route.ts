import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) payload.name = body.name;
    if (body.description !== undefined) payload.description = body.description;
    if (body.price !== undefined) payload.price = Number(body.price);
    if (body.category_id !== undefined) payload.category_id = body.category_id;
    if (body.is_available !== undefined) payload.is_available = body.is_available;
    if (body.image_url !== undefined) {
      if (typeof body.image_url === 'string' && body.image_url.length > 900_000) {
        return NextResponse.json({ success: false, error: 'Gambar terlalu besar (maks ~500KB)' }, { status: 400 });
      }
      payload.image_url = body.image_url === '' ? null : body.image_url;
    }

    const { data, error } = await supabaseAdmin
      .from('catalog_items')
      .update(payload)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin.from('catalog_items').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
