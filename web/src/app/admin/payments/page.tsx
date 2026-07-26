'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchPayments(); }, [filter]);

  async function fetchPayments() {
    setLoading(true);
    const qs = filter ? `?status=${filter}` : '';
    const res = await fetch(`/api/payments${qs}`);
    const result = await res.json();
    if (result.success) setPayments(result.data || []);
    setLoading(false);
  }

  async function confirmCash(paymentId: string) {
    await fetch('/api/payments/confirm-cash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_id: paymentId, admin_id: user?.id }),
    });
    fetchPayments();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="page-title">Pembayaran</h1>
          <p className="page-sub">Pantau transfer & konfirmasi cash</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['', 'pending', 'paid'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`btn !py-2 !px-3 text-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}>
              {s === '' ? 'Semua' : s === 'pending' ? 'Menunggu' : 'Lunas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pelanggan</th>
                <th>Metode</th>
                <th>Periode</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="font-medium text-slate-800">{payment.customer?.user?.full_name || '-'}</td>
                  <td>
                    <Badge tone={payment.payment_method === 'cash' ? 'purple' : 'info'}>
                      {payment.payment_method === 'cash' ? 'Cash' : 'Transfer'}
                    </Badge>
                  </td>
                  <td className="text-slate-600">
                    {payment.payment_period === 'daily' ? 'Harian' : payment.payment_period === 'weekly' ? 'Mingguan' : 'Bulanan'}
                  </td>
                  <td className="font-bold text-violet-700">{formatRupiah(payment.amount)}</td>
                  <td>
                    <Badge tone={payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}>
                      {payment.status === 'pending' ? 'Menunggu' : payment.status === 'paid' ? 'Lunas' : payment.status}
                    </Badge>
                  </td>
                  <td className="text-slate-500 text-sm">{payment.created_at ? formatDateShort(payment.created_at) : '-'}</td>
                  <td>
                    {payment.status === 'pending' && payment.payment_method === 'cash' && (
                      <button onClick={() => confirmCash(payment.id)} className="btn btn-primary !py-1.5 !px-3 text-sm">Konfirmasi</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && <div className="p-10 text-center text-slate-500">Belum ada pembayaran</div>}
        </div>
      )}
    </div>
  );
}
