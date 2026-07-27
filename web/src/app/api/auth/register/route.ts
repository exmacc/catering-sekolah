import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { hashPassword } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name, phone, customer_type, child_name, child_class, notes } = body;

    if (!email || !password || !full_name || !customer_type) {
      return NextResponse.json(
        { success: false, error: 'Email, password, nama, dan tipe customer wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    const emailNorm = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ success: false, error: 'Format email tidak valid' }, { status: 400 });
    }

    if (!['parent', 'teacher'].includes(customer_type)) {
      return NextResponse.json({ success: false, error: 'Tipe customer tidak valid' }, { status: 400 });
    }

    if (customer_type === 'parent' && (!child_name?.trim() || !child_class?.trim())) {
      return NextResponse.json(
        { success: false, error: 'Nama anak dan kelas wajib untuk orang tua' },
        { status: 400 }
      );
    }

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', emailNorm)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailNorm,
      password,
      email_confirm: true,
      user_metadata: { full_name: String(full_name).trim(), role: 'customer' },
      app_metadata: { role: 'customer' },
    });

    if (authError) {
      const msg = authError.message || 'Gagal membuat akun';
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
        return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 });
      }
      return NextResponse.json({ success: false, error: msg }, { status: 500 });
    }

    const userId = authUser.user.id;
    const passwordHash = await hashPassword(password);

    const { error: userError } = await supabaseAdmin.from('users').insert({
      id: userId,
      email: emailNorm,
      password_hash: passwordHash,
      full_name: String(full_name).trim(),
      phone: phone || null,
      role: 'customer',
      is_active: true,
    });

    if (userError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, error: userError.message }, { status: 500 });
    }

    const childName = customer_type === 'parent' ? String(child_name).trim() : null;
    const childClass = customer_type === 'parent' ? String(child_class).trim() : null;

    const { error: custError } = await supabaseAdmin.from('customers').insert({
      id: userId,
      customer_type,
      child_name: childName,
      child_class: childClass,
      notes: customer_type === 'teacher' ? notes || null : null,
    });

    if (custError) {
      await supabaseAdmin.from('users').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, error: custError.message }, { status: 500 });
    }

    // multi-anak: simpan anak pertama ke tabel children
    if (customer_type === 'parent' && childName && childClass) {
      await supabaseAdmin.from('children').insert({
        customer_id: userId,
        name: childName,
        class_name: childClass,
        is_active: true,
      });
    }

    return NextResponse.json({ success: true, data: { id: userId, email: emailNorm } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}
