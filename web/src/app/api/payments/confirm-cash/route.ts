import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { payment_id, admin_id } = await req.json();

    if (!payment_id || !admin_id) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        confirmed_by: admin_id,
      })
      .eq('id', payment_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
