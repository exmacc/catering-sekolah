import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateInvoiceNumber } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_id,
      period_start,
      period_end,
      payment_period,
      generate_all,
    } = body;

    if (!period_start || !period_end) {
      return NextResponse.json({ success: false, error: 'Periode wajib diisi' }, { status: 400 });
    }

    // Single customer
    if (!generate_all) {
      if (!customer_id) {
        return NextResponse.json({ success: false, error: 'customer_id wajib' }, { status: 400 });
      }
      const invoice = await createInvoiceForCustomer(customer_id, period_start, period_end, payment_period);
      if (!invoice.success) {
        return NextResponse.json(invoice, { status: invoice.error?.includes('Tidak ada') ? 404 : 500 });
      }
      return NextResponse.json(invoice);
    }

    // Batch: all customers with unpaid orders in period
    let orderQuery = supabaseAdmin
      .from('orders')
      .select('customer_id, total_amount, payment_period, status')
      .gte('delivery_date', period_start)
      .lte('delivery_date', period_end)
      .neq('status', 'cancelled');

    if (payment_period) orderQuery = orderQuery.eq('payment_period', payment_period);

    const { data: orders, error } = await orderQuery;
    if (error) throw error;
    if (!orders?.length) {
      return NextResponse.json({ success: false, error: 'Tidak ada pesanan di periode ini' }, { status: 404 });
    }

    const byCustomer = new Map<string, number>();
    for (const o of orders) {
      byCustomer.set(o.customer_id, (byCustomer.get(o.customer_id) || 0) + (o.total_amount || 0));
    }

    const created: any[] = [];
    const skipped: string[] = [];

    for (const [cid] of byCustomer) {
      const result = await createInvoiceForCustomer(cid, period_start, period_end, payment_period);
      if (result.success) created.push(result.data);
      else skipped.push(cid);
    }

    return NextResponse.json({
      success: true,
      data: { created_count: created.length, skipped_count: skipped.length, invoices: created },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function createInvoiceForCustomer(
  customer_id: string,
  period_start: string,
  period_end: string,
  payment_period?: string
) {
  let query = supabaseAdmin
    .from('orders')
    .select('*')
    .eq('customer_id', customer_id)
    .gte('delivery_date', period_start)
    .lte('delivery_date', period_end)
    .neq('status', 'cancelled');

  if (payment_period) query = query.eq('payment_period', payment_period);

  const { data: orders, error } = await query;
  if (error) return { success: false, error: error.message };
  if (!orders?.length) return { success: false, error: 'Tidak ada pesanan di periode ini' };

  const totalAmount = orders.reduce((sum, o) => sum + o.total_amount, 0);

  const { data: invoice, error: invError } = await supabaseAdmin
    .from('invoices')
    .insert({
      customer_id,
      invoice_number: generateInvoiceNumber(),
      period_start,
      period_end,
      total_amount: totalAmount,
      payment_period: payment_period || null,
      due_date: new Date(new Date(period_end).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'unpaid',
    })
    .select('*, customer:customers(*, user:users(*))')
    .single();

  if (invError) return { success: false, error: invError.message };
  return { success: true, data: invoice };
}
