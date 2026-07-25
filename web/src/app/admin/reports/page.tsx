'use client';

import { useEffect, useState } from 'react';
import { formatRupiah, formatDateShort } from '@/lib/utils';

interface DailyReport {
  date: string;
  total_orders: number;
  total_revenue: number;
  cash_revenue: number;
  transfer_revenue: number;
  total_items: number;
}

interface Summary {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  today_revenue: number;
  today_orders: number;
}

export default function AdminReportsPage() {
  const [dailyReport, setDailyReport] = useState<DailyReport[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);

    const [dailyRes, summaryRes] = await Promise.all([
      fetch(`/api/reports?type=daily&start_date=${startDate}&end_date=${endDate}`),
      fetch('/api/reports?type=summary'),
    ]);

    const [dailyData, summaryData] = await Promise.all([dailyRes.json(), summaryRes.json()]);

    if (dailyData.success) setDailyReport(dailyData.data);
    if (summaryData.success) setSummary(summaryData.data);
    setLoading(false);
  }

  async function filterByDate() {
    setLoading(true);
    const res = await fetch(`/api/reports?type=daily&start_date=${startDate}&end_date=${endDate}`);
    const data = await res.json();
    if (data.success) setDailyReport(data.data);
    setLoading(false);
  }

  const totalRevenue = dailyReport.reduce((sum, d) => sum + d.total_revenue, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Laporan Keuangan</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
          <p className="text-2xl font-bold text-emerald-700">{formatRupiah(summary?.total_revenue || 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Pesanan</p>
          <p className="text-2xl font-bold text-blue-700">{summary?.total_orders || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Pelanggan</p>
          <p className="text-2xl font-bold text-purple-700">{summary?.total_customers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Pendapatan Hari Ini</p>
          <p className="text-2xl font-bold text-orange-700">{formatRupiah(summary?.today_revenue || 0)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dari Tanggal</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sampai Tanggal</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <button onClick={filterByDate} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Filter</button>
        </div>
      </div>

      {/* Daily Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Laporan Harian</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tanggal</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Pesanan</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Cash</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Transfer</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {dailyReport.map((row) => (
                <tr key={row.date} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{formatDateShort(row.date)}</td>
                  <td className="px-6 py-4 text-sm text-right text-gray-600">{row.total_orders}</td>
                  <td className="px-6 py-4 text-sm text-right text-purple-700">{formatRupiah(row.cash_revenue)}</td>
                  <td className="px-6 py-4 text-sm text-right text-blue-700">{formatRupiah(row.transfer_revenue)}</td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-emerald-700">{formatRupiah(row.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-medium">
                <td className="px-6 py-4 text-sm text-gray-900">Total</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">{dailyReport.reduce((s, r) => s + r.total_orders, 0)}</td>
                <td className="px-6 py-4 text-sm text-right text-purple-900">{formatRupiah(dailyReport.reduce((s, r) => s + r.cash_revenue, 0))}</td>
                <td className="px-6 py-4 text-sm text-right text-blue-900">{formatRupiah(dailyReport.reduce((s, r) => s + r.transfer_revenue, 0))}</td>
                <td className="px-6 py-4 text-sm text-right text-emerald-900">{formatRupiah(totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        {dailyReport.length === 0 && <div className="text-center py-12 text-gray-500">Tidak ada data untuk periode ini</div>}
      </div>
    </div>
  );
}
