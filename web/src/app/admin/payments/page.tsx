'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchPayments(); }, []);

  async function fetchPayments() {
    let query = supabase
      .from('payments')
      .select('*, customer:customers(*, user:users(*))')
      .order('created_at', { ascending: false });

    if (filter === 'pending') query = query.eq('status', 'pending');
    if (filter === 'paid') query = query.eq('status', 'paid');

    const { data } = await query;
    if (data) setPayments(data);
    setLoading(false);
  }

  async function confirmCash(paymentId: string) {
    const res = await fetch('/api/payments/confirm-cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, admin_id: user?.id }),
    });
    const result = await res.json();
    if (result.success) fetchPayments();
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    paid: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-700',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
          <p className="text-gray-500">Kelola pembayaran masuk</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'paid'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-sm rounded-lg ${filter === s ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s === '' ? 'Semua' : s === 'pending' ? 'Menunggu' : 'Lunas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Pelanggan</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Metode</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Periode</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Jumlah</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tanggal</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{payment.customer?.user?.full_name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${payment.payment_method === 'cash' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {payment.payment_method === 'cash' ? 'Cash' : 'Transfer'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.payment_period === 'daily' ? 'Harian' : payment.payment_period === 'weekly' ? 'Mingguan' : 'Bulanan'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-700 text-right">{formatRupiah(payment.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[payment.status]}`}>
                        {payment.status === 'pending' ? 'Menunggu' : payment.status === 'paid' ? 'Lunas' : payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.created_at ? formatDateShort(payment.created_at) : '-'}</td>
                    <td className="px-6 py-4">
                      {payment.status === 'pending' && payment.payment_method === 'cash' && (
                        <button onClick={() => confirmCash(payment.id)} className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                          Konfirmasi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {payments.length === 0 && <div className="text-center py-12 text-gray-500">Belum ada pembayaran</div>}
        </div>
      )}
    </div>
  );
}
