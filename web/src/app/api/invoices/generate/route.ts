import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateInvoiceNumber } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { customer_id, period_start, period_end } = await req.json();

    if (!customer_id || !period_start || !period_end) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
    }

    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('customer_id', customer_id)
      .gte('delivery_date', period_start)
      .lte('delivery_date', period_end)
      .neq('status', 'cancelled');

    if (!orders?.length) {
      return NextResponse.json({ success: false, error: 'Tidak ada pesanan di periode ini' }, { status: 404 });
    }

    const totalAmount = orders.reduce((sum, o) => sum + o.total_amount, 0);

    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .insert({
        customer_id,
        invoice_number: generateInvoiceNumber(),
        period_start,
        period_end,
        total_amount: totalAmount,
        due_date: new Date(new Date(period_end).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
