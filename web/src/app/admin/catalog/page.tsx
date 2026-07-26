'use client';

import { useEffect, useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';

interface Category { id: string; name: string }
interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  is_available: boolean;
  category?: Category;
}

export default function AdminCatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: 0, category_id: '', is_available: true });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [catRes, itemRes] = await Promise.all([fetch('/api/categories'), fetch('/api/catalog')]);
    const [catData, itemData] = await Promise.all([catRes.json(), itemRes.json()]);
    if (catData.success) setCategories(catData.data || []);
    if (itemData.success) setItems(itemData.data || []);
    if (!catData.success || !itemData.success) {
      setError(catData.error || itemData.error || 'Gagal memuat data. Jalankan migration SQL dulu.');
    }
    setLoading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      category_id: form.category_id || null,
      price: Number(form.price) || 0,
    };
    const res = await fetch(editing ? `/api/catalog/${editing.id}` : '/api/catalog', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    setSaving(false);
    if (!result.success) {
      setError(result.error || 'Gagal simpan');
      return;
    }
    setEditing(null);
    setForm({ name: '', description: '', price: 0, category_id: '', is_available: true });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Hapus item menu ini?')) return;
    await fetch(`/api/catalog/${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Daftar Menu (Master)</h1>
        <p className="page-sub">CRUD item makanan/minuman + harga. Nanti dipilih saat buat Menu Harian untuk customer.</p>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={save} className="card space-y-4 p-5">
        <h2 className="font-bold text-slate-900">{editing ? 'Edit item' : 'Tambah item menu'}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="label">Nama</label>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nasi Goreng" required />
          </div>
          <div>
            <label className="label">Kategori</label>
            <select className="field" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">— pilih kategori —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Harga (Rp)</label>
            <input type="number" className="field" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} min={0} required />
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <input className="field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="accent-violet-600" />
          Tersedia untuk dipilih
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Menyimpan...' : editing ? 'Update' : 'Tambah item'}</button>
          {editing && <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name: '', description: '', price: 0, category_id: '', is_available: true }); }}>Batal</button>}
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="font-semibold text-slate-800">{item.name}</div>
                  {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                </td>
                <td>{item.category?.name || '-'}</td>
                <td className="font-bold text-violet-700">{formatRupiah(item.price)}</td>
                <td><Badge tone={item.is_available ? 'success' : 'gray'}>{item.is_available ? 'Tersedia' : 'Nonaktif'}</Badge></td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-secondary !px-3 !py-1.5 text-sm"
                      onClick={() => {
                        setEditing(item);
                        setForm({
                          name: item.name,
                          description: item.description || '',
                          price: item.price,
                          category_id: item.category_id || '',
                          is_available: item.is_available,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btn-danger !px-3 !py-1.5 text-sm" onClick={() => remove(item.id)}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="p-8 text-center text-slate-500">Belum ada item. Tambah kategori dulu, lalu isi daftar menu.</div>}
      </div>
    </div>
  );
}
