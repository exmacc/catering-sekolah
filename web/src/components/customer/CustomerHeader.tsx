'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { BrandLogo } from '@/components/BrandLogo';

function NavIcon({ name }: { name: 'child' | 'history' | 'logout' | 'admin' | 'login' | 'register' }) {
  const paths: Record<string, React.ReactNode> = {
    child: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    ),
    history: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    logout: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
      />
    ),
    admin: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
    ),
    login: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
      />
    ),
    register: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    ),
  };

  return (
    <svg className="h-4 w-4 sm:h-[18px] sm:w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
      {paths[name]}
    </svg>
  );
}

/** Mobile: icon only. Desktop (sm+): icon + text, same height */
const navBtnBase =
  'inline-flex h-9 w-9 items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold leading-none transition sm:h-10 sm:w-auto sm:min-w-0 sm:px-3 sm:text-sm';

export function CustomerHeader() {
  const { user, logout } = useAuth();
  const { branding } = useBranding();
  const isAdmin = user?.role === 'admin';
  const isParent = (user as any)?.customer?.customer_type === 'parent';

  return (
    <header className="sticky top-0 z-20 border-b border-blue-100/80 bg-white/95 backdrop-blur-xl">
      <div className="shell flex items-center justify-between gap-2 py-3 sm:gap-3 sm:py-3.5">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5" title={branding.business_name}>
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
              {isParent && (
                <Link
                  href="/children"
                  title="Anak"
                  aria-label="Anak"
                  className={`${navBtnBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                >
                  <NavIcon name="child" />
                  <span className="hidden sm:inline">Anak</span>
                </Link>
              )}
              <Link
                href="/order/history"
                title="Riwayat"
                aria-label="Riwayat"
                className={`${navBtnBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
              >
                <NavIcon name="history" />
                <span className="hidden sm:inline">Riwayat</span>
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  title="Admin"
                  aria-label="Admin"
                  className={`${navBtnBase} border-blue-600 bg-blue-600 text-white hover:bg-blue-700`}
                >
                  <NavIcon name="admin" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              <button
                type="button"
                onClick={logout}
                title="Keluar"
                aria-label="Keluar"
                className={`${navBtnBase} border-red-200 bg-red-50 text-red-600 hover:bg-red-100`}
              >
                <NavIcon name="logout" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                title="Masuk"
                aria-label="Masuk"
                className={`${navBtnBase} border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
              >
                <NavIcon name="login" />
                <span className="hidden sm:inline">Masuk</span>
              </Link>
              <Link
                href="/auth/register"
                title="Daftar"
                aria-label="Daftar"
                className={`${navBtnBase} border-blue-600 bg-blue-600 text-white hover:bg-blue-700`}
              >
                <NavIcon name="register" />
                <span className="hidden sm:inline">Daftar</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
