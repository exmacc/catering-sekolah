import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { formatRupiah } from '@/lib/utils';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('*, customer:customers(*, user:users(*))')
      .eq('id', id)
      .single();

    if (error || !invoice) {
      return NextResponse.json({ success: false, error: 'Tagihan tidak ditemukan' }, { status: 404 });
    }

    const { data: settings } = await supabaseAdmin
      .from('app_settings')
      .select('*')
      .eq('id', 'main')
      .maybeSingle();

    const phoneRaw = invoice.customer?.user?.phone || '';
    const phone = normalizeWaPhone(phoneRaw);
    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Customer belum punya nomor WA. Lengkapi di data user.' },
        { status: 400 }
      );
    }

    const bankName = settings?.bank_name || '-';
    const bankNumber = settings?.bank_account_number || '-';
    const bankHolder = settings?.bank_account_name || '-';
    const business = settings?.business_name || 'Catering';

    const template =
      settings?.billing_wa_template ||
      `Halo {nama}, tagihan {periode} dari *{bisnis}*.\nNo: {nomor}\nTotal: {total}\nJatuh tempo: {jatuh_tempo}\n\nTransfer ke:\n{bank} {rekening} a.n. {atas_nama}\n\nTerima kasih.`;

    const periodLabel =
      invoice.payment_period === 'daily'
        ? 'harian'
        : invoice.payment_period === 'weekly'
          ? 'mingguan'
          : invoice.payment_period === 'monthly'
            ? 'bulanan'
            : `${invoice.period_start} s/d ${invoice.period_end}`;

    const message = template
      .replace(/\{nama\}/g, invoice.customer?.user?.full_name || 'Pelanggan')
      .replace(/\{periode\}/g, periodLabel)
      .replace(/\{bisnis\}/g, business)
      .replace(/\{nomor\}/g, invoice.invoice_number)
      .replace(/\{total\}/g, formatRupiah(invoice.total_amount))
      .replace(/\{jatuh_tempo\}/g, invoice.due_date || '-')
      .replace(/\{bank\}/g, bankName)
      .replace(/\{rekening\}/g, bankNumber)
      .replace(/\{atas_nama\}/g, bankHolder);

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    await supabaseAdmin
      .from('invoices')
      .update({
        wa_sent_at: new Date().toISOString(),
        wa_phone: phone,
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data: { wa_url: waUrl, phone, message },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function normalizeWaPhone(phone: string): string {
  let p = phone.replace(/\D/g, '');
  if (!p) return '';
  if (p.startsWith('0')) p = '62' + p.slice(1);
  if (p.startsWith('8')) p = '62' + p;
  return p;
}
