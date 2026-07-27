import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };

    if (body.name !== undefined) payload.name = String(body.name).trim();
    if (body.class_name !== undefined) payload.class_name = String(body.class_name).trim();
    if (body.class !== undefined) payload.class_name = String(body.class).trim();
    if (body.is_active !== undefined) payload.is_active = !!body.is_active;

    const { data, error } = await supabaseAdmin
      .from('children')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (data?.customer_id) await syncLegacyChildFields(data.customer_id);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: child } = await supabaseAdmin.from('children').select('customer_id').eq('id', id).maybeSingle();

    // soft delete
    const { error } = await supabaseAdmin
      .from('children')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    if (child?.customer_id) await syncLegacyChildFields(child.customer_id);

    return NextResponse.json({ success: true });
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
