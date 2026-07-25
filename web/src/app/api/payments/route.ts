import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');
    const method = searchParams.get('method');

    let query = supabaseAdmin
      .from('payments')
      .select('*, customer:customers(*, user:users(*))')
      .order('created_at', { ascending: false });

    if (customerId) query = query.eq('customer_id', customerId);
    if (status) query = query.eq('status', status);
    if (method) query = query.eq('payment_method', method);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { customer_id, invoice_id, order_id, amount, payment_method, payment_period, notes } = await req.json();

    if (!customer_id || !amount || !payment_method || !payment_period) {
      return NextResponse.json({ success: false, error: 'Data pembayaran tidak lengkap' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert({
        customer_id,
        invoice_id,
        order_id,
        amount,
        payment_method,
        payment_period,
        status: payment_method === 'cash' ? 'paid' : 'pending',
        paid_at: payment_method === 'cash' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
