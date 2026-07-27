'use client';

import { useEffect, useState, useRef } from 'react';
import { formatRupiah } from '@/lib/utils';
import { fileToDataUrl } from '@/lib/image';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ActionIcon } from '@/components/ui/ActionIcon';

interface Category { id: string; name: string }
interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  is_available: boolean;
  image_url?: string | null;
  category?: Category;
}

const emptyForm = {
  name: '',
  description: '',
  price: 0,
  category_id: '',
  is_available: true,
  image_url: null as string | null,
};

export default function AdminCatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

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

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, category_id: filterCat || '' });
    setError('');
    setOpen(true);
  }

  function openEdit(item: CatalogItem) {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      category_id: item.category_id || '',
      is_available: item.is_available,
      image_url: item.image_url || null,
    });
    setError('');
    setOpen(true);
  }

  async function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setError('');
      const dataUrl = await fileToDataUrl(file);
      setForm((f) => ({ ...f, image_url: dataUrl }));
    } catch (err: any) {
      setError(err.message || 'Gagal memproses gambar');
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      category_id: form.category_id || null,
      price: Number(form.price) || 0,
      image_url: form.image_url,
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
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    if (fileRef.current) fileRef.current.value = '';
    load();
  }

  async function remove(id: string) {
    if (!confirm('Hapus item menu ini?')) return;
    await fetch(`/api/catalog/${id}`, { method: 'DELETE' });
    load();
  }

  const filtered = filterCat ? items.filter((i) => i.category_id === filterCat) : items;

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Menu Catering → Daftar Menu</p>
          <h1 className="page-title">Daftar Menu</h1>
          <p className="page-sub">Master item per kategori + harga + foto. Belum terkait hari publish.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">+ Tambah menu</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setFilterCat('')} className={`btn !px-3 !py-1.5 text-sm ${!filterCat ? 'btn-primary' : 'btn-secondary'}`}>Semua</button>
        {categories.map((c) => (
          <button key={c.id} type="button" onClick={() => setFilterCat(c.id)} className={`btn !px-3 !py-1.5 text-sm ${filterCat === c.id ? 'btn-primary' : 'btn-secondary'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {error && !open && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nama</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-blue-50">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg text-blue-300">🍽️</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="font-semibold text-slate-800">{item.name}</div>
                  {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                </td>
                <td>{item.category?.name || '-'}</td>
                <td className="font-bold text-blue-600">{formatRupiah(item.price)}</td>
                <td><Badge tone={item.is_available ? 'success' : 'gray'}>{item.is_available ? 'Tersedia' : 'Nonaktif'}</Badge></td>
                <td>
                  <div className="flex gap-1.5">
                    <ActionIcon icon="edit" label="Edit" onClick={() => openEdit(item)} />
                    <ActionIcon icon="trash" label="Hapus" tone="danger" onClick={() => remove(item.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Belum ada item. Buat kategori dulu, lalu klik + Tambah menu.
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit menu' : 'Tambah menu'} wide>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Nama</label>
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nasi Goreng" required />
            </div>
            <div>
              <label className="label">Kategori</label>
              <select className="field" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} required>
                <option value="">— pilih kategori —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Harga (Rp)</label>
              <input type="number" className="field" value={form.price || ''} onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })} min={0} required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Deskripsi</label>
              <input className="field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="label">Foto menu</label>
            <div className="flex flex-wrap items-start gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
                {form.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl text-blue-300">🍽️</div>
                )}
              </div>
              <div className="space-y-2">
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onImageChange} className="text-sm" />
                {form.image_url && (
                  <button type="button" className="btn btn-danger !px-3 !py-1.5 text-sm" onClick={() => { setForm((f) => ({ ...f, image_url: null })); if (fileRef.current) fileRef.current.value = ''; }}>
                    Hapus foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="accent-blue-600" />
            Tersedia untuk dipilih saat publish harian
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Batal</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Menyimpan...' : editing ? 'Update' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
