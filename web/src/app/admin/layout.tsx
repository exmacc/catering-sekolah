'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/admin/AdminIcons';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/setup', label: '⚠️ Setup DB', icon: 'menu' },
  { href: '/admin/categories', label: 'Kategori', icon: 'menu' },
  { href: '/admin/catalog', label: 'Daftar Menu', icon: 'menu' },
  { href: '/admin/menus', label: 'Menu Harian', icon: 'order' },
  { href: '/admin/orders', label: 'Pesanan', icon: 'order' },
  { href: '/admin/finance', label: 'Keuangan', icon: 'payment' },
  { href: '/admin/payments', label: 'Pembayaran', icon: 'payment' },
  { href: '/admin/customers', label: 'Pelanggan', icon: 'users' },
  { href: '/admin/reports', label: 'Laporan', icon: 'report' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  const Nav = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} onClick={onClick} className={`admin-nav-link ${active ? 'active' : ''}`}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg">🍱</div>
            <div>
              <div className="font-extrabold tracking-tight">Panel Admin</div>
              <div className="text-xs text-white/60">Catering Sekolah</div>
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
