'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function CustomerMenusPage() {
  const { user, logout } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  async function fetchMenus() {
    const { data } = await supabase
      .from('menus')
      .select('*, items:menu_items(*)')
      .eq('status', 'active')
      .gte('available_date', new Date().toISOString().split('T')[0])
      .order('available_date', { ascending: true });

    if (data) setMenus(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-emerald-700">Catering Sekolah</h1>
          <div className="flex items-center gap-4">
            <Link href="/order/history" className="text-sm text-emerald-600 hover:underline">Riwayat</Link>
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button onClick={logout} className="text-sm text-red-500 hover:underline">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Hari Ini</h2>
        <p className="text-gray-600 mb-8">Pilih menu dan pesan makanan untuk anak Anda</p>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Memuat menu...</div>
        ) : menus.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">Belum ada menu tersedia. Silakan cek kembali nanti.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {menus.map((menu) => (
              <div key={menu.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{menu.name}</h3>
                      <p className="text-sm text-gray-500">{formatDateShort(menu.available_date)}</p>
                    </div>
                    <Link
                      href={`/order/${menu.id}`}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                    >
                      Pesan
                    </Link>
                  </div>

                  {menu.description && <p className="text-gray-600 text-sm mb-4">{menu.description}</p>}

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {menu.items?.filter(i => i.is_available).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          <span className={`text-xs ml-2 px-2 py-0.5 rounded ${item.category === 'food' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                            {item.category === 'food' ? 'Makanan' : 'Minuman'}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-emerald-700">{formatRupiah(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
