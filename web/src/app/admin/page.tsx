'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';
import Link from 'next/link';

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

    const { data: orders } = await supabase
      .from('orders')
      .select('*, customer:customers(*, user:users(*))')
      .order('created_at', { ascending: false })
      .limit(5);

    if (orders) setRecentOrders(orders);
    setLoading(false);
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Memuat...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pendapatan Hari Ini</p>
          <p className="text-2xl font-bold text-emerald-700">{formatRupiah(summary?.today_revenue || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pesanan Hari Ini</p>
          <p className="text-2xl font-bold text-blue-700">{summary?.today_orders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
          <p className="text-2xl font-bold text-emerald-700">{formatRupiah(summary?.total_revenue || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Pelanggan</p>
          <p className="text-2xl font-bold text-purple-700">{summary?.total_customers || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="text-sm text-emerald-600 hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada pesanan</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.customer?.user?.full_name}</p>
                    <p className="text-xs text-gray-500">{order.delivery_date}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">{formatRupiah(order.total_amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/menus/new" className="p-4 bg-emerald-50 rounded-xl text-center hover:bg-emerald-100 transition-colors">
              <p className="text-2xl mb-1">📋</p>
              <p className="text-sm font-medium text-emerald-700">Buat Menu Baru</p>
            </Link>
            <Link href="/admin/orders" className="p-4 bg-blue-50 rounded-xl text-center hover:bg-blue-100 transition-colors">
              <p className="text-2xl mb-1">📦</p>
              <p className="text-sm font-medium text-blue-700">Kelola Pesanan</p>
            </Link>
            <Link href="/admin/payments" className="p-4 bg-purple-50 rounded-xl text-center hover:bg-purple-100 transition-colors">
              <p className="text-2xl mb-1">💰</p>
              <p className="text-sm font-medium text-purple-700">Konfirmasi Pembayaran</p>
            </Link>
            <Link href="/admin/reports" className="p-4 bg-orange-50 rounded-xl text-center hover:bg-orange-100 transition-colors">
              <p className="text-2xl mb-1">📈</p>
              <p className="text-sm font-medium text-orange-700">Lihat Laporan</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
