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
  billing_auto_enabled: false,
  billing_daily_time: '18:00',
  billing_weekly_day: 5,
  billing_monthly_day: 1,
  billing_wa_template: '',
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
        billing_auto_enabled: !!data?.billing_auto_enabled,
        billing_daily_time: data?.billing_daily_time || '18:00',
        billing_weekly_day: data?.billing_weekly_day ?? 5,
        billing_monthly_day: data?.billing_monthly_day ?? 1,
        billing_wa_template: data?.billing_wa_template || '',
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

    const payload: Record<string, any> = {
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

    if (body.billing_auto_enabled !== undefined) payload.billing_auto_enabled = !!body.billing_auto_enabled;
    if (body.billing_daily_time !== undefined) payload.billing_daily_time = body.billing_daily_time;
    if (body.billing_weekly_day !== undefined) payload.billing_weekly_day = Number(body.billing_weekly_day);
    if (body.billing_monthly_day !== undefined) payload.billing_monthly_day = Number(body.billing_monthly_day);
    if (body.billing_wa_template !== undefined) payload.billing_wa_template = body.billing_wa_template || null;

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
