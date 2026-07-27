'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { Loading } from '@/components/ui/Loading';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { branding, refreshBranding, setBrandingLocal } = useBranding();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    business_name: '',
    tagline: '',
    logo_url: '' as string | null,
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/settings');
    const result = await res.json();
    if (result.success && result.data) {
      setForm({
        business_name: result.data.business_name || 'Catering Sekolah',
        tagline: result.data.tagline || '',
        logo_url: result.data.logo_url || null,
        bank_name: result.data.bank_name || '',
        bank_account_number: result.data.bank_account_number || '',
        bank_account_name: result.data.bank_account_name || '',
      });
      if (result.warning) {
        setError('Tabel pengaturan belum ada. Jalankan SQL di Setup DB dulu, lalu refresh.');
      }
    }
    setLoading(false);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('File harus gambar (PNG/JPG/WebP)');
      return;
    }
    if (file.size > 500 * 1024) {
      setError('Logo maks 500KB. Kompres gambar dulu.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, logo_url: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: form.business_name,
        tagline: form.tagline,
        logo_url: form.logo_url,
        bank_name: form.bank_name,
        bank_account_number: form.bank_account_number,
        bank_account_name: form.bank_account_name,
        updated_by: user?.id,
      }),
    });
    const result = await res.json();
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Gagal menyimpan. Jika error kolom bank, jalankan SQL di Setup DB.');
      return;
    }

    const next = {
      business_name: result.data.business_name,
      tagline: result.data.tagline || '',
      logo_url: result.data.logo_url || null,
      bank_name: result.data.bank_name || '',
      bank_account_number: result.data.bank_account_number || '',
      bank_account_name: result.data.bank_account_name || '',
    };
    setBrandingLocal(next);
    await refreshBranding();
    setMessage('Tersimpan. Nama, logo, dan rekening sudah update di web customer.');
  }

  function removeLogo() {
    setForm((f) => ({ ...f, logo_url: null }));
    if (fileRef.current) fileRef.current.value = '';
  }

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-600">Pengaturan → Nama & Logo</p>
        <h1 className="page-title">Nama, Logo & Rekening</h1>
        <p className="page-sub">Branding + no. rekening transfer — tampil di web customer saat pilih bayar transfer</p>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">{message}</div>}

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-900">Preview header</h2>
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4">
          {form.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="Logo" className="h-12 w-12 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 text-xl text-white">🍱</div>
          )}
          <div>
            <div className="font-extrabold text-slate-900">{form.business_name || 'Nama catering'}</div>
            <div className="text-xs text-slate-500">{form.tagline || 'Tagline'}</div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Live: <b>{branding.business_name}</b></p>
      </section>

      <form onSubmit={save} className="card space-y-4 p-5">
        <div>
          <label className="label">Nama catering</label>
          <input
            className="field"
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            placeholder="Contoh: Catering Alasha"
            required
            maxLength={80}
          />
        </div>

        <div>
          <label className="label">Tagline (opsional)</label>
          <input
            className="field"
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            placeholder="Pesan mudah • Bayar fleksibel"
            maxLength={100}
          />
        </div>

        <div>
          <label className="label">Logo</label>
          <div className="flex flex-wrap items-center gap-3">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={onFileChange} className="text-sm" />
            {form.logo_url && (
              <button type="button" onClick={removeLogo} className="btn btn-danger !px-3 !py-2 text-sm">
                Hapus logo
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">PNG/JPG/WebP, maks 500KB.</p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="mb-3 font-bold text-slate-900">Rekening transfer</h3>
          <p className="mb-3 text-xs text-slate-500">
            Info ini muncul di halaman pesan saat customer pilih <b>Transfer</b>, dan di riwayat pesanan.
          </p>
          <div className="space-y-3">
            <div>
              <label className="label">Nama bank</label>
              <input
                className="field"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                placeholder="Contoh: BCA / BRI / Mandiri"
              />
            </div>
            <div>
              <label className="label">Nomor rekening</label>
              <input
                className="field"
                value={form.bank_account_number}
                onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })}
                placeholder="Contoh: 1234567890"
              />
            </div>
            <div>
              <label className="label">Atas nama</label>
              <input
                className="field"
                value={form.bank_account_name}
                onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })}
                placeholder="Contoh: Bu Ani"
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Menyimpan...' : 'Simpan perubahan'}
        </button>
      </form>

      <section className="card border-amber-100 bg-amber-50/50 p-5 text-sm text-amber-950">
        <b>Jika error kolom bank:</b> buka <a href="/admin/setup" className="font-semibold text-blue-700 underline">Setup DB</a>,
        salin SQL terbaru (termasuk kolom rekening), lalu simpan lagi.
      </section>
    </div>
  );
}
