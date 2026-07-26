'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';

const statusTone: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  confirmed: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

const statusLabel: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
};

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  async function fetchOrders() {
    const res = await fetch(`/api/orders?customer_id=${user!.id}`);
    const result = await res.json();
    if (result.success) setOrders(result.data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen pb-12">
      <CustomerHeader />

      <main className="shell py-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="page-title">Riwayat pesanan</h1>
            <p className="page-sub">Pantau status dan detail pesanan kamu</p>
          </div>
          <Link href="/" className="btn btn-primary">Pesan lagi</Link>
        </div>

        {loading ? (
          <Loading />
        ) : !user ? (
          <EmptyState title="Belum login" description="Masuk dulu untuk melihat riwayat pesanan." action={<Link href="/auth/login" className="btn btn-primary">Masuk</Link>} />
        ) : orders.length === 0 ? (
          <EmptyState title="Belum ada pesanan" description="Mulai pesan menu catering hari ini." action={<Link href="/" className="btn btn-primary">Lihat menu</Link>} />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
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
                    <div className="text-sm text-slate-500">Tanggal saji: {formatDateShort(order.delivery_date)}</div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-500">Total</div>
                    <div className="text-xl font-extrabold text-violet-700">{formatRupiah(order.total_amount)}</div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-700">{item.menu_item?.name} × {item.quantity}</span>
                      <span className="font-medium text-slate-800">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
