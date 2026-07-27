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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Ringkasan operasional catering hari ini</p>
        </div>
        <Link href="/" className="btn btn-secondary shrink-0 self-start sm:self-auto">
          Lihat beranda
        </Link>
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-900">Alur kerja admin</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="guide-step">
            <div className="guide-num">1</div>
            <div>
              <div className="font-semibold text-slate-800">Buat kategori & menu</div>
              <div className="text-sm text-slate-500">Menu Catering (master, tanpa hari)</div>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-num">2</div>
            <div>
              <div className="font-semibold text-slate-800">Publish harian</div>
              <div className="text-sm text-slate-500">Pilih tanggal + menu yang dijual</div>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-num">3</div>
            <div>
              <div className="font-semibold text-slate-800">Kirim link</div>
              <div className="text-sm text-slate-500">WA ke orang tua / guru</div>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-num">4</div>
            <div>
              <div className="font-semibold text-slate-800">Kelola bayar</div>
              <div className="text-sm text-slate-500">Cash manual / TF otomatis</div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin/catalog" className="btn btn-secondary">Isi daftar menu</Link>
          <Link href="/admin/menus" className="btn btn-primary">Publish harian</Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Pendapatan hari ini</div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">{formatRupiah(summary?.today_revenue || 0)}</div>
        </div>
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Pesanan hari ini</div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">{summary?.today_orders || 0}</div>
        </div>
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Total pelanggan</div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">{summary?.total_customers || 0}</div>
        </div>
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Total pendapatan</div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">{formatRupiah(summary?.total_revenue || 0)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Pesanan terbaru</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-blue-600 hover:underline">Lihat semua</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada pesanan</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-2xl border border-blue-50 bg-blue-50/40 px-4 py-3">
                  <div>
                    <div className="font-semibold text-slate-800">{order.customer?.user?.full_name || 'Pelanggan'}</div>
                    <div className="text-xs text-slate-500">{order.delivery_date}</div>
                  </div>
                  <div className="font-bold text-blue-600">{formatRupiah(order.total_amount)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-4 font-bold text-slate-900">Aksi cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/categories', title: 'Kategori', desc: 'Kelompok menu' },
              { href: '/admin/catalog', title: 'Daftar Menu', desc: 'Item + harga + foto' },
              { href: '/admin/menus', title: 'Publish Harian', desc: 'Pilih tanggal & menu' },
              { href: '/admin/users', title: 'Kelola User', desc: 'Tambah admin/customer' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-blue-100 bg-blue-50 p-4 transition hover:border-blue-200 hover:bg-blue-100"
              >
                <div className="font-bold text-slate-900">{item.title}</div>
                <div className="mt-1 text-xs text-slate-600">{item.desc}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
