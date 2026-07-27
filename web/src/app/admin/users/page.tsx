'use client';

import { useEffect, useState } from 'react';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ActionIcon } from '@/components/ui/ActionIcon';

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'customer';
  is_active: boolean;
  created_at?: string;
  customer?: {
    customer_type?: 'parent' | 'teacher';
    child_name?: string;
    child_class?: string;
    notes?: string;
  };
}

const emptyForm = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'customer' as 'admin' | 'customer',
  customer_type: 'parent' as 'parent' | 'teacher',
  child_name: '',
  child_class: '',
  notes: '',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'admin' | 'customer'>('all');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    setLoading(true);
    const qs = filter === 'all' ? '' : `?role=${filter}`;
    const res = await fetch(`/api/users${qs}`);
    const result = await res.json();
    if (result.success) setUsers(result.data || []);
    else setError(result.error || 'Gagal memuat user');
    setLoading(false);
  }

  function openCreate() {
    setForm(emptyForm);
    setError('');
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload: any = {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      phone: form.phone || null,
      role: form.role,
    };

    if (form.role === 'customer') {
      payload.customer_type = form.customer_type;
      payload.child_name = form.child_name;
      payload.child_class = form.child_class;
      payload.notes = form.notes;
    }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    setSaving(false);

    if (!result.success) {
      setError(result.error || 'Gagal menambah user');
      return;
    }

    setOpen(false);
    setForm(emptyForm);
    load();
  }

  async function toggleActive(user: UserRow) {
    await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    load();
  }

  async function deactivate(user: UserRow) {
    if (!confirm(`Nonaktifkan akun ${user.full_name}?`)) return;
    await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
    load();
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-blue-600">Pengaturan → Kelola User</p>
          <h1 className="page-title">Kelola User</h1>
          <p className="page-sub">Tambah admin / customer (email + password). Customer juga bisa daftar sendiri.</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          + Tambah user
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          { id: 'all', label: 'Semua' },
          { id: 'admin', label: 'Admin' },
          { id: 'customer', label: 'Customer' },
        ] as const).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`btn !px-3 !py-1.5 text-sm ${filter === f.id ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && !open && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
              <th>Detail</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="font-semibold text-slate-800">{u.full_name}</div>
                  {u.phone && <div className="text-xs text-slate-500">{u.phone}</div>}
                </td>
                <td className="text-slate-600">{u.email}</td>
                <td>
                  <Badge tone={u.role === 'admin' ? 'info' : 'success'}>
                    {u.role === 'admin' ? 'Admin' : 'Customer'}
                  </Badge>
                </td>
                <td className="text-sm text-slate-600">
                  {u.role === 'customer' ? (
                    u.customer?.customer_type === 'parent' ? (
                      <span>
                        Ortu · {u.customer.child_name} ({u.customer.child_class})
                      </span>
                    ) : (
                      <span>Guru{u.customer?.notes ? ` · ${u.customer.notes}` : ''}</span>
                    )
                  ) : (
                    'Administrator'
                  )}
                </td>
                <td>
                  <Badge tone={u.is_active ? 'success' : 'gray'}>{u.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                </td>
                <td>
                  <div className="inline-flex gap-1.5">
                    <ActionIcon
                      icon={u.is_active ? 'eyeOff' : 'eye'}
                      label={u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      tone={u.is_active ? 'warning' : 'success'}
                      onClick={() => toggleActive(u)}
                    />
                    {u.is_active && (
                      <ActionIcon icon="trash" label="Nonaktifkan" tone="danger" onClick={() => deactivate(u)} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="p-8 text-center text-slate-500">Belum ada user</div>}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tambah user" wide>
        <form onSubmit={save} className="space-y-4">
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div>
            <label className="label">Tipe akun</label>
            <div className="grid grid-cols-2 gap-2">
              {(['customer', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm({ ...form, role: r })}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                    form.role === r ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {r === 'admin' ? 'Admin' : 'Customer'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Nama lengkap</label>
              <input className="field" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="nama@email.com" />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="Min. 6 karakter" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">No. WhatsApp</label>
              <input className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xxxxxxxxxx" />
            </div>
          </div>

          {form.role === 'customer' && (
            <>
              <div>
                <label className="label">Tipe customer</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['parent', 'teacher'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, customer_type: t })}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                        form.customer_type === t ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {t === 'parent' ? 'Orang Tua' : 'Guru'}
                    </button>
                  ))}
                </div>
              </div>
              {form.customer_type === 'parent' ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Nama anak</label>
                    <input className="field" value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Kelas</label>
                    <input className="field" value={form.child_class} onChange={(e) => setForm({ ...form, child_class: e.target.value })} required placeholder="5A" />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label">Catatan (opsional)</label>
                  <input className="field" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Mata pelajaran, dll" />
                </div>
              )}
            </>
          )}

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
            Login memakai <b>email + password</b>. Tidak perlu verifikasi email (langsung aktif).
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>
              Batal
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Menyimpan...' : 'Simpan user'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
