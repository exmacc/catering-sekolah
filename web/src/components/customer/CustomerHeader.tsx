'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { BrandLogo } from '@/components/BrandLogo';

const navBtn =
  'inline-flex h-9 min-w-[4.25rem] items-center justify-center rounded-xl border px-3 text-xs font-semibold leading-none transition sm:h-10 sm:min-w-[5rem] sm:px-3.5 sm:text-sm';

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
                <Link
                  href="/children"
                  className={`${navBtn} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                >
                  Anak
                </Link>
              )}
              <Link
                href="/order/history"
                className={`${navBtn} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
              >
                Riwayat
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`${navBtn} border-blue-600 bg-blue-600 text-white hover:bg-blue-700`}
                >
                  Admin
                </Link>
              )}

              <button
                type="button"
                onClick={logout}
                className={`${navBtn} border-red-200 bg-red-50 text-red-600 hover:bg-red-100`}
              >
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`${navBtn} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className={`${navBtn} border-blue-600 bg-blue-600 text-white hover:bg-blue-700`}
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
