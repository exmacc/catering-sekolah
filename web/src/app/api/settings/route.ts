import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const DEFAULTS = {
  id: 'main',
  business_name: 'Catering Sekolah',
  tagline: 'Pesan mudah • Bayar fleksibel',
  logo_url: null as string | null,
  bank_name: '',
  bank_account_number: '',
  bank_account_name: '',
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: true, data: DEFAULTS, warning: error.message });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...DEFAULTS,
        ...(data || {}),
        bank_name: data?.bank_name || '',
        bank_account_number: data?.bank_account_number || '',
        bank_account_name: data?.bank_account_name || '',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: true, data: DEFAULTS, warning: error.message });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const business_name = String(body.business_name || '').trim();
    if (!business_name) {
      return NextResponse.json({ success: false, error: 'Nama catering wajib diisi' }, { status: 400 });
    }

    let logo_url = body.logo_url ?? null;
    if (typeof logo_url === 'string' && logo_url.length > 900_000) {
      return NextResponse.json({ success: false, error: 'Logo terlalu besar. Maks ~500KB. Kompres dulu.' }, { status: 400 });
    }
    if (logo_url === '') logo_url = null;

    const payload = {
      id: 'main',
      business_name,
      tagline: body.tagline?.trim() || 'Pesan mudah • Bayar fleksibel',
      logo_url,
      bank_name: body.bank_name?.trim() || null,
      bank_account_number: body.bank_account_number?.trim() || null,
      bank_account_name: body.bank_account_name?.trim() || null,
      updated_at: new Date().toISOString(),
      updated_by: body.updated_by || null,
    };

    const { data, error } = await supabaseAdmin
      .from('app_settings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
