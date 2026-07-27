'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';

interface CatalogItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  is_available: boolean;
  image_url?: string | null;
  category?: { id: string; name: string };
}

export default function AdminMenusPage() {
  const { user } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    available_date: '',
    publish_now: true,
  });
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [mRes, cRes] = await Promise.all([fetch('/api/menus'), fetch('/api/catalog')]);
    const [mData, cData] = await Promise.all([mRes.json(), cRes.json()]);
    if (mData.success) setMenus(mData.data || []);
    if (cData.success) setCatalog((cData.data || []).filter((i: CatalogItem) => i.is_available));
    setLoading(false);
  }

  const groupedCatalog = useMemo(() => {
    const map = new Map<string, CatalogItem[]>();
    for (const item of catalog) {
      const key = item.category?.name || 'Tanpa kategori';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [catalog]);

  function customerUrl(menuId: string) {
    if (typeof window === 'undefined') return `/order/${menuId}`;
    return `${window.location.origin}/order/${menuId}`;
  }

  function openCreate() {
    const today = new Date().toISOString().split('T')[0];
    setForm({
      name: `Menu ${formatDateShort(today)}`,
      description: '',
      available_date: today,
      publish_now: true,
    });
    setSelected({});
    setError('');
    setOpen(true);
  }

  function toggleItem(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function savePublish(e: React.FormEvent) {
    e.preventDefault();
    const picked = catalog.filter((c) => selected[c.id]);
    if (!form.available_date) {
      setError('Tanggal saji wajib diisi');
      return;
    }
    if (picked.length === 0) {
      setError('Pilih minimal 1 menu dari daftar master');
      return;
    }

    setSaving(true);
    setError('');

    const name = form.name.trim() || `Menu ${formatDateShort(form.available_date)}`;
    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description: form.description,
        available_date: form.available_date,
        created_by: user?.id,
        items: picked.map((i) => ({
          name: i.name,
          description: i.description,
          price: i.price,
          category: i.category?.name?.toLowerCase().includes('minum') ? 'drink' : 'food',
          image_url: i.image_url || null,
          catalog_item_id: i.id,
        })),
      }),
    });
    const result = await res.json();
    if (!result.success) {
      setSaving(false);
      setError(result.error || 'Gagal publish');
      return;
    }

    if (!form.publish_now && result.data?.id) {
      await fetch(`/api/menus/${result.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });
    }

    setSaving(false);
    setOpen(false);
    loadAll();
  }

  async function setStatus(id: string, status: 'active' | 'closed') {
    setBusyId(id);
    await fetch(`/api/menus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await loadAll();
    setBusyId(null);
  }

  async function copyCustomerLink(menu: Menu) {
    const url = customerUrl(menu.id);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(menu.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt('Salin link ini:', url);
    }
  }

  function shareWhatsApp(menu: Menu) {
    const url = customerUrl(menu.id);
    const text = `Halo, silakan pesan catering:\n*${menu.name}*\nTanggal saji: ${formatDateShort(menu.available_date)}\n\nBuka link ini:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Publish Harian</h1>
          <p className="page-sub">Pilih tanggal + menu master yang sudah ada, lalu publish ke customer</p>
        </div>
        <button type="button" onClick={openCreate} className="btn btn-primary">+ Publish menu hari</button>
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-900">Alur yang benar</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="guide-step"><div className="guide-num">1</div><div><div className="font-semibold text-slate-800">Buat kategori</div><div className="text-sm text-slate-500">Menu Catering → Kategori</div></div></div>
          <div className="guide-step"><div className="guide-num">2</div><div><div className="font-semibold text-slate-800">Isi daftar menu</div><div className="text-sm text-slate-500">Menu + harga + foto per kategori</div></div></div>
          <div className="guide-step"><div className="guide-num">3</div><div><div className="font-semibold text-slate-800">Publish harian</div><div className="text-sm text-slate-500">Pilih tanggal & menu yang mau dijual</div></div></div>
          <div className="guide-step"><div className="guide-num">4</div><div><div className="font-semibold text-slate-800">Kirim link</div><div className="text-sm text-slate-500">Salin / WA ke customer</div></div></div>
        </div>
      </section>

      {menus.length === 0 ? (
        <EmptyState
          title="Belum ada publish harian"
          description="Pastikan Daftar Menu sudah terisi, lalu publish untuk tanggal tertentu."
          action={<button type="button" onClick={openCreate} className="btn btn-primary">Publish menu hari</button>}
        />
      ) : (
        <div className="space-y-4">
          {menus.map((menu) => (
            <article key={menu.id} className="card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{menu.name}</h3>
                    <Badge tone={menu.status === 'active' ? 'success' : menu.status === 'closed' ? 'warning' : 'danger'}>
                      {menu.status === 'active' ? 'Aktif (Published)' : menu.status === 'closed' ? 'Ditutup' : 'Dibatalkan'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">Tanggal saji: {formatDateShort(menu.available_date)}</p>
                  {menu.status === 'active' && (
                    <div className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">/order/{menu.id}</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {menu.status === 'active' ? (
                    <button onClick={() => setStatus(menu.id, 'closed')} disabled={busyId === menu.id} className="btn btn-secondary !px-3 !py-2 text-sm">
                      {busyId === menu.id ? '...' : 'Tutup publish'}
                    </button>
                  ) : (
                    <button onClick={() => setStatus(menu.id, 'active')} disabled={busyId === menu.id} className="btn btn-primary !px-3 !py-2 text-sm">
                      {busyId === menu.id ? '...' : 'Publish'}
                    </button>
                  )}
                  <button onClick={() => copyCustomerLink(menu)} className="btn btn-secondary !px-3 !py-2 text-sm" disabled={menu.status !== 'active'}>
                    {copiedId === menu.id ? 'Link disalin ✓' : 'Salin link'}
                  </button>
                  <button onClick={() => shareWhatsApp(menu)} className="btn btn-primary !px-3 !py-2 text-sm" disabled={menu.status !== 'active'}>
                    Kirim WA
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {menu.items?.map((item) => (
                  <div key={item.id} className="item-pill">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-blue-50">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-blue-300">🍽️</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800">{item.name}</div>
                        <div className="text-[11px] text-slate-500">{item.category === 'food' ? 'Makanan' : 'Minuman'}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-blue-600">{formatRupiah(item.price)}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Publish menu untuk tanggal" wide>
        <form onSubmit={savePublish} className="space-y-4">
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Tanggal saji</label>
              <input
                type="date"
                className="field"
                value={form.available_date}
                onChange={(e) => {
                  const d = e.target.value;
                  setForm((f) => ({
                    ...f,
                    available_date: d,
                    name: f.name.startsWith('Menu ') || !f.name ? `Menu ${formatDateShort(d)}` : f.name,
                  }));
                }}
                required
              />
            </div>
            <div>
              <label className="label">Nama publish (opsional)</label>
              <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Menu Senin" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Catatan</label>
              <input className="field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="mb-2 font-semibold text-slate-900">Pilih menu dari master</div>
            {catalog.length === 0 ? (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Daftar Menu masih kosong. Isi dulu di <b>Menu Catering → Daftar Menu</b>.
              </div>
            ) : (
              <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
                {groupedCatalog.map(([catName, list]) => (
                  <div key={catName}>
                    <div className="mb-2 text-sm font-bold text-slate-700">{catName}</div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {list.map((item) => {
                        const checked = !!selected[item.id];
                        return (
                          <label
                            key={item.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${checked ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                          >
                            <input type="checkbox" checked={checked} onChange={() => toggleItem(item.id)} className="accent-blue-600" />
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-blue-50">
                              {item.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center text-blue-300">🍽️</div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-semibold text-slate-800">{item.name}</div>
                              <div className="text-xs text-blue-600">{formatRupiah(item.price)}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.publish_now} onChange={(e) => setForm({ ...form, publish_now: e.target.checked })} className="accent-blue-600" />
            Langsung aktif (tampil ke customer)
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Batal</button>
            <button type="submit" disabled={saving || catalog.length === 0} className="btn btn-primary">
              {saving ? 'Menyimpan...' : 'Simpan publish'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
