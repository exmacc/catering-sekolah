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
    <header className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/95 backdrop-blur-xl">
      <div className="shell flex items-center justify-between gap-2 py-3 sm:gap-3 sm:py-3.5">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
          <BrandLogo size={36} className="sm:!h-10 sm:!w-10" />
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
              {branding.business_name}
            </div>
            <div className="hidden truncate text-[11px] text-slate-500 sm:block">{branding.tagline}</div>
          </div>
        </Link>

        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              {(user as any).customer?.customer_type === 'parent' && (
                <Link href="/children" className="btn btn-secondary !px-2.5 !py-1.5 text-xs sm:!px-3 sm:!py-2 sm:text-sm">
                  Anak
                </Link>
              )}
              <Link href="/order/history" className="btn btn-secondary !px-2.5 !py-1.5 text-xs sm:!px-3 sm:!py-2 sm:text-sm">
                Riwayat
              </Link>

              {isAdmin && (
                <Link href="/admin" className="btn btn-primary !px-2.5 !py-1.5 text-xs sm:!px-3 sm:!py-2 sm:text-sm">
                  Admin
                </Link>
              )}

              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 sm:px-3 sm:py-2 sm:text-sm"
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-secondary !px-2.5 !py-1.5 text-xs sm:!px-3 sm:!py-2 sm:text-sm">
                Masuk
              </Link>
              <Link href="/auth/register" className="btn btn-primary !px-2.5 !py-1.5 text-xs sm:!px-3 sm:!py-2 sm:text-sm">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
