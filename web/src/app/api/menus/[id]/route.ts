import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('menus')
      .select('*, items:menu_items(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ success: false, error: 'Menu tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatePayload: Record<string, any> = {};
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.available_date !== undefined) updatePayload.available_date = body.available_date;
    if (body.order_deadline !== undefined) updatePayload.order_deadline = body.order_deadline;
    if (body.status !== undefined) updatePayload.status = body.status;

    if (Object.keys(updatePayload).length > 0) {
      const { error } = await supabaseAdmin
        .from('menus')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;
    }

    if (body.items) {
      await supabaseAdmin.from('menu_items').delete().eq('menu_id', id);
      const menuItems = body.items.map((item: any) => ({
        menu_id: id,
        name: item.name,
        description: item.description || null,
        price: item.price,
        category: item.category,
      }));
      await supabaseAdmin.from('menu_items').insert(menuItems);
    }

    const { data: fullMenu } = await supabaseAdmin
      .from('menus')
      .select('*, items:menu_items(*)')
      .eq('id', id)
      .single();

    return NextResponse.json({ success: true, data: fullMenu });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('menus')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
