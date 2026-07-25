import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('invoices')
      .select('*, customer:customers(*, user:users(*)), payments(*)')
      .order('created_at', { ascending: false });

    if (customerId) query = query.eq('customer_id', customerId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
