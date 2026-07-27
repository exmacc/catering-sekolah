'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { BrandLogo } from '@/components/BrandLogo';

export function CustomerHeader() {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/90 backdrop-blur-xl">
      <div className="shell flex items-center justify-between gap-3 py-3.5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <BrandLogo size={40} />
          <div className="min-w-0">
            <div className="truncate font-extrabold tracking-tight text-slate-900">{branding.business_name}</div>
            <div className="hidden truncate text-[11px] text-slate-500 sm:block">{branding.tagline}</div>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <Link href="/order/history" className="btn btn-secondary !px-3 !py-2 text-sm">
                Riwayat
              </Link>

              {isAdmin && (
                <Link href="/admin" className="btn btn-primary !px-3 !py-2 text-sm">
                  Panel Admin
                </Link>
              )}

              <div className="hidden max-w-[140px] truncate text-right leading-tight sm:block">
                <div className="truncate text-sm font-semibold text-slate-800">{user.full_name}</div>
                <div className="text-[11px] text-slate-500">{isAdmin ? 'Administrator' : 'Pelanggan'}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-secondary !px-3 !py-2 text-sm">
                Masuk
              </Link>
              <Link href="/auth/register" className="btn btn-primary !px-3 !py-2 text-sm">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
