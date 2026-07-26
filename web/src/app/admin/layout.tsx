'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@/components/admin/AdminIcons';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { href: '/admin/menus', label: 'Menu', icon: 'menu' },
  { href: '/admin/orders', label: 'Pesanan', icon: 'order' },
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
    <nav className="space-y-1.5">
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
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg">🍱</div>
            <div>
              <div className="font-extrabold tracking-tight">Admin Panel</div>
              <div className="text-xs text-white/60">Catering Sekolah</div>
            </div>
          </div>
        </div>

        <Nav />

        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="px-2 mb-3">
            <div className="text-sm font-semibold">{user.full_name}</div>
            <div className="text-xs text-white/60">{user.email}</div>
          </div>
          <button onClick={logout} className="admin-nav-link w-full text-left text-red-200 hover:!bg-red-500/10">
            Keluar
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 inset-x-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="btn btn-secondary !py-2 !px-3">Menu</button>
        <div className="font-bold text-slate-800">Admin Catering</div>
        <button onClick={logout} className="text-sm text-red-500">Keluar</button>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 text-white p-4">
            <div className="mb-6 font-bold">Navigasi</div>
            <Nav onClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main className="admin-main">{children}</main>
    </div>
  );
}
