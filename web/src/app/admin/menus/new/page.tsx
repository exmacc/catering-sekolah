'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { formatRupiah } from '@/lib/utils';

export default function NewMenuPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    available_date: '',
    order_deadline: '',
    publish_now: true,
  });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/catalog').then((r) => r.json()).then((res) => {
      if (res.success) setCatalog((res.data || []).filter((i: any) => i.is_available));
    });
  }, []);

  function addFromCatalog(item: any) {
    if (items.some((i) => i.catalog_item_id === item.id)) return;
    setItems([
      ...items,
      {
        catalog_item_id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category?.name?.toLowerCase().includes('minum') ? 'drink' : 'food',
        category_id: item.category_id || null,
      },
    ]);
  }

  function addManual() {
    setItems([...items, { name: '', description: '', price: 0, category: 'food' }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: any) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError('Tambah minimal 1 item menu');
      return;
    }
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
        items: items.map((i) => ({
          name: i.name,
          description: i.description,
          price: Number(i.price) || 0,
          category: i.category === 'drink' ? 'drink' : 'food',
        })),
        created_by: user?.id,
      }),
    });

    const result = await res.json();
    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Gagal membuat menu');
      return;
    }

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
        <h1 className="page-title">Buat menu harian</h1>
        <p className="page-sub">Pilih dari Daftar Menu master, atau tambah manual, lalu publish ke customer</p>
      </div>

      <section className="card p-5">
        <h2 className="mb-2 font-bold text-slate-900">Alur singkat</h2>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Isi master di <b>Kategori</b> + <b>Daftar Menu</b> (harga tetap)</li>
          <li>Buat <b>Menu Harian</b> (tanggal saji) dari item master</li>
          <li>Publish → customer lihat di beranda / link WA</li>
        </ol>
      </section>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="card space-y-4 p-5">
          <h2 className="font-bold text-slate-900">1) Info menu harian</h2>
          <div>
            <label className="label">Nama menu</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" placeholder="Menu Senin, 28 Juli 2026" required />
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="field" rows={2} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Tanggal saji</label>
              <input type="date" value={form.available_date} onChange={(e) => setForm({ ...form, available_date: e.target.value })} className="field" required />
            </div>
            <div>
              <label className="label">Batas pemesanan</label>
              <input type="datetime-local" value={form.order_deadline} onChange={(e) => setForm({ ...form, order_deadline: e.target.value })} className="field" />
            </div>
          </div>
        </section>

        {catalog.length > 0 && (
          <section className="card p-5">
            <h2 className="mb-3 font-bold text-slate-900">2a) Pilih dari Daftar Menu master</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {catalog.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addFromCatalog(item)}
                  className="rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-3 text-left hover:bg-violet-50"
                >
                  <div className="font-semibold text-slate-800">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.category?.name || 'Tanpa kategori'} · {formatRupiah(item.price)}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">2b) Item yang akan dipublish</h2>
            <button type="button" onClick={addManual} className="btn btn-secondary !px-3 !py-2 text-sm">+ Manual</button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada item. Pilih dari master atau tambah manual.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="rounded-2xl border border-violet-100 p-4">
                  <div className="mb-3 flex justify-between">
                    <div className="text-sm font-semibold text-slate-700">Item #{index + 1}</div>
                    <button type="button" onClick={() => removeItem(index)} className="text-sm text-red-500">Hapus</button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="md:col-span-2">
                      <label className="label">Nama</label>
                      <input className="field" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} required />
                    </div>
                    <div>
                      <label className="label">Tipe</label>
                      <select className="field" value={item.category} onChange={(e) => updateItem(index, 'category', e.target.value)}>
                        <option value="food">Makanan</option>
                        <option value="drink">Minuman</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Harga</label>
                      <input type="number" className="field" value={item.price || ''} onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)} min={0} required />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card p-5">
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
            <input type="checkbox" checked={form.publish_now} onChange={(e) => setForm({ ...form, publish_now: e.target.checked })} className="mt-1 accent-violet-600" />
            <div>
              <div className="font-semibold text-slate-800">Publish sekarang</div>
              <div className="text-sm text-slate-500">Langsung tampil di beranda customer</div>
            </div>
          </label>
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Menyimpan...' : form.publish_now ? 'Simpan & publish' : 'Simpan draft'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
