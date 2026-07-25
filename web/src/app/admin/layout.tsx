'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/menus', label: 'Menu', icon: '📋' },
  { href: '/admin/orders', label: 'Pesanan', icon: '📦' },
  { href: '/admin/payments', label: 'Pembayaran', icon: '💰' },
  { href: '/admin/customers', label: 'Pelanggan', icon: '👥' },
  { href: '/admin/reports', label: 'Laporan', icon: '📈' },
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
  }, [user, loading]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-4 border-b border-gray-200">
          <Link href="/admin" className="text-lg font-bold text-emerald-700">Admin Catering</Link>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 p-4 border-t border-gray-200 w-64">
          <div className="text-sm text-gray-600 mb-2">{user.full_name}</div>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Keluar</button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20 px-4 py-3 flex justify-between items-center">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-bold text-emerald-700">Admin Catering</span>
        <button onClick={logout} className="text-sm text-red-500">Keluar</button>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 md:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-bold text-emerald-700">Menu</h2>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${
                    pathname === item.href ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-0 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
