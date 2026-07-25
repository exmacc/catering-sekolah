import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');
    const menuId = searchParams.get('menu_id');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*, menu_item:menu_items(*)), customer:customers(*, user:users(*))')
      .order('created_at', { ascending: false });

    if (customerId) query = query.eq('customer_id', customerId);
    if (menuId) query = query.eq('menu_id', menuId);
    if (date) query = query.eq('delivery_date', date);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customer_id, menu_id, delivery_date, payment_method, payment_period, notes, items } = await req.json();

    if (!customer_id || !menu_id || !delivery_date || !payment_method || !payment_period || !items?.length) {
      return NextResponse.json({ success: false, error: 'Data pesanan tidak lengkap' }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const { data: menuItem } = await supabaseAdmin
        .from('menu_items')
        .select('price')
        .eq('id', item.menu_item_id)
        .single();

      if (!menuItem) continue;

      const subtotal = menuItem.price * item.quantity;
      totalAmount += subtotal;
      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menuItem.price,
        subtotal,
      });
    }

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id,
        menu_id,
        delivery_date,
        payment_method,
        payment_period,
        notes,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const itemsWithOrderId = orderItems.map((item) => ({ ...item, order_id: order.id }));
    const { data: createdItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId)
      .select();

    if (itemsError) throw itemsError;

    if (payment_method === 'cash' && payment_period === 'daily') {
      await supabaseAdmin.from('payments').insert({
        customer_id,
        order_id: order.id,
        amount: totalAmount,
        payment_method: 'cash',
        payment_period: 'daily',
        status: 'pending',
      });
    }

    return NextResponse.json({ success: true, data: { ...order, items: createdItems } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
