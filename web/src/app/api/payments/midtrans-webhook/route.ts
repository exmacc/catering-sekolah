import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const transactionStatus = payload.transaction_status;
    const orderId = payload.order_id;
    const transactionId = payload.transaction_id;
    const grossAmount = parseInt(payload.gross_amount);
    const paymentType = payload.payment_type;

    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('transaction_id', orderId)
      .single();

    if (!payment) {
      await supabaseAdmin.from('payment_logs').insert({
        gateway: 'midtrans',
        gateway_transaction_id: transactionId,
        event_type: transactionStatus,
        raw_response: payload,
        status: 'unknown_payment',
      });
      return NextResponse.json({ ok: true });
    }

    let newStatus = payment.status;
    if (transactionStatus === 'settlement' || transactionStatus === 'capture') {
      newStatus = 'paid';
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending';
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      newStatus = 'failed';
    }

    await supabaseAdmin
      .from('payments')
      .update({
        status: newStatus,
        paid_at: newStatus === 'paid' ? new Date().toISOString() : null,
        transaction_id: transactionId,
      })
      .eq('id', payment.id);

    await supabaseAdmin.from('payment_logs').insert({
      payment_id: payment.id,
      gateway: 'midtrans',
      gateway_transaction_id: transactionId,
      event_type: transactionStatus,
      raw_response: payload,
      status: newStatus,
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
