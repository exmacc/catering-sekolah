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

  function customerUrl(menuId: string) {
    if (typeof window === 'undefined') return `/order/${menuId}`;
    return `${window.location.origin}/order/${menuId}`;
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
    const text = `Halo, silakan pesan catering sekolah:\n*${menu.name}*\nTanggal saji: ${formatDateShort(menu.available_date)}\n\nBuka link ini untuk pesan langsung:\n${url}\n\n(Login/daftar sekali saja, data tersimpan)`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title">Menu harian</h1>
          <p className="page-sub">Publish → salin/kirim link → customer pesan langsung</p>
        </div>
        <Link href="/admin/menus/new" className="btn btn-primary">+ Buat menu harian</Link>
      </div>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-900">Alur kirim link ke customer</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="guide-step">
            <div className="guide-num">1</div>
            <div>
              <div className="font-semibold text-slate-800">Buat menu harian</div>
              <div className="text-sm text-slate-500">Pilih item dari Daftar Menu master</div>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-num">2</div>
            <div>
              <div className="font-semibold text-slate-800">Publish</div>
              <div className="text-sm text-slate-500">Status harus Aktif</div>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-num">3</div>
            <div>
              <div className="font-semibold text-slate-800">Kirim link</div>
              <div className="text-sm text-slate-500">Salin atau bagikan via WhatsApp</div>
            </div>
          </div>
          <div className="guide-step">
            <div className="guide-num">4</div>
            <div>
              <div className="font-semibold text-slate-800">Customer pesan</div>
              <div className="text-sm text-slate-500">Buka link → pilih item → bayar</div>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Contoh link: <code className="rounded bg-white px-1.5 py-0.5 text-xs">https://catering-sekolah.vercel.app/order/ID-MENU</code>
          <br />
          Customer yang sudah pernah daftar cukup login; data anak/kelas tidak perlu diisi ulang.
        </div>
      </section>

      {menus.length === 0 ? (
        <EmptyState
          title="Belum ada menu harian"
          description="Buat menu harian dulu, publish, lalu kirim link ke orang tua/guru."
          action={<Link href="/admin/menus/new" className="btn btn-primary">Buat menu harian</Link>}
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
                  {menu.status === 'active' && (
                    <div className="mt-2 break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
                      /order/{menu.id}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/menus/${menu.id}`} className="btn btn-secondary !px-3 !py-2 text-sm">Edit</Link>

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
                    <div className="text-sm font-bold text-blue-700">{formatRupiah(item.price)}</div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
