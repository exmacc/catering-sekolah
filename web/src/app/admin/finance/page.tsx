'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

const emptyExpense = {
  title: '',
  amount: 0,
  category: 'Operasional',
  expense_date: new Date().toISOString().split('T')[0],
  payment_period: 'daily' as 'daily' | 'weekly' | 'monthly' | 'other',
  notes: '',
};

export default function AdminFinancePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyExpense);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [sumRes, payRes, expRes] = await Promise.all([
      fetch('/api/finance/summary'),
      fetch('/api/payments?status=paid'),
      fetch('/api/expenses'),
    ]);
    const [sumData, payData, expData] = await Promise.all([sumRes.json(), payRes.json(), expRes.json()]);
    if (sumData.success) setSummary(sumData.data);
    if (payData.success) setPayments(payData.data || []);
    if (expData.success) setExpenses(expData.data || []);
    if (!expData.success) setError(expData.error || 'Gagal memuat pengeluaran. Jalankan migration SQL dulu.');
    setLoading(false);
  }

  async function addExpense(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, created_by: user?.id }),
    });
    const result = await res.json();
    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Gagal simpan pengeluaran');
      return;
    }
    setForm({ ...emptyExpense, expense_date: new Date().toISOString().split('T')[0] });
    setOpen(false);
    load();
  }

  async function removeExpense(id: string) {
    if (!confirm('Hapus pengeluaran ini?')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Keuangan</h1>
          <p className="page-sub">Kelola pemasukan (harian/mingguan/bulanan) & pengeluaran usaha</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => { setError(''); setOpen(true); }}>
          + Tambah pengeluaran
        </button>
      </div>

      {error && !open && <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Total pemasukan</div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">{formatRupiah(summary?.income || 0)}</div>
        </div>
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Total pengeluaran</div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">{formatRupiah(summary?.outcome || 0)}</div>
        </div>
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Saldo</div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">{formatRupiah(summary?.balance || 0)}</div>
        </div>
        <div className="stat-card blue">
          <div className="text-sm text-slate-500">Cash / Transfer</div>
          <div className="mt-2 text-sm font-bold text-blue-600">
            {formatRupiah(summary?.cash_income || 0)} / {formatRupiah(summary?.transfer_income || 0)}
          </div>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-900">Pemasukan per skema bayar</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <div key={p} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="text-sm font-semibold text-slate-700">
                {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </div>
              <div className="mt-2 text-lg font-extrabold text-blue-600">
                Masuk: {formatRupiah(summary?.by_period?.[p]?.income || 0)}
              </div>
              <div className="text-sm text-blue-600">
                Keluar: {formatRupiah(summary?.by_period?.[p]?.outcome || 0)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-3 font-bold text-slate-900">Pemasukan (pembayaran lunas)</h2>
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {payments.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada pemasukan</p>
            ) : (
              payments.slice(0, 20).map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-blue-50 bg-blue-50/30 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{p.customer?.user?.full_name || 'Pelanggan'}</div>
                    <div className="text-xs text-slate-500">
                      {p.payment_method === 'cash' ? 'Cash' : 'Transfer'} · {p.payment_period === 'daily' ? 'Harian' : p.payment_period === 'weekly' ? 'Mingguan' : 'Bulanan'}
                    </div>
                  </div>
                  <div className="font-bold text-blue-600">{formatRupiah(p.amount)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-bold text-slate-900">Pengeluaran</h2>
          <div className="max-h-[420px] space-y-2 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada pengeluaran</p>
            ) : (
              expenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-xl border border-blue-50 bg-blue-50/20 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{e.title}</div>
                    <div className="text-xs text-slate-500">
                      {formatDateShort(e.expense_date)} · {e.category || '-'} · <Badge tone="info">{e.payment_period}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-blue-600">{formatRupiah(e.amount)}</div>
                    <button onClick={() => removeExpense(e.id)} className="text-xs text-red-500 hover:underline">Hapus</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah pengeluaran">
        <form onSubmit={addExpense} className="space-y-4">
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label className="label">Judul</label>
            <input className="field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Beli beras" required />
          </div>
          <div>
            <label className="label">Jumlah (Rp)</label>
            <input type="number" className="field" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: parseInt(e.target.value) || 0 })} min={1} required />
          </div>
          <div>
            <label className="label">Kategori biaya</label>
            <input className="field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Operasional / Bahan baku" />
          </div>
          <div>
            <label className="label">Tanggal</label>
            <input type="date" className="field" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} required />
          </div>
          <div>
            <label className="label">Periode (skema)</label>
            <select className="field" value={form.payment_period} onChange={(e) => setForm({ ...form, payment_period: e.target.value as any })}>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="other">Lainnya</option>
            </select>
          </div>
          <div>
            <label className="label">Catatan</label>
            <input className="field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Batal</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
