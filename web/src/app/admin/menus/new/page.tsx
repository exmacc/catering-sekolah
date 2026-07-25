'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewMenuPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    available_date: '',
    order_deadline: '',
  });
  const [items, setItems] = useState([{ name: '', description: '', price: 0, category: 'food' as 'food' | 'drink' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addItem() {
    setItems([...items, { name: '', description: '', price: 0, category: 'food' }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: string, value: any) {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setItems(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, items }),
    });

    const result = await res.json();
    setLoading(false);

    if (result.success) {
      router.push('/admin/menus');
    } else {
      setError(result.error || 'Gagal membuat menu');
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Buat Menu Baru</h1>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Informasi Menu</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: Menu Senin, 27 Juli 2026" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" rows={2} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Tersedia</label>
              <input type="date" value={form.available_date} onChange={(e) => setForm({ ...form, available_date: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batas Pemesanan (opsional)</label>
              <input type="datetime-local" value={form.order_deadline} onChange={(e) => setForm({ ...form, order_deadline: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Item Menu</h2>
            <button type="button" onClick={addItem} className="px-3 py-1.5 text-sm text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50">
              + Tambah Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Item #{index + 1}</span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-sm text-red-500 hover:underline">Hapus</button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Nama</label>
                    <input type="text" value={item.name} onChange={(e) => updateItem(index, 'name', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Nasi Goreng" required />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Kategori</label>
                    <select value={item.category} onChange={(e) => updateItem(index, 'category', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                      <option value="food">Makanan</option>
                      <option value="drink">Minuman</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Harga (Rp)</label>
                    <input type="number" value={item.price || ''} onChange={(e) => updateItem(index, 'price', parseInt(e.target.value) || 0)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="15000" required min={0} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50">
            {loading ? 'Menyimpan...' : 'Simpan Menu'}
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
