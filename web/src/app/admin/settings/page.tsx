'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { BrandLogo } from '@/components/BrandLogo';
import { Loading } from '@/components/ui/Loading';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { branding, refreshBranding, setBrandingLocal } = useBranding();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    business_name: '',
    tagline: '',
    logo_url: '' as string | null,
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
        updated_by: user?.id,
      }),
    });
    const result = await res.json();
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Gagal menyimpan');
      return;
    }

    const next = {
      business_name: result.data.business_name,
      tagline: result.data.tagline || '',
      logo_url: result.data.logo_url || null,
    };
    setBrandingLocal(next);
    await refreshBranding();
    setMessage('Tersimpan. Nama & logo sudah update di web customer.');
  }

  function removeLogo() {
    setForm((f) => ({ ...f, logo_url: null }));
    if (fileRef.current) fileRef.current.value = '';
  }

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Pengaturan branding</h1>
        <p className="page-sub">Ubah nama catering & logo — langsung tampil di web customer</p>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">{message}</div>}

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-900">Preview (seperti di header customer)</h2>
        <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white p-4">
          {form.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="Logo" className="h-12 w-12 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-xl text-white">🍱</div>
          )}
          <div>
            <div className="font-extrabold text-slate-900">{form.business_name || 'Nama catering'}</div>
            <div className="text-xs text-slate-500">{form.tagline || 'Tagline'}</div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Saat ini live: <b>{branding.business_name}</b></p>
      </section>

      <form onSubmit={save} className="card space-y-4 p-5">
        <div>
          <label className="label">Nama catering</label>
          <input
            className="field"
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            placeholder="Contoh: Dapur Bu Ani Catering"
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
          <p className="mt-2 text-xs text-slate-500">PNG/JPG/WebP, maks 500KB. Disarankan kotak 200×200 px.</p>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? 'Menyimpan...' : 'Simpan perubahan'}
        </button>
      </form>

      <section className="card border-amber-100 bg-amber-50/50 p-5 text-sm text-amber-950">
        <b>Jika error tabel belum ada:</b> buka <a href="/admin/setup" className="font-semibold text-violet-700 underline">Setup DB</a>,
        salin & jalankan SQL terbaru (termasuk tabel <code>app_settings</code>), lalu simpan lagi di sini.
      </section>
    </div>
  );
}
