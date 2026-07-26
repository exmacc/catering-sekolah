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
    <header className="sticky top-0 z-20 border-b border-violet-100/80 bg-white/90 backdrop-blur-xl">
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

              <div className="hidden items-center gap-2 rounded-full border border-violet-100 bg-white py-1 pl-3 pr-1 sm:flex">
                <div className="text-right leading-tight">
                  <div className="max-w-[120px] truncate text-sm font-semibold text-slate-800">{user.full_name}</div>
                  <div className="text-[11px] text-slate-500">{isAdmin ? 'Administrator' : 'Pelanggan'}</div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  Keluar
                </button>
              </div>

              <button
                type="button"
                onClick={logout}
                className="btn btn-ghost !px-2 !py-2 text-sm text-red-500 sm:hidden"
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
