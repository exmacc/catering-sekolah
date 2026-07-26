'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';

export default function CustomerMenusPage() {
  const { user } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  async function fetchMenus() {
    try {
      const res = await fetch('/api/menus?customer=true');
      const result = await res.json();
      if (result.success && result.data) {
        setMenus(result.data.filter((m: Menu) => m.status === 'active'));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen pb-16">
      <CustomerHeader />

      <section className="shell pt-8 pb-4">
        <div className="card overflow-hidden">
          <div className="grid md:grid-cols-[1.35fr_0.65fr]">
            <div className="p-6 sm:p-8">
              <Badge tone="success">Menu harian siap dipesan</Badge>
              <h1 className="page-title mt-3 text-slate-900">
                Pesan catering sekolah<br className="hidden sm:block" /> lebih cepat & rapi
              </h1>
              <p className="page-sub max-w-xl">
                Pilih makanan & minuman, tentukan metode bayar cash/transfer, serta periode harian, mingguan, atau bulanan.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="chip border border-violet-100 bg-violet-50 text-violet-700">Cash / Transfer</span>
                <span className="chip border border-indigo-100 bg-indigo-50 text-indigo-700">Harian · Mingguan · Bulanan</span>
                <span className="chip border border-purple-100 bg-purple-50 text-purple-700">Data tersimpan</span>
              </div>
            </div>
            <div className="flex flex-col justify-between bg-gradient-to-br from-violet-600 to-purple-700 p-6 text-white sm:p-8">
              <div>
                <div className="text-sm text-violet-100">Status akun</div>
                <div className="mt-1 text-xl font-bold">{user ? `Halo, ${user.full_name}` : 'Belum login'}</div>
                <p className="mt-2 text-sm text-violet-50/90">
                  {user
                    ? user.role === 'admin'
                      ? 'Kelola kategori, daftar menu, publish harian, dan keuangan lewat Panel Admin.'
                      : 'Langsung pilih menu di bawah untuk pesan.'
                    : 'Daftar sekali, besok pesan lagi tanpa isi data ulang.'}
                </p>
              </div>
              {!user ? (
                <Link href="/auth/register" className="btn mt-6 bg-white text-violet-800 hover:bg-violet-50">
                  Daftar sekarang
                </Link>
              ) : user.role === 'admin' ? (
                <Link href="/admin/menus" className="btn mt-6 bg-white text-violet-800 hover:bg-violet-50">
                  Kelola & publish menu
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <main className="shell pt-4">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Menu tersedia</h2>
            <p className="text-sm text-slate-500">Menu aktif mulai hari ini ke depan</p>
          </div>
          <div className="text-sm text-slate-500">{menus.length} menu</div>
        </div>

        {loading ? (
          <Loading label="Memuat menu..." />
        ) : menus.length === 0 ? (
          <EmptyState
            title="Belum ada menu tersedia"
            description="Admin belum mempublikasikan menu untuk hari ini. Silakan cek kembali nanti."
            action={!user ? <Link href="/auth/register" className="btn btn-primary">Daftar dulu</Link> : undefined}
          />
        ) : (
          <div className="menu-grid">
            {menus.map((menu) => (
              <article key={menu.id} className="food-card">
                <div className="food-card-top">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-violet-50/90">Tanggal saji</div>
                      <div className="font-semibold">{formatDateShort(menu.available_date)}</div>
                    </div>
                    <Badge tone="success" className="!border-white/20 !bg-white/15 !text-white">Aktif</Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold leading-tight">{menu.name}</h3>
                    {menu.description && <p className="mt-1 line-clamp-2 text-sm text-violet-50/90">{menu.description}</p>}
                  </div>
                </div>

                <div className="space-y-2.5 p-4">
                  {(menu.items || []).filter((i) => i.is_available).slice(0, 4).map((item) => (
                    <div key={item.id} className="item-pill">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-800">{item.name}</div>
                        <div className="text-[11px] text-slate-500">{item.category === 'food' ? 'Makanan' : 'Minuman'}</div>
                      </div>
                      <div className="whitespace-nowrap text-sm font-bold text-violet-700">{formatRupiah(item.price)}</div>
                    </div>
                  ))}
                  {(menu.items?.length || 0) > 4 && (
                    <div className="px-1 text-xs text-slate-500">+{(menu.items?.length || 0) - 4} item lainnya</div>
                  )}

                  <div className="pt-2">
                    {user ? (
                      <Link href={`/order/${menu.id}`} className="btn btn-primary w-full">Pesan menu ini</Link>
                    ) : (
                      <Link href="/auth/login" className="btn btn-primary w-full">Masuk untuk pesan</Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
