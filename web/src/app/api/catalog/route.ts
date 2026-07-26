import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('category_id');

    let query = supabaseAdmin
      .from('catalog_items')
      .select('*, category:categories(*)')
      .order('name', { ascending: true });

    if (categoryId) query = query.eq('category_id', categoryId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name?.trim() || body.price === undefined) {
      return NextResponse.json({ success: false, error: 'Nama dan harga wajib' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('catalog_items')
      .insert({
        name: body.name.trim(),
        description: body.description || null,
        price: Number(body.price) || 0,
        category_id: body.category_id || null,
        is_available: body.is_available ?? true,
      })
      .select('*, category:categories(*)')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
