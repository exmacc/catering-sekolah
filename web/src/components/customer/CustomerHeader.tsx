'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function CustomerHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-violet-100/80 bg-white/90 backdrop-blur-xl">
      <div className="shell flex items-center justify-between gap-3 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-lg text-white shadow-lg shadow-violet-500/25">
            🍱
          </div>
          <div className="min-w-0">
            <div className="truncate font-extrabold tracking-tight text-slate-900">Catering Sekolah</div>
            <div className="hidden text-[11px] text-slate-500 sm:block">Pesan mudah • Bayar fleksibel</div>
          </div>
        </Link>

        <div className="header-actions shrink-0">
          {user ? (
            <>
              <Link href="/order/history" className="btn btn-secondary !px-3.5 !py-2 text-sm">
                Riwayat
              </Link>

              {user.role === 'admin' && (
                <Link href="/admin" className="btn btn-primary !px-3.5 !py-2 text-sm">
                  Panel Admin
                </Link>
              )}

              <div className="header-user">
                <div className="header-user-meta">
                  <div className="max-w-[140px] truncate text-sm font-semibold text-slate-800">{user.full_name}</div>
                  <div className="text-[11px] text-slate-500">{user.role === 'admin' ? 'Administrator' : 'Pelanggan'}</div>
                </div>
                <button onClick={logout} className="btn btn-ghost !rounded-full !px-3 !py-2 text-sm text-red-500 hover:bg-red-50">
                  Keluar
                </button>
              </div>

              {/* Mobile-only logout when user chip is hidden */}
              <button onClick={logout} className="btn btn-ghost !px-2 !py-2 text-sm text-red-500 md:hidden">
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-secondary !px-3.5 !py-2 text-sm">
                Masuk
              </Link>
              <Link href="/auth/register" className="btn btn-primary !px-3.5 !py-2 text-sm">
                Daftar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
