'use client';

import { useEffect, useState } from 'react';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { Loading } from '@/components/ui/Loading';

interface DailyReport {
  date: string;
  total_orders: number;
  total_revenue: number;
  cash_revenue: number;
  transfer_revenue: number;
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

  useEffect(() => { fetchReports(); }, []);

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
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Laporan keuangan</h1>
        <p className="page-sub">Ringkasan pendapatan cash & transfer</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="stat-card green">
          <div className="text-sm text-slate-500">Total pendapatan</div>
          <div className="mt-2 text-2xl font-extrabold text-teal-700">{formatRupiah(summary?.total_revenue || 0)}</div>
        </div>
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Total pesanan</div>
          <div className="mt-2 text-2xl font-extrabold text-sky-700">{summary?.total_orders || 0}</div>
        </div>
        <div className="stat-card purple">
          <div className="text-sm text-slate-500">Total pelanggan</div>
          <div className="mt-2 text-2xl font-extrabold text-violet-700">{summary?.total_customers || 0}</div>
        </div>
        <div className="stat-card orange">
          <div className="text-sm text-slate-500">Pendapatan hari ini</div>
          <div className="mt-2 text-2xl font-extrabold text-orange-600">{formatRupiah(summary?.today_revenue || 0)}</div>
        </div>
      </div>

      <section className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div>
            <label className="label">Dari tanggal</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="field" />
          </div>
          <div>
            <label className="label">Sampai tanggal</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="field" />
          </div>
          <button onClick={filterByDate} className="btn btn-primary">Filter</button>
        </div>
      </section>

      {loading ? (
        <Loading />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pesanan</th>
                <th>Cash</th>
                <th>Transfer</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {dailyReport.map((row) => (
                <tr key={row.date}>
                  <td className="font-medium text-slate-800">{formatDateShort(row.date)}</td>
                  <td>{row.total_orders}</td>
                  <td className="text-violet-700">{formatRupiah(row.cash_revenue)}</td>
                  <td className="text-sky-700">{formatRupiah(row.transfer_revenue)}</td>
                  <td className="font-bold text-teal-700">{formatRupiah(row.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="font-bold">Total</td>
                <td className="font-bold">{dailyReport.reduce((s, r) => s + r.total_orders, 0)}</td>
                <td className="font-bold">{formatRupiah(dailyReport.reduce((s, r) => s + r.cash_revenue, 0))}</td>
                <td className="font-bold">{formatRupiah(dailyReport.reduce((s, r) => s + r.transfer_revenue, 0))}</td>
                <td className="font-bold text-teal-700">{formatRupiah(totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
          {dailyReport.length === 0 && <div className="p-10 text-center text-slate-500">Tidak ada data periode ini</div>}
        </div>
      )}
    </div>
  );
}
