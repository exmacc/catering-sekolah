'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditMenuPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', available_date: '', order_deadline: '', status: 'active' });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchMenu(); }, []);

  async function fetchMenu() {
    const res = await fetch(`/api/menus/${params.id}`);
    const result = await res.json();
    if (result.success && result.data) {
      const data = result.data;
      setForm({
        name: data.name,
        description: data.description || '',
        available_date: data.available_date,
        order_deadline: data.order_deadline || '',
        status: data.status,
      });
      setItems(data.items?.map((i: any) => ({ name: i.name, description: i.description || '', price: i.price, category: i.category })) || []);
    }
  }

  function addItem() { setItems([...items, { name: '', description: '', price: 0, category: 'food' }]); }
  function removeItem(index: number) { setItems(items.filter((_, i) => i !== index)); }
  function updateItem(index: number, field: string, value: any) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch(`/api/menus/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, items }),
    });
    const result = await res.json();
    setLoading(false);
    if (result.success) router.push('/admin/menus');
    else setError(result.error || 'Gagal update');
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Edit menu</h1>
        <p className="page-sub">Perbarui detail menu & item</p>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="card p-5 space-y-4">
          <h2 className="font-bold text-slate-900">Informasi menu</h2>
          <div>
            <label className="label">Nama menu</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" required />
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field" rows={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Tanggal tersedia</label>
              <input type="date" value={form.available_date} onChange={(e) => setForm({ ...form, available_date: e.target.value })} className="field" required />
            </div>
            <div>
              <label className="label">Batas pemesanan</label>
              <input type="datetime-local" value={form.order_deadline} onChange={(e) => setForm({ ...form, order_deadline: e.target.value })} className="field" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Item menu</h2>
            <button type="button" onClick={addItem} className="btn btn-secondary !py-2 !px-3 text-sm">+ Tambah item</button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700">Item #{index + 1}</div>
                  {items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-sm text-red-500 hover:underline">Hapus</button>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="label">Nama</label>
                    <input type="text" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} className="field" required />
                  </div>
                  <div>
                    <label className="label">Kategori</label>
                    <select value={item.category} onChange={(e) => updateItem(index, 'category', e.target.value)} className="field">
                      <option value="food">Makanan</option>
                      <option value="drink">Minuman</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Harga (Rp)</label>
                    <input type="number" value={item.price || ''} onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)} className="field" required min={0} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Menyimpan...' : 'Simpan perubahan'}</button>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
