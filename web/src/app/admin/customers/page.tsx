'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    let query = supabase
      .from('customers')
      .select('*, user:users(*)')
      .order('created_at', { ascending: false });

    if (filter) query = query.eq('customer_type', filter);

    const { data } = await query;
    if (data) setCustomers(data);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
          <p className="text-gray-500">Daftar pelanggan catering</p>
        </div>
        <div className="flex gap-2">
          {['', 'parent', 'teacher'].map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 text-sm rounded-lg ${filter === t ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t === '' ? 'Semua' : t === 'parent' ? 'Orang Tua' : 'Guru'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nama</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Tipe</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Nama Anak</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Kelas</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">No. WA</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Daftar</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.user?.full_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.customer_type === 'parent' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {c.customer_type === 'parent' ? 'Orang Tua' : 'Guru'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.child_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.child_class || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.user?.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.user?.phone || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {customers.length === 0 && <div className="text-center py-12 text-gray-500">Belum ada pelanggan</div>}
        </div>
      )}
    </div>
  );
}
