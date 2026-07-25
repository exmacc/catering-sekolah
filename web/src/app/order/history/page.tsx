'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import Link from 'next/link';

export default function OrderHistoryPage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
    else setLoading(false);
  }, [user]);

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*, menu_item:menu_items(*))')
      .eq('customer_id', user!.id)
      .order('created_at', { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    delivered: 'Selesai',
    cancelled: 'Dibatalkan',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-emerald-700">Catering Sekolah</Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button onClick={logout} className="text-sm text-red-500 hover:underline">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Riwayat Pesanan</h2>
            <p className="text-gray-600">Daftar pesanan Anda</p>
          </div>
          <Link href="/" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">
            Pesan Lagi
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 mb-4">Belum ada pesanan</p>
            <Link href="/" className="text-emerald-600 hover:underline">Pesan sekarang</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${order.payment_method === 'cash' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.payment_method === 'cash' ? 'Cash' : 'Transfer'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {order.payment_period === 'daily' ? 'Harian' : order.payment_period === 'weekly' ? 'Mingguan' : 'Bulanan'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDateShort(order.delivery_date)}</p>
                  </div>
                  <span className="text-lg font-bold text-emerald-700">{formatRupiah(order.total_amount)}</span>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>{item.menu_item?.name} x{item.quantity}</span>
                      <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
