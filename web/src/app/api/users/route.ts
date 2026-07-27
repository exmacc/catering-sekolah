import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { hashPassword } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    let query = supabaseAdmin
      .from('users')
      .select('*, customer:customers(*)')
      .order('created_at', { ascending: false });

    if (role) query = query.eq('role', role);

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
    const {
      email,
      password,
      full_name,
      phone,
      role = 'customer',
      customer_type,
      child_name,
      child_class,
      notes,
    } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json({ success: false, error: 'Email, password, dan nama wajib diisi' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const userRole = role === 'admin' ? 'admin' : 'customer';

    if (userRole === 'customer') {
      if (!customer_type || !['parent', 'teacher'].includes(customer_type)) {
        return NextResponse.json({ success: false, error: 'Tipe customer wajib (parent/teacher)' }, { status: 400 });
      }
      if (customer_type === 'parent' && (!child_name || !child_class)) {
        return NextResponse.json({ success: false, error: 'Nama anak dan kelas wajib untuk orang tua' }, { status: 400 });
      }
    }

    const emailNorm = String(email).trim().toLowerCase();

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', emailNorm)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailNorm,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: userRole },
      app_metadata: { role: userRole },
    });

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 });
    }

    const userId = authUser.user.id;
    const passwordHash = await hashPassword(password);

    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: userId,
      email: emailNorm,
      password_hash: passwordHash,
      full_name: String(full_name).trim(),
      phone: phone || null,
      role: userRole,
      is_active: true,
    });

    if (userError) {
      // rollback auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, error: userError.message }, { status: 500 });
    }

    if (userRole === 'customer') {
      const { error: custError } = await supabaseAdmin.from('customers').insert({
        id: userId,
        customer_type,
        child_name: customer_type === 'parent' ? child_name : null,
        child_class: customer_type === 'parent' ? child_class : null,
        notes: customer_type === 'teacher' ? notes || null : null,
      });
      if (custError) {
        await supabaseAdmin.from('users').delete().eq('id', userId);
        await supabaseAdmin.auth.admin.deleteUser(userId);
        return NextResponse.json({ success: false, error: custError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: userId, email: emailNorm, role: userRole, full_name },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
