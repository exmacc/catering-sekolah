'use client';

import { useEffect, useState } from 'react';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface Category {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

const emptyForm = { name: '', description: '', sort_order: 0 };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
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

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  }

  function openEdit(item: Category) {
    setEditing(item);
    setForm({ name: item.name, description: item.description || '', sort_order: item.sort_order || 0 });
    setError('');
    setOpen(true);
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

    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Menu Catering → Kategori</p>
          <h1 className="page-title">Kategori</h1>
          <p className="page-sub">Kelompokkan menu (Makanan, Minuman, Snack, dll). Belum terkait hari.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">+ Tambah kategori</button>
      </div>

      {error && !open && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

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
                    <button className="btn btn-secondary !px-3 !py-1.5 text-sm" onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn btn-secondary !px-3 !py-1.5 text-sm" onClick={() => toggleActive(item)}>{item.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                    <button className="btn btn-danger !px-3 !py-1.5 text-sm" onClick={() => remove(item.id)}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="p-8 text-center text-slate-500">Belum ada kategori. Klik + Tambah kategori.</div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit kategori' : 'Tambah kategori'}>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
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
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Batal</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Menyimpan...' : editing ? 'Update' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
