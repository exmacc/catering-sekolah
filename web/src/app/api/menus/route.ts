import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    const customerView = searchParams.get('customer') === 'true';

    let query = supabaseAdmin
      .from('menus')
      .select('*, items:menu_items(*)')
      .order('available_date', { ascending: false });

    if (status) query = query.eq('status', status);
    if (date) query = query.eq('available_date', date);
    if (customerView) {
      query = query.gte('available_date', new Date().toISOString().split('T')[0]);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, description, available_date, order_deadline, items, created_by } = await req.json();

    if (!name || !available_date || !items?.length) {
      return NextResponse.json({ success: false, error: 'Nama, tanggal, dan minimal 1 item wajib diisi' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    let userId = created_by;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { data: menu, error: menuError } = await supabaseAdmin
      .from('menus')
      .insert({
        name,
        description,
        available_date,
        order_deadline: order_deadline || null,
        created_by: userId,
      })
      .select()
      .single();

    if (menuError) throw menuError;

    const menuItems = items.map((item: any) => ({
      menu_id: menu.id,
      name: item.name,
      description: item.description || null,
      price: item.price,
      category: item.category,
    }));

    const { data: createdItems, error: itemsError } = await supabaseAdmin
      .from('menu_items')
      .insert(menuItems)
      .select();

    if (itemsError) throw itemsError;

    return NextResponse.json({ success: true, data: { ...menu, items: createdItems } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
