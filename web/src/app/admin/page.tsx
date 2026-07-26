'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import { Loading } from '@/components/ui/Loading';

interface Summary {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  today_revenue: number;
  today_orders: number;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/reports?type=summary');
    const result = await res.json();
    if (result.success) setSummary(result.data);

    const orderRes = await fetch('/api/orders');
    const orderResult = await orderRes.json();
    if (orderResult.success) setRecentOrders((orderResult.data || []).slice(0, 5));
    setLoading(false);
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Ringkasan operasional catering hari ini</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="stat-card green">
          <div className="text-sm text-slate-500">Pendapatan hari ini</div>
          <div className="mt-2 text-2xl font-extrabold text-teal-700">{formatRupiah(summary?.today_revenue || 0)}</div>
        </div>
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Pesanan hari ini</div>
          <div className="mt-2 text-2xl font-extrabold text-sky-700">{summary?.today_orders || 0}</div>
        </div>
        <div className="stat-card purple">
          <div className="text-sm text-slate-500">Total pelanggan</div>
          <div className="mt-2 text-2xl font-extrabold text-violet-700">{summary?.total_customers || 0}</div>
        </div>
        <div className="stat-card orange">
          <div className="text-sm text-slate-500">Total pendapatan</div>
          <div className="mt-2 text-2xl font-extrabold text-orange-600">{formatRupiah(summary?.total_revenue || 0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Pesanan terbaru</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-teal-700 hover:underline">Lihat semua</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada pesanan</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-800">{order.customer?.user?.full_name || 'Pelanggan'}</div>
                    <div className="text-xs text-slate-500">{order.delivery_date}</div>
                  </div>
                  <div className="font-bold text-teal-700">{formatRupiah(order.total_amount)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-bold text-slate-900 mb-4">Aksi cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/menus/new', title: 'Buat menu', desc: 'Siapkan menu H-1', tone: 'from-teal-500 to-emerald-600' },
              { href: '/admin/orders', title: 'Kelola pesanan', desc: 'Konfirmasi order', tone: 'from-sky-500 to-blue-600' },
              { href: '/admin/payments', title: 'Pembayaran', desc: 'Konfirmasi cash', tone: 'from-violet-500 to-purple-600' },
              { href: '/admin/reports', title: 'Laporan', desc: 'Pantau keuangan', tone: 'from-orange-500 to-amber-600' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className={`rounded-2xl bg-gradient-to-br ${item.tone} p-4 text-white shadow-lg`}>
                <div className="font-bold">{item.title}</div>
                <div className="text-xs text-white/80 mt-1">{item.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
