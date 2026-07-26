'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/admin/AdminIcons';
import { BrandLogo } from '@/components/BrandLogo';

const mainNav = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/categories', label: 'Kategori', icon: 'menu' },
  { href: '/admin/catalog', label: 'Daftar Menu', icon: 'menu' },
  { href: '/admin/menus', label: 'Menu Harian', icon: 'order' },
  { href: '/admin/orders', label: 'Pesanan', icon: 'order' },
  { href: '/admin/finance', label: 'Keuangan', icon: 'payment' },
  { href: '/admin/payments', label: 'Pembayaran', icon: 'payment' },
  { href: '/admin/customers', label: 'Pelanggan', icon: 'users' },
  { href: '/admin/reports', label: 'Laporan', icon: 'report' },
];

const settingsChildren = [
  { href: '/admin/settings', label: 'Nama & Logo', icon: 'brand', desc: 'Branding web customer' },
  { href: '/admin/setup', label: 'Setup Database', icon: 'database', desc: 'Migrasi & cek tabel' },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === '/admin') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

function isSettingsPath(pathname: string) {
  return pathname.startsWith('/admin/settings') || pathname.startsWith('/admin/setup') || pathname.startsWith('/admin/pengaturan');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { branding } = useBranding();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (isSettingsPath(pathname)) setSettingsOpen(true);
  }, [pathname]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  const Nav = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1">
      {mainNav.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={`admin-nav-link ${active ? 'active' : ''}`}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          className={`admin-nav-link w-full ${isSettingsPath(pathname) ? 'active' : ''}`}
        >
          <Icon name="settings" />
          <span className="flex-1 text-left">Pengaturan</span>
          <Icon
            name="chevron"
            className={`h-4 w-4 transition-transform ${settingsOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {settingsOpen && (
          <div className="ml-3 mt-1 space-y-0.5 border-l border-white/15 pl-2">
            {settingsChildren.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClick}
                  className={`admin-nav-link !py-2 text-sm ${active ? 'active' : ''}`}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="mb-6 px-2">
          <div className="flex items-center gap-3">
            <BrandLogo size={44} className="!rounded-2xl ring-2 ring-white/20" />
            <div className="min-w-0">
              <div className="font-extrabold tracking-tight">Panel Admin</div>
              <div className="truncate text-xs text-white/60">{branding.business_name}</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          <Nav />
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="mb-3 px-2">
            <div className="text-sm font-semibold">{user.full_name}</div>
            <div className="text-xs text-white/60">{user.email}</div>
          </div>
          <Link href="/" className="admin-nav-link w-full">Lihat beranda</Link>
          <button onClick={logout} className="admin-nav-link w-full text-left text-red-200 hover:!bg-red-500/10">
            Keluar
          </button>
        </div>
      </aside>

      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <button onClick={() => setSidebarOpen(true)} className="btn btn-secondary !px-3 !py-2">Menu</button>
        <div className="font-bold text-slate-800">Admin</div>
        <button onClick={logout} className="text-sm text-red-500">Keluar</button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute bottom-0 left-0 top-0 w-72 overflow-y-auto bg-slate-900 p-4 text-white">
            <div className="mb-6 font-bold">Navigasi Admin</div>
            <Nav onClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main className="admin-main">{children}</main>
    </div>
  );
}
