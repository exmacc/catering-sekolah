'use client';

import Link from 'next/link';
import { Icon } from '@/components/admin/AdminIcons';

const items = [
  {
    href: '/admin/settings',
    title: 'Nama & Logo',
    desc: 'Ubah nama catering, tagline, dan logo. Perubahan tampil di web customer.',
    icon: 'brand',
  },
  {
    href: '/admin/users',
    title: 'Kelola User',
    desc: 'Tambah admin atau customer (email + password), aktif/nonaktif akun.',
    icon: 'users',
  },
  {
    href: '/admin/setup',
    title: 'Setup Database',
    desc: 'Jalankan migrasi SQL Supabase dan cek kesiapan tabel (kategori, menu, keuangan, branding).',
    icon: 'database',
  },
];

export default function PengaturanPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="page-title">Pengaturan</h1>
        <p className="page-sub">Kelola branding dan setup sistem</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card group block p-5 transition hover:-translate-y-0.5 hover:border-blue-200"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 group-hover:bg-blue-100">
              <Icon name={item.icon} />
            </div>
            <div className="font-bold text-slate-900">{item.title}</div>
            <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            <div className="mt-4 text-sm font-semibold text-blue-700">Buka →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
