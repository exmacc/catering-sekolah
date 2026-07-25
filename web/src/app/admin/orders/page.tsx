'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatRupiah, formatDateShort } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    let query = supabase
      .from('orders')
      .select('*, items:order_items(*, menu_item:menu_items(*)), customer:customers(*, user:users(*))')
      .order('created_at', { ascending: false });

    if (filter) query = query.eq('status', filter);

    const { data } = await query;
    if (data) setOrders(data);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-500">Kelola pesanan customer</p>
        </div>
        <div className="flex gap-2">
          {['', 'pending', 'confirmed', 'delivered', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-sm rounded-lg ${filter === s ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s ? statusLabels[s] : 'Semua'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat...</div>
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
                  </div>
                  <p className="font-medium text-gray-900">{order.customer?.user?.full_name}</p>
                  {order.customer?.customer_type === 'parent' && (
                    <p className="text-sm text-gray-500">{order.customer?.child_name} - {order.customer?.child_class}</p>
                  )}
                  <p className="text-sm text-gray-500">{formatDateShort(order.delivery_date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-700">{formatRupiah(order.total_amount)}</p>
                  <p className="text-xs text-gray-500">{order.payment_period === 'daily' ? 'Harian' : order.payment_period === 'weekly' ? 'Mingguan' : 'Bulanan'}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="text-sm text-gray-600">
                      {item.menu_item?.name} x{item.quantity}
                    </div>
                  ))}
                </div>

                {order.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(order.id, 'confirmed')} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                      Konfirmasi
                    </button>
                    <button onClick={() => updateStatus(order.id, 'cancelled')} className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                      Batalkan
                    </button>
                  </div>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => updateStatus(order.id, 'delivered')} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Tandai Selesai
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
