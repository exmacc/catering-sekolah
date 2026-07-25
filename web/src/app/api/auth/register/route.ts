import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password, full_name, phone, customer_type, child_name, child_class, notes } = await req.json();

    if (!email || !password || !full_name || !customer_type) {
      return NextResponse.json({ success: false, error: 'Email, password, nama, dan tipe customer wajib diisi' }, { status: 400 });
    }

    if (customer_type === 'parent' && (!child_name || !child_class)) {
      return NextResponse.json({ success: false, error: 'Nama anak dan kelas wajib untuk orang tua' }, { status: 400 });
    }

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'customer' },
    });

    if (authError) {
      return NextResponse.json({ success: false, error: authError.message }, { status: 500 });
    }

    const userId = authUser.user.id;
    const passwordHash = await hashPassword(password);

    await supabaseAdmin.from('users').insert({
      id: userId,
      email,
      password_hash: passwordHash,
      full_name,
      phone,
      role: 'customer',
    });

    await supabaseAdmin.from('customers').insert({
      id: userId,
      customer_type,
      child_name: customer_type === 'parent' ? child_name : null,
      child_class: customer_type === 'parent' ? child_class : null,
      notes: customer_type === 'teacher' ? notes : null,
    });

    return NextResponse.json({ success: true, data: { id: userId } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
