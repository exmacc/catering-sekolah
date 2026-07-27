'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { ActionIcon } from '@/components/ui/ActionIcon';
import { Modal } from '@/components/ui/Modal';

const WEEKDAYS = [
  { v: 0, l: 'Minggu' },
  { v: 1, l: 'Senin' },
  { v: 2, l: 'Selasa' },
  { v: 3, l: 'Rabu' },
  { v: 4, l: 'Kamis' },
  { v: 5, l: 'Jumat' },
  { v: 6, l: 'Sabtu' },
];

export default function AdminBillingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [schedOpen, setSchedOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [genForm, setGenForm] = useState({
    payment_period: 'daily' as 'daily' | 'weekly' | 'monthly',
    period_start: today,
    period_end: today,
    customer_id: '',
    generate_all: true,
  });

  const [schedule, setSchedule] = useState({
    billing_auto_enabled: false,
    billing_daily_time: '18:00',
    billing_weekly_day: 5,
    billing_monthly_day: 1,
    billing_wa_template: '',
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [invRes, custRes, setRes] = await Promise.all([
      fetch('/api/invoices'),
      fetch('/api/customers'),
      fetch('/api/settings'),
    ]);
    const [invData, custData, setData] = await Promise.all([invRes.json(), custRes.json(), setRes.json()]);
    if (invData.success) setInvoices(invData.data || []);
    if (custData.success) setCustomers(custData.data || []);
    if (setData.success && setData.data) {
      setSchedule({
        billing_auto_enabled: !!setData.data.billing_auto_enabled,
        billing_daily_time: setData.data.billing_daily_time || '18:00',
        billing_weekly_day: setData.data.billing_weekly_day ?? 5,
        billing_monthly_day: setData.data.billing_monthly_day ?? 1,
        billing_wa_template: setData.data.billing_wa_template || '',
      });
    }
    setLoading(false);
  }

  function applyPeriodPreset(period: 'daily' | 'weekly' | 'monthly') {
    if (period === 'daily') {
      setGenForm((f) => ({ ...f, payment_period: period, period_start: today, period_end: today }));
    } else if (period === 'weekly') {
      setGenForm((f) => ({ ...f, payment_period: period, period_start: weekAgo, period_end: today }));
    } else {
      setGenForm((f) => ({ ...f, payment_period: period, period_start: monthStart, period_end: today }));
    }
  }

  async function generateInvoices(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/invoices/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period_start: genForm.period_start,
        period_end: genForm.period_end,
        payment_period: genForm.payment_period,
        generate_all: genForm.generate_all,
        customer_id: genForm.generate_all ? undefined : genForm.customer_id,
      }),
    });
    const result = await res.json();
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Gagal generate tagihan');
      return;
    }

    const count = result.data?.created_count ?? 1;
    setMessage(`Berhasil buat ${count} tagihan.`);
    setGenOpen(false);
    load();
  }

  async function sendWa(invoiceId: string) {
    setError('');
    const res = await fetch(`/api/invoices/${invoiceId}/send-wa`, { method: 'POST' });
    const result = await res.json();
    if (!result.success) {
      setError(result.error || 'Gagal siapkan WA');
      return;
    }
    window.open(result.data.wa_url, '_blank');
    load();
  }

  async function saveSchedule(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    // merge with existing settings
    const cur = await fetch('/api/settings').then((r) => r.json());
    const base = cur.data || {};
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...base,
        ...schedule,
        updated_by: user?.id,
      }),
    });
    const result = await res.json();
    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Gagal simpan jadwal. Jalankan SQL Setup DB dulu.');
      return;
    }
    setMessage('Jadwal tagihan tersimpan.');
    setSchedOpen(false);
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Tagihan</h1>
          <p className="page-sub">Generate tagihan harian/mingguan/bulanan & kirim ke WA customer</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => setSchedOpen(true)}>
            Setup jadwal
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setError(''); setGenOpen(true); }}>
            + Buat tagihan
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}

      <section className="card p-5">
        <h2 className="mb-2 font-bold text-slate-900">Cara kerja</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Buat tagihan per periode (harian / mingguan / bulanan) dari pesanan customer.</li>
          <li>Klik icon WA untuk buka WhatsApp dengan teks tagihan + no. rekening.</li>
          <li>
            <b>Jadwal otomatis:</b> atur jam/hari di Setup jadwal. Pengiriman fully otomatis butuh WhatsApp Business API
            (berbayar) + cron server. Saat ini jadwal tersimpan & pengiriman via tombol WA (siap pakai).
          </li>
        </ol>
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>No. Tagihan</th>
              <th>Customer</th>
              <th>Periode</th>
              <th>Skema</th>
              <th>Total</th>
              <th>Status</th>
              <th>WA</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-mono text-sm">{inv.invoice_number}</td>
                <td>
                  <div className="font-semibold text-slate-800">{inv.customer?.user?.full_name || '-'}</div>
                  <div className="text-xs text-slate-500">{inv.customer?.user?.phone || 'WA belum diisi'}</div>
                </td>
                <td className="text-sm text-slate-600">
                  {formatDateShort(inv.period_start)} – {formatDateShort(inv.period_end)}
                </td>
                <td>
                  <Badge tone="gray">
                    {inv.payment_period === 'daily'
                      ? 'Harian'
                      : inv.payment_period === 'weekly'
                        ? 'Mingguan'
                        : inv.payment_period === 'monthly'
                          ? 'Bulanan'
                          : '-'}
                  </Badge>
                </td>
                <td className="font-bold text-blue-700">{formatRupiah(inv.total_amount)}</td>
                <td>
                  <Badge tone={inv.status === 'paid' ? 'success' : inv.status === 'unpaid' ? 'warning' : 'gray'}>
                    {inv.status === 'paid' ? 'Lunas' : inv.status === 'unpaid' ? 'Belum bayar' : inv.status}
                  </Badge>
                </td>
                <td className="text-xs text-slate-500">
                  {inv.wa_sent_at ? formatDateShort(inv.wa_sent_at) : 'Belum'}
                </td>
                <td>
                  <ActionIcon
                    icon="whatsapp"
                    label="Kirim WA tagihan"
                    tone="primary"
                    onClick={() => sendWa(inv.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <div className="p-10 text-center text-slate-500">Belum ada tagihan. Klik + Buat tagihan.</div>}
      </div>

      {/* Generate modal */}
      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="Buat tagihan">
        <form onSubmit={generateInvoices} className="space-y-4">
          <div>
            <label className="label">Skema bayar</label>
            <div className="flex flex-wrap gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applyPeriodPreset(p)}
                  className={`btn !px-3 !py-1.5 text-sm ${genForm.payment_period === p ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Dari tanggal</label>
              <input type="date" className="field" value={genForm.period_start} onChange={(e) => setGenForm({ ...genForm, period_start: e.target.value })} required />
            </div>
            <div>
              <label className="label">Sampai tanggal</label>
              <input type="date" className="field" value={genForm.period_end} onChange={(e) => setGenForm({ ...genForm, period_end: e.target.value })} required />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={genForm.generate_all} onChange={(e) => setGenForm({ ...genForm, generate_all: e.target.checked })} className="accent-blue-600" />
            Semua customer yang punya pesanan di periode ini
          </label>
          {!genForm.generate_all && (
            <div>
              <label className="label">Pilih customer</label>
              <select className="field" value={genForm.customer_id} onChange={(e) => setGenForm({ ...genForm, customer_id: e.target.value })} required={!genForm.generate_all}>
                <option value="">— pilih —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.user?.full_name || c.id}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setGenOpen(false)}>Batal</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Memproses...' : 'Generate'}</button>
          </div>
        </form>
      </Modal>

      {/* Schedule modal */}
      <Modal open={schedOpen} onClose={() => setSchedOpen(false)} title="Setup jadwal kirim tagihan" wide>
        <form onSubmit={saveSchedule} className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={schedule.billing_auto_enabled}
              onChange={(e) => setSchedule({ ...schedule, billing_auto_enabled: e.target.checked })}
              className="accent-blue-600"
            />
            Aktifkan jadwal otomatis (siapkan cron/WA API untuk full auto)
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Harian — jam kirim</label>
              <input
                type="time"
                className="field"
                value={schedule.billing_daily_time}
                onChange={(e) => setSchedule({ ...schedule, billing_daily_time: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Mingguan — hari</label>
              <select
                className="field"
                value={schedule.billing_weekly_day}
                onChange={(e) => setSchedule({ ...schedule, billing_weekly_day: parseInt(e.target.value) })}
              >
                {WEEKDAYS.map((d) => (
                  <option key={d.v} value={d.v}>{d.l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Bulanan — tanggal</label>
              <input
                type="number"
                min={1}
                max={28}
                className="field"
                value={schedule.billing_monthly_day}
                onChange={(e) => setSchedule({ ...schedule, billing_monthly_day: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <div>
            <label className="label">Template WA (opsional)</label>
            <textarea
              className="field"
              rows={5}
              value={schedule.billing_wa_template}
              onChange={(e) => setSchedule({ ...schedule, billing_wa_template: e.target.value })}
              placeholder="Halo {nama}, tagihan {periode} dari *{bisnis}*..."
            />
            <p className="mt-1 text-xs text-slate-500">
              Placeholder: {'{nama} {periode} {bisnis} {nomor} {total} {jatuh_tempo} {bank} {rekening} {atas_nama}'}
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
            <b>Catatan otomatis:</b> Tanpa WhatsApp Business API, “otomatis” = sistem menyimpan jadwal + admin klik Kirim WA
            (atau integrasi cron nanti). Nomor rekening diambil dari <b>Nama & Logo</b>.
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setSchedOpen(false)}>Batal</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Menyimpan...' : 'Simpan jadwal'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
