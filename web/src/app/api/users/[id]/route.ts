import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const payload: Record<string, any> = { updated_at: new Date().toISOString() };

    if (body.full_name !== undefined) payload.full_name = body.full_name;
    if (body.phone !== undefined) payload.phone = body.phone;
    if (body.is_active !== undefined) payload.is_active = body.is_active;
    if (body.role !== undefined && ['admin', 'customer'].includes(body.role)) {
      payload.role = body.role;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(payload)
      .eq('id', id)
      .select('*, customer:customers(*)')
      .single();

    if (error) throw error;

    // sync role to auth metadata
    if (body.role || body.full_name) {
      await supabaseAdmin.auth.admin.updateUserById(id, {
        user_metadata: {
          full_name: data.full_name,
          role: data.role,
        },
        app_metadata: { role: data.role },
      });
    }

    if (body.is_active === false) {
      await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '876000h' });
    }
    if (body.is_active === true) {
      await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: 'none' });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // soft delete preferred: deactivate
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    try {
      await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '876000h' });
    } catch {
      // ignore auth ban failure
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
