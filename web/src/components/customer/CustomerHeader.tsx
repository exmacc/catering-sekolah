'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function CustomerHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
      <div className="shell flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25 text-lg">🍱</div>
          <div>
            <div className="font-extrabold tracking-tight text-slate-900">Catering Sekolah</div>
            <div className="text-[11px] text-slate-500 -mt-0.5">Pesan mudah • Bayar fleksibel</div>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="btn btn-secondary !py-2 !px-3 text-sm">Admin</Link>
              )}
              <Link href="/order/history" className="btn btn-secondary !py-2 !px-3 text-sm hidden sm:inline-flex">Riwayat</Link>
              <div className="hidden md:block text-right">
                <div className="text-sm font-semibold text-slate-800">{user.full_name}</div>
                <div className="text-[11px] text-slate-500">{user.role === 'admin' ? 'Administrator' : 'Pelanggan'}</div>
              </div>
              <button onClick={logout} className="btn btn-ghost !py-2 !px-3 text-sm text-red-500">Keluar</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-secondary !py-2 !px-3 text-sm">Masuk</Link>
              <Link href="/auth/register" className="btn btn-primary !py-2 !px-3 text-sm">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
