'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function NewMenuPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    description: '',
    available_date: '',
    order_deadline: '',
    publish_now: true,
  });
  const [items, setItems] = useState([
    { name: '', description: '', price: 0, category: 'food' as 'food' | 'drink' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addItem(category: 'food' | 'drink' = 'food') {
    setItems([...items, { name: '', description: '', price: 0, category }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: any) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        available_date: form.available_date,
        order_deadline: form.order_deadline || null,
        items,
        created_by: user?.id,
      }),
    });

    const result = await res.json();
    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Gagal membuat menu');
      return;
    }

    // Default API creates as active; if user unchecks publish, close it
    if (!form.publish_now && result.data?.id) {
      await fetch(`/api/menus/${result.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
    }

    setLoading(false);
    router.push('/admin/menus');
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Buat menu baru</h1>
        <p className="page-sub">Siapkan menu H-1, pilih kategori item, lalu publish</p>
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-900">Panduan singkat</h2>
        <div className="space-y-2 text-sm text-slate-600">
          <p>1. <b>Menu</b> = paket harian (contoh: “Menu Senin, 28 Jul 2026”).</p>
          <p>2. <b>Item</b> = makanan/minuman di dalam menu (Nasi Goreng, Es Teh, dll).</p>
          <p>3. <b>Kategori item</b> = pilih <b>Makanan</b> atau <b>Minuman</b> per item.</p>
          <p>4. Centang <b>Publish sekarang</b> agar langsung tampil di customer.</p>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="card space-y-4 p-5">
          <h2 className="font-bold text-slate-900">1) Informasi menu harian</h2>
          <div>
            <label className="label">Nama menu</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field"
              placeholder="Menu Senin, 28 Juli 2026"
              required
            />
          </div>
          <div>
            <label className="label">Deskripsi (opsional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="field"
              rows={2}
              placeholder="Menu sehat untuk siswa"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Tanggal saji (untuk customer)</label>
              <input
                type="date"
                value={form.available_date}
                onChange={(e) => setForm({ ...form, available_date: e.target.value })}
                className="field"
                required
              />
            </div>
            <div>
              <label className="label">Batas pemesanan (opsional)</label>
              <input
                type="datetime-local"
                value={form.order_deadline}
                onChange={(e) => setForm({ ...form, order_deadline: e.target.value })}
                className="field"
              />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">2) Item + kategori</h2>
              <p className="text-sm text-slate-500">Tambah makanan/minuman yang bisa dipesan</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => addItem('food')} className="btn btn-secondary !px-3 !py-2 text-sm">
                + Makanan
              </button>
              <button type="button" onClick={() => addItem('drink')} className="btn btn-secondary !px-3 !py-2 text-sm">
                + Minuman
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="rounded-2xl border border-violet-100 bg-violet-50/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700">
                    Item #{index + 1} · {item.category === 'food' ? 'Makanan' : 'Minuman'}
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-sm text-red-500 hover:underline">
                      Hapus
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="md:col-span-2">
                    <label className="label">Nama item</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="field"
                      placeholder={item.category === 'food' ? 'Nasi Goreng' : 'Es Teh'}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Kategori</label>
                    <select
                      value={item.category}
                      onChange={(e) => updateItem(index, 'category', e.target.value)}
                      className="field"
                    >
                      <option value="food">Makanan</option>
                      <option value="drink">Minuman</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Harga (Rp)</label>
                    <input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)}
                      className="field"
                      required
                      min={0}
                      placeholder="15000"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-bold text-slate-900">3) Publish ke customer</h2>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
            <input
              type="checkbox"
              checked={form.publish_now}
              onChange={(e) => setForm({ ...form, publish_now: e.target.checked })}
              className="mt-1 accent-violet-600"
            />
            <div>
              <div className="font-semibold text-slate-800">Publish sekarang (status Aktif)</div>
              <div className="text-sm text-slate-500">
                Jika dicentang, menu langsung tampil di beranda customer dan bisa dipesan. Jika tidak, simpan dulu sebagai draft (Ditutup), publish nanti dari daftar menu.
              </div>
            </div>
          </label>
        </section>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Menyimpan...' : form.publish_now ? 'Simpan & publish' : 'Simpan draft'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
