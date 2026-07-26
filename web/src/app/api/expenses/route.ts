import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start_date');
    const end = searchParams.get('end_date');
    const period = searchParams.get('payment_period');

    let query = supabaseAdmin
      .from('expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (start) query = query.gte('expense_date', start);
    if (end) query = query.lte('expense_date', end);
    if (period) query = query.eq('payment_period', period);

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
    if (!body.title?.trim() || !body.amount) {
      return NextResponse.json({ success: false, error: 'Judul dan jumlah wajib' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert({
        title: body.title.trim(),
        amount: Number(body.amount),
        category: body.category || null,
        expense_date: body.expense_date || new Date().toISOString().split('T')[0],
        payment_period: body.payment_period || 'daily',
        notes: body.notes || null,
        created_by: body.created_by || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
