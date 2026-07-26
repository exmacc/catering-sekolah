import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start_date');
    const end = searchParams.get('end_date');

    let payQuery = supabaseAdmin
      .from('payments')
      .select('amount, payment_method, payment_period, status, paid_at, created_at')
      .eq('status', 'paid');

    let expQuery = supabaseAdmin.from('expenses').select('amount, payment_period, expense_date');

    if (start) {
      payQuery = payQuery.gte('paid_at', start);
      expQuery = expQuery.gte('expense_date', start);
    }
    if (end) {
      payQuery = payQuery.lte('paid_at', `${end}T23:59:59`);
      expQuery = expQuery.lte('expense_date', end);
    }

    const [{ data: payments }, { data: expenses }] = await Promise.all([payQuery, expQuery]);

    const income = (payments || []).reduce((s, p) => s + (p.amount || 0), 0);
    const outcome = (expenses || []).reduce((s, e) => s + (e.amount || 0), 0);

    const byPeriod: Record<'daily' | 'weekly' | 'monthly', { income: number; outcome: number }> = {
      daily: { income: 0, outcome: 0 },
      weekly: { income: 0, outcome: 0 },
      monthly: { income: 0, outcome: 0 },
    };

    for (const p of payments || []) {
      const key = (p.payment_period as 'daily' | 'weekly' | 'monthly') || 'daily';
      if (byPeriod[key]) byPeriod[key].income += p.amount || 0;
    }
    for (const e of expenses || []) {
      const key = (e.payment_period as 'daily' | 'weekly' | 'monthly') || 'daily';
      if (byPeriod[key]) byPeriod[key].outcome += e.amount || 0;
    }

    const cashIncome = (payments || []).filter((p) => p.payment_method === 'cash').reduce((s, p) => s + p.amount, 0);
    const transferIncome = (payments || []).filter((p) => p.payment_method === 'transfer').reduce((s, p) => s + p.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        income,
        outcome,
        balance: income - outcome,
        cash_income: cashIncome,
        transfer_income: transferIncome,
        by_period: byPeriod,
        payments_count: payments?.length || 0,
        expenses_count: expenses?.length || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
