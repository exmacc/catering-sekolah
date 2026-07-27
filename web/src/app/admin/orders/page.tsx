'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ActionIcon } from '@/components/ui/ActionIcon';

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
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch('/api/orders');
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (methodFilter && o.payment_method !== methodFilter) return false;
      if (periodFilter && o.payment_period !== periodFilter) return false;
      if (dateFilter && o.delivery_date !== dateFilter) return false;
      if (q) {
        const name = o.customer?.user?.full_name?.toLowerCase() || '';
        const child = (o.child?.name || o.customer?.child_name || '').toLowerCase();
        const cls = (o.child?.class_name || o.customer?.child_class || '').toLowerCase();
        const items = (o.items || []).map((i: any) => i.menu_item?.name?.toLowerCase() || '').join(' ');
        const notes = (o.notes || '').toLowerCase();
        if (![name, child, cls, items, notes].some((s) => s.includes(q))) return false;
      }
      return true;
    });
  }, [orders, statusFilter, methodFilter, periodFilter, dateFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Pesanan</h1>
        <p className="page-sub">Tabel pesanan — filter status, metode, periode, tanggal, dan pemesan</p>
      </div>

      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          {['', 'pending', 'confirmed', 'delivered', 'cancelled'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`btn !px-3 !py-1.5 text-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            >
              {s ? statusLabel[s] : 'Semua status'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input
            className="field"
            placeholder="Cari pemesan / anak / kelas / item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="field" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="">Semua metode</option>
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
          </select>
          <select className="field" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
            <option value="">Semua periode</option>
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
          </select>
          <input type="date" className="field" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        <div className="text-xs text-slate-500">{filtered.length} dari {orders.length} pesanan</div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pemesan</th>
                <th>Item</th>
                <th>Metode</th>
                <th>Periode</th>
                <th>Status</th>
                <th>Total</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const itemSummary = (order.items || [])
                  .map((i: any) => `${i.menu_item?.name || 'Item'}×${i.quantity}`)
                  .join(', ');
                const isOpen = expanded === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr className="align-top">
                      <td className="whitespace-nowrap text-sm text-slate-600">
                        {formatDateShort(order.delivery_date)}
                      </td>
                      <td>
                        <div className="font-semibold text-slate-800">{order.customer?.user?.full_name || 'Pelanggan'}</div>
                        {order.child ? (
                          <div className="text-xs text-slate-500">
                            Anak: {order.child.name} · {order.child.class_name}
                          </div>
                        ) : order.customer?.customer_type === 'parent' ? (
                          <div className="text-xs text-slate-500">
                            {order.customer?.child_name} · {order.customer?.child_class}
                          </div>
                        ) : order.customer?.customer_type === 'teacher' ? (
                          <div className="text-xs text-slate-500">Guru</div>
                        ) : null}
                      </td>
                      <td className="max-w-[220px]">
                        <div className="truncate text-sm text-slate-700" title={itemSummary}>
                          {itemSummary || '-'}
                        </div>
                        <button
                          type="button"
                          className="mt-1 text-xs font-semibold text-blue-600 hover:underline"
                          onClick={() => setExpanded(isOpen ? null : order.id)}
                        >
                          {isOpen ? 'Sembunyikan' : 'Detail'}
                        </button>
                      </td>
                      <td>
                        <Badge tone={order.payment_method === 'cash' ? 'gray' : 'info'}>
                          {order.payment_method === 'cash' ? 'Cash' : 'Transfer'}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone="gray">
                          {order.payment_period === 'daily' ? 'Harian' : order.payment_period === 'weekly' ? 'Mingguan' : 'Bulanan'}
                        </Badge>
                      </td>
                      <td>
                        <Badge tone={statusTone[order.status]}>{statusLabel[order.status]}</Badge>
                      </td>
                      <td className="whitespace-nowrap font-bold text-blue-700">{formatRupiah(order.total_amount)}</td>
                      <td>
                        <div className="inline-flex gap-1.5">
                          {order.status === 'pending' && (
                            <>
                              <ActionIcon icon="check" label="Konfirmasi" tone="primary" onClick={() => updateStatus(order.id, 'confirmed')} />
                              <ActionIcon icon="close" label="Batalkan" tone="danger" onClick={() => updateStatus(order.id, 'cancelled')} />
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <ActionIcon icon="done" label="Tandai selesai" tone="success" onClick={() => updateStatus(order.id, 'delivered')} />
                          )}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={8} className="bg-slate-50">
                          <div className="space-y-2 p-3 text-sm">
                            <div className="font-semibold text-slate-800">Rincian item</div>
                            <div className="grid gap-1 sm:grid-cols-2">
                              {(order.items || []).map((item: any) => (
                                <div key={item.id} className="flex justify-between rounded-lg bg-white px-3 py-2">
                                  <span>
                                    {item.menu_item?.name} × {item.quantity}
                                  </span>
                                  <span className="font-medium">{formatRupiah(item.subtotal || 0)}</span>
                                </div>
                              ))}
                            </div>
                            {order.notes && (
                              <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-amber-900">
                                <b>Catatan:</b> {order.notes}
                              </div>
                            )}
                            {order.customer?.user?.phone && (
                              <div className="text-slate-600">
                                WA: <b>{order.customer.user.phone}</b>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="p-10 text-center text-slate-500">Tidak ada pesanan sesuai filter</div>}
        </div>
      )}
    </div>
  );
}
