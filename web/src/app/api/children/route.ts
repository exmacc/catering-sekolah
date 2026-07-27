import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customer_id');

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'customer_id wajib' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('children')
      .select('*')
      .eq('customer_id', customerId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customer_id = body.customer_id;
    const name = String(body.name || '').trim();
    const class_name = String(body.class_name || body.class || '').trim();

    if (!customer_id || !name || !class_name) {
      return NextResponse.json({ success: false, error: 'customer_id, nama, dan kelas wajib' }, { status: 400 });
    }

    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('id, customer_type')
      .eq('id', customer_id)
      .maybeSingle();

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer tidak ditemukan' }, { status: 404 });
    }
    if (customer.customer_type !== 'parent') {
      return NextResponse.json({ success: false, error: 'Hanya orang tua yang bisa menambah anak' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('children')
      .insert({ customer_id, name, class_name, is_active: true })
      .select()
      .single();

    if (error) throw error;

    // keep legacy fields in sync with first active child (for admin list)
    await syncLegacyChildFields(customer_id);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function syncLegacyChildFields(customerId: string) {
  const { data: kids } = await supabaseAdmin
    .from('children')
    .select('name, class_name')
    .eq('customer_id', customerId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1);

  const first = kids?.[0];
  await supabaseAdmin
    .from('customers')
    .update({
      child_name: first?.name || null,
      child_class: first?.class_name || null,
    })
    .eq('id', customerId);
}
