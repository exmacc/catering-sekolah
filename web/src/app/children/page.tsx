'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { ActionIcon } from '@/components/ui/ActionIcon';

interface Child {
  id: string;
  name: string;
  class_name: string;
  is_active: boolean;
}

export default function ChildrenPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Child | null>(null);
  const [form, setForm] = useState({ name: '', class_name: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isParent = user?.customer?.customer_type === 'parent' || user?.role === 'customer';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login?next=/children');
      return;
    }
    if (user.role === 'admin') {
      router.push('/admin');
      return;
    }
    load();
  }, [user, authLoading]);

  async function load() {
    if (!user) return;
    setLoading(true);
    const res = await fetch(`/api/children?customer_id=${user.id}`);
    const result = await res.json();
    if (result.success) setChildren(result.data || []);
    else setError(result.error || 'Gagal memuat data anak. Jalankan SQL Setup DB (tabel children).');
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', class_name: '' });
    setError('');
    setOpen(true);
  }

  function openEdit(child: Child) {
    setEditing(child);
    setForm({ name: child.name, class_name: child.class_name });
    setError('');
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');

    const res = await fetch(editing ? `/api/children/${editing.id}` : '/api/children', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: user.id,
        name: form.name.trim(),
        class_name: form.class_name.trim(),
      }),
    });
    const result = await res.json();
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Gagal simpan');
      return;
    }

    setOpen(false);
    load();
  }

  async function remove(child: Child) {
    if (!confirm(`Hapus ${child.name} dari daftar anak?`)) return;
    await fetch(`/api/children/${child.id}`, { method: 'DELETE' });
    load();
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <CustomerHeader />
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <CustomerHeader />
      <main className="shell py-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="page-title">Data anak</h1>
            <p className="page-sub">Tambah / edit anak. Saat pesan, pilih anak mana yang dipesankan.</p>
          </div>
          <button type="button" onClick={openCreate} className="btn btn-primary">
            + Tambah anak
          </button>
        </div>

        {error && !open && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {children.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="mb-2 text-3xl">👶</div>
            <div className="font-bold text-slate-900">Belum ada data anak</div>
            <p className="mt-1 text-sm text-slate-500">Tambah minimal 1 anak sebelum memesan.</p>
            <button type="button" onClick={openCreate} className="btn btn-primary mt-4">
              Tambah anak
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {children.map((child) => (
              <div key={child.id} className="card flex items-center justify-between gap-3 p-4">
                <div>
                  <div className="font-bold text-slate-900">{child.name}</div>
                  <div className="text-sm text-slate-500">Kelas {child.class_name}</div>
                </div>
                <div className="flex gap-1.5">
                  <ActionIcon icon="edit" label="Edit" onClick={() => openEdit(child)} />
                  <ActionIcon icon="trash" label="Hapus" tone="danger" onClick={() => remove(child)} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:underline">
            ← Kembali ke beranda
          </Link>
        </div>
      </main>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit anak' : 'Tambah anak'}>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <div>
            <label className="label">Nama anak</label>
            <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Kelas</label>
            <input
              className="field"
              value={form.class_name}
              onChange={(e) => setForm({ ...form, class_name: e.target.value })}
              required
              placeholder="Contoh: 4 Syam / 5A"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
