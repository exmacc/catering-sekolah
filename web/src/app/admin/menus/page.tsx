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

  useEffect(() => { fetchMenus(); }, []);

  async function fetchMenus() {
    const res = await fetch('/api/menus');
    const result = await res.json();
    if (result.success) setMenus(result.data || []);
    setLoading(false);
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    await fetch(`/api/menus/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchMenus();
  }

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Menu catering</h1>
          <p className="page-sub">Siapkan menu harian & kelola item</p>
        </div>
        <Link href="/admin/menus/new" className="btn btn-primary">+ Buat menu</Link>
      </div>

      {menus.length === 0 ? (
        <EmptyState title="Belum ada menu" description="Buat menu pertama untuk customer." action={<Link href="/admin/menus/new" className="btn btn-primary">Buat menu</Link>} />
      ) : (
        <div className="space-y-4">
          {menus.map((menu) => (
            <article key={menu.id} className="card p-5">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900">{menu.name}</h3>
                    <Badge tone={menu.status === 'active' ? 'success' : menu.status === 'closed' ? 'warning' : 'danger'}>
                      {menu.status === 'active' ? 'Aktif' : menu.status === 'closed' ? 'Ditutup' : 'Dibatalkan'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">{formatDateShort(menu.available_date)}</p>
                  {menu.description && <p className="mt-2 text-sm text-slate-600">{menu.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/menus/${menu.id}`} className="btn btn-secondary !py-2 !px-3 text-sm">Edit</Link>
                  <button onClick={() => toggleStatus(menu.id, menu.status)} className="btn btn-secondary !py-2 !px-3 text-sm">
                    {menu.status === 'active' ? 'Tutup' : 'Aktifkan'}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                {menu.items?.map((item) => (
                  <div key={item.id} className="item-pill">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.category === 'food' ? 'Makanan' : 'Minuman'}</div>
                    </div>
                    <div className="text-sm font-bold text-teal-700">{formatRupiah(item.price)}</div>
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
