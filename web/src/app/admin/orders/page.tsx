'use client';

import { useEffect, useState } from 'react';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';

const statusLabel: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
};

const statusTone: Record<string, 'warning' | 'info' | 'success' | 'danger' | 'gray'> = {
  pending: 'warning',
  confirmed: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchOrders(); }, [filter]);

  async function fetchOrders() {
    setLoading(true);
    const qs = filter ? `?status=${filter}` : '';
    const res = await fetch(`/api/orders${qs}`);
    const result = await res.json();
    if (result.success) setOrders(result.data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="page-title">Pesanan</h1>
          <p className="page-sub">Kelola & konfirmasi pesanan customer</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['', 'pending', 'confirmed', 'delivered', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`btn !py-2 !px-3 text-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {s ? statusLabel[s] : 'Semua'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="card p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge tone={statusTone[order.status]}>{statusLabel[order.status]}</Badge>
                    <Badge tone={order.payment_method === 'cash' ? 'purple' : 'info'}>
                      {order.payment_method === 'cash' ? 'Cash' : 'Transfer'}
                    </Badge>
                    <Badge tone="gray">
                      {order.payment_period === 'daily' ? 'Harian' : order.payment_period === 'weekly' ? 'Mingguan' : 'Bulanan'}
                    </Badge>
                  </div>
                  <div className="font-bold text-slate-900">{order.customer?.user?.full_name || 'Pelanggan'}</div>
                  {order.customer?.customer_type === 'parent' && (
                    <div className="text-sm text-slate-500">{order.customer?.child_name} · {order.customer?.child_class}</div>
                  )}
                  <div className="text-sm text-slate-500 mt-1">{formatDateShort(order.delivery_date)}</div>
                </div>
                <div className="text-left lg:text-right">
                  <div className="text-xs text-slate-500">Total</div>
                  <div className="text-xl font-extrabold text-violet-700">{formatRupiah(order.total_amount)}</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="text-sm text-slate-600">
                    {item.menu_item?.name} × {item.quantity}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {order.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(order.id, 'confirmed')} className="btn btn-primary !py-2 !px-3 text-sm">Konfirmasi</button>
                    <button onClick={() => updateStatus(order.id, 'cancelled')} className="btn btn-danger !py-2 !px-3 text-sm">Batalkan</button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => updateStatus(order.id, 'delivered')} className="btn btn-primary !py-2 !px-3 text-sm">Tandai selesai</button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
