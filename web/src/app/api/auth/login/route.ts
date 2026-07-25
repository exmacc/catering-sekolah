import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email dan password wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*, customer:customers(*)')
      .eq('id', data.user.id)
      .single();

    return NextResponse.json({
      success: true,
      data: { user: userData, session: data.session },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
