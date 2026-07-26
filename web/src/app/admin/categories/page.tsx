'use client';

import { useEffect, useState } from 'react';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';

interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '', sort_order: 0 });
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/categories');
    const result = await res.json();
    if (result.success) setItems(result.data || []);
    else setError(result.error || 'Gagal memuat. Pastikan migration SQL sudah dijalankan.');
    setLoading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const res = await fetch(editing ? `/api/categories/${editing.id}` : '/api/categories', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { ...form, is_active: editing.is_active } : form),
    });
    const result = await res.json();
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Gagal simpan');
      return;
    }

    setForm({ name: '', description: '', sort_order: 0 });
    setEditing(null);
    load();
  }

  async function toggleActive(item: Category) {
    await fetch(`/api/categories/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !item.is_active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm('Hapus kategori ini?')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Kategori</h1>
        <p className="page-sub">CRUD kategori untuk mengelompokkan daftar menu (Makanan, Minuman, Snack, dll)</p>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={save} className="card space-y-4 p-5">
        <h2 className="font-bold text-slate-900">{editing ? 'Edit kategori' : 'Tambah kategori'}</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="label">Nama kategori</label>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Snack" required />
          </div>
          <div>
            <label className="label">Urutan</label>
            <input type="number" className="field" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="label">Deskripsi</label>
            <input className="field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opsional" />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Menyimpan...' : editing ? 'Update' : 'Tambah'}</button>
          {editing && (
            <button type="button" className="btn btn-secondary" onClick={() => { setEditing(null); setForm({ name: '', description: '', sort_order: 0 }); }}>
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Deskripsi</th>
              <th>Urutan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="font-semibold text-slate-800">{item.name}</td>
                <td className="text-slate-600">{item.description || '-'}</td>
                <td>{item.sort_order}</td>
                <td>
                  <Badge tone={item.is_active ? 'success' : 'gray'}>{item.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-secondary !px-3 !py-1.5 text-sm" onClick={() => { setEditing(item); setForm({ name: item.name, description: item.description || '', sort_order: item.sort_order || 0 }); }}>Edit</button>
                    <button className="btn btn-secondary !px-3 !py-1.5 text-sm" onClick={() => toggleActive(item)}>{item.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                    <button className="btn btn-danger !px-3 !py-1.5 text-sm" onClick={() => remove(item.id)}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="p-8 text-center text-slate-500">Belum ada kategori</div>}
      </div>
    </div>
  );
}
