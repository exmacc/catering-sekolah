'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Menu } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import Link from 'next/link';

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMenus(); }, []);

  async function fetchMenus() {
    const { data } = await supabase
      .from('menus')
      .select('*, items:menu_items(*)')
      .order('available_date', { ascending: false });
    if (data) setMenus(data);
    setLoading(false);
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    await supabase.from('menus').update({ status: newStatus }).eq('id', id);
    fetchMenus();
  }

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Catering</h1>
          <p className="text-gray-500">Kelola menu harian</p>
        </div>
        <Link href="/admin/menus/new" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          + Buat Menu
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat...</div>
      ) : (
        <div className="space-y-4">
          {menus.map((menu) => (
            <div key={menu.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{menu.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[menu.status]}`}>
                      {menu.status === 'active' ? 'Aktif' : menu.status === 'closed' ? 'Ditutup' : 'Dibatalkan'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{formatDateShort(menu.available_date)}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/menus/${menu.id}`} className="px-3 py-1.5 text-sm text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50">
                    Edit
                  </Link>
                  <button onClick={() => toggleStatus(menu.id, menu.status)} className={`px-3 py-1.5 text-sm border rounded-lg ${menu.status === 'active' ? 'text-yellow-600 border-yellow-200 hover:bg-yellow-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                    {menu.status === 'active' ? 'Tutup' : 'Aktifkan'}
                  </button>
                </div>
              </div>

              {menu.description && <p className="text-gray-600 text-sm mb-3">{menu.description}</p>}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {menu.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <span className="text-gray-900">{item.name}</span>
                      <span className={`text-xs ml-1 px-1.5 py-0.5 rounded ${item.category === 'food' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.category === 'food' ? 'M' : 'Min'}
                      </span>
                    </div>
                    <span className="font-medium text-emerald-700">{formatRupiah(item.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
