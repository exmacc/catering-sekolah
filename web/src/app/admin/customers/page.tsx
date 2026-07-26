'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchCustomers(); }, [filter]);

  async function fetchCustomers() {
    setLoading(true);
    const qs = filter ? `?type=${filter}` : '';
    const res = await fetch(`/api/customers${qs}`);
    const result = await res.json();
    if (result.success) setCustomers(result.data || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className="page-title">Pelanggan</h1>
          <p className="page-sub">Data orang tua & guru terdaftar</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {['', 'parent', 'teacher'].map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`btn !py-2 !px-3 text-sm ${filter === t ? 'btn-primary' : 'btn-secondary'}`}>
              {t === '' ? 'Semua' : t === 'parent' ? 'Orang Tua' : 'Guru'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Tipe</th>
                <th>Nama anak</th>
                <th>Kelas</th>
                <th>Email</th>
                <th>WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-slate-800">{c.user?.full_name}</td>
                  <td>
                    <Badge tone={c.customer_type === 'parent' ? 'info' : 'purple'}>
                      {c.customer_type === 'parent' ? 'Orang Tua' : 'Guru'}
                    </Badge>
                  </td>
                  <td className="text-slate-600">{c.child_name || '-'}</td>
                  <td className="text-slate-600">{c.child_class || '-'}</td>
                  <td className="text-slate-600">{c.user?.email}</td>
                  <td className="text-slate-600">{c.user?.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {customers.length === 0 && <div className="p-10 text-center text-slate-500">Belum ada pelanggan</div>}
        </div>
      )}
    </div>
  );
}
