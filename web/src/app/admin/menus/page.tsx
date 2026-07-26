'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => { fetchMenus(); }, []);

  async function fetchMenus() {
    const res = await fetch('/api/menus');
    const result = await res.json();
    if (result.success) setMenus(result.data || []);
    setLoading(false);
  }

  async function setStatus(id: string, status: 'active' | 'closed') {
    setBusyId(id);
    await fetch(`/api/menus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchMenus();
    setBusyId(null);
  }

  async function copyCustomerLink(menuId: string) {
    const url = `${window.location.origin}/order/${menuId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(menuId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt('Salin link ini untuk dikirim ke customer:', url);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Menu catering</h1>
          <p className="page-sub">Buat menu H-1 → publish → kirim link ke customer</p>
        </div>
        <Link href="/admin/menus/new" className="btn btn-primary">+ Buat menu baru</Link>
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-900">Cara publish ke customer</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="guide-step">
            <div className="guide-num">1</div>
            <div>
              <div className="font-semibold text-slate-800">Buat menu</div>
              <div className="text-sm text-slate-500">Isi tanggal saji + item (makanan/minuman) + harga</div>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-num">2</div>
            <div>
              <div className="font-semibold text-slate-800">Publish (Aktifkan)</div>
              <div className="text-sm text-slate-500">Status harus <b>Aktif</b> agar tampil di beranda customer</div>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-num">3</div>
            <div>
              <div className="font-semibold text-slate-800">Kirim link</div>
              <div className="text-sm text-slate-500">Salin link menu, kirim via WhatsApp ke orang tua/guru</div>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">
          <b>Catatan:</b> Kategori item saat ini = <b>Makanan</b> atau <b>Minuman</b> (dipilih saat menambah item di form menu). Tidak perlu menu terpisah untuk “kategori”.
        </div>
      </section>

      {menus.length === 0 ? (
        <EmptyState
          title="Belum ada menu"
          description="Buat menu pertama, lalu publish agar customer bisa pesan."
          action={<Link href="/admin/menus/new" className="btn btn-primary">Buat menu pertama</Link>}
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
                  {menu.description && <p className="mt-2 text-sm text-slate-600">{menu.description}</p>}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/menus/${menu.id}`} className="btn btn-secondary !px-3 !py-2 text-sm">Edit</Link>

                  {menu.status === 'active' ? (
                    <button
                      onClick={() => setStatus(menu.id, 'closed')}
                      disabled={busyId === menu.id}
                      className="btn btn-secondary !px-3 !py-2 text-sm"
                    >
                      {busyId === menu.id ? '...' : 'Tutup publish'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setStatus(menu.id, 'active')}
                      disabled={busyId === menu.id}
                      className="btn btn-primary !px-3 !py-2 text-sm"
                    >
                      {busyId === menu.id ? '...' : 'Publish ke customer'}
                    </button>
                  )}

                  <button onClick={() => copyCustomerLink(menu.id)} className="btn btn-secondary !px-3 !py-2 text-sm">
                    {copiedId === menu.id ? 'Link disalin ✓' : 'Salin link customer'}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {menu.items?.map((item) => (
                  <div key={item.id} className="item-pill">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.category === 'food' ? 'Kategori: Makanan' : 'Kategori: Minuman'}</div>
                    </div>
                    <div className="text-sm font-bold text-violet-700">{formatRupiah(item.price)}</div>
                  </div>
                ))}
              </div>

              {menu.status === 'active' && (
                <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50/70 px-3 py-2 text-xs text-violet-800">
                  Link customer: <span className="font-mono">/order/{menu.id}</span> — atau bagikan beranda <span className="font-mono">/</span>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
