import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const type = searchParams.get('type') || 'daily';

    if (type === 'daily') {
      let query = supabaseAdmin
        .from('orders')
        .select('delivery_date, total_amount, payment_method, status')
        .neq('status', 'cancelled');

      if (startDate) query = query.gte('delivery_date', startDate);
      if (endDate) query = query.lte('delivery_date', endDate);

      const { data: orders } = await query;

      const dailyMap = new Map<string, { total_orders: number; total_revenue: number; cash_revenue: number; transfer_revenue: number; total_items: number }>();

      for (const order of orders || []) {
        const date = order.delivery_date;
        const current = dailyMap.get(date) || { total_orders: 0, total_revenue: 0, cash_revenue: 0, transfer_revenue: 0, total_items: 0 };
        current.total_orders += 1;
        current.total_revenue += order.total_amount;
        if (order.payment_method === 'cash') current.cash_revenue += order.total_amount;
        else current.transfer_revenue += order.total_amount;
        dailyMap.set(date, current);
      }

      const { data: orderItems } = await supabaseAdmin
        .from('order_items')
        .select('order_id, quantity, order:orders!inner(delivery_date, status)')
        .neq('order.status', 'cancelled');

      if (startDate && orderItems) {
        const filteredItems = (orderItems as any[]).filter((oi: any) =>
          oi.order?.delivery_date >= startDate && oi.order?.delivery_date <= (endDate || startDate)
        );
        for (const item of filteredItems) {
          const entry = dailyMap.get(item.order?.delivery_date);
          if (entry) entry.total_items += item.quantity;
        }
      }

      const report = Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => ({ date, ...data }));

      return NextResponse.json({ success: true, data: report });
    }

    if (type === 'summary') {
      const { data: totalRevenue } = await supabaseAdmin
        .from('payments')
        .select('amount')
        .eq('status', 'paid');

      const { data: totalOrders } = await supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact' })
        .neq('status', 'cancelled');

      const { data: totalCustomers } = await supabaseAdmin
        .from('customers')
        .select('id', { count: 'exact' });

      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrders } = await supabaseAdmin
        .from('orders')
        .select('total_amount')
        .eq('delivery_date', today)
        .neq('status', 'cancelled');

      const totalPaid = (totalRevenue || []).reduce((sum: number, p: any) => sum + p.amount, 0);
      const todayRevenue = (todayOrders || []).reduce((sum: number, o: any) => sum + o.total_amount, 0);

      return NextResponse.json({
        success: true,
        data: {
          total_revenue: totalPaid,
          total_orders: totalOrders?.length || 0,
          total_customers: totalCustomers?.length || 0,
          today_revenue: todayRevenue,
          today_orders: todayOrders?.length || 0,
        },
      });
    }

    // period report
    let payQuery = supabaseAdmin
      .from('payments')
      .select('*, customer:customers(*, user:users(*))')
      .eq('status', 'paid')
      .order('paid_at', { ascending: false });

    if (startDate) payQuery = payQuery.gte('paid_at', startDate);
    if (endDate) payQuery = payQuery.lte('paid_at', endDate);

    const { data: payments } = await payQuery;

    return NextResponse.json({ success: true, data: payments || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
