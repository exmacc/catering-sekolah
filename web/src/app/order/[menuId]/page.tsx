'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Menu, MenuItem } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import Link from 'next/link';

export default function OrderPage() {
  const { user, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [paymentPeriod, setPaymentPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchMenu();
  }, [user]);

  async function fetchMenu() {
    const { data } = await supabase
      .from('menus')
      .select('*, items:menu_items(*)')
      .eq('id', params.menuId)
      .single();
    if (data) setMenu(data);
  }

  function toggleItem(itemId: string, price: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId]) {
        delete next[itemId];
      } else {
        next[itemId] = 1;
      }
      return next;
    });
  }

  function updateQuantity(itemId: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    } else {
      setCart((prev) => ({ ...prev, [itemId]: qty }));
    }
  }

  function getTotal(): number {
    if (!menu) return 0;
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = menu.items?.find((i) => i.id === itemId);
      return sum + (item?.price || 0) * qty;
    }, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      setMessage('Pilih minimal 1 item');
      return;
    }
    setSubmitting(true);
    setMessage('');

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: user!.id,
        menu_id: menu!.id,
        delivery_date: menu!.available_date,
        payment_method: paymentMethod,
        payment_period: paymentPeriod,
        notes,
        items: Object.entries(cart).map(([menu_item_id, quantity]) => ({ menu_item_id, quantity })),
      }),
    });

    const result = await res.json();
    setSubmitting(false);

    if (result.success) {
      router.push('/order/history?success=1');
    } else {
      setMessage(result.error || 'Gagal memesan');
    }
  }

  const cartItems = menu?.items?.filter((i) => cart[i.id]) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-emerald-700">Catering Sekolah</Link>
          <div className="flex items-center gap-4">
            <Link href="/order/history" className="text-sm text-emerald-600 hover:underline">Riwayat</Link>
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button onClick={logout} className="text-sm text-red-500 hover:underline">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {menu && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{menu.name}</h2>
              <p className="text-gray-500">{formatDateShort(menu.available_date)}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Pilih Menu</h3>
                  <div className="space-y-3">
                    {menu.items?.filter(i => i.is_available).map((item) => (
                      <div key={item.id} className={`p-3 rounded-lg border cursor-pointer transition-colors ${cart[item.id] ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className="flex justify-between items-center" onClick={() => toggleItem(item.id, item.price)}>
                          <div className="flex items-center gap-2">
                            <input type="checkbox" checked={!!cart[item.id]} onChange={() => toggleItem(item.id, item.price)} className="accent-emerald-600" />
                            <div>
                              <span className="font-medium text-gray-900">{item.name}</span>
                              <span className={`text-xs ml-2 px-2 py-0.5 rounded ${item.category === 'food' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                {item.category === 'food' ? 'Makanan' : 'Minuman'}
                              </span>
                            </div>
                          </div>
                          <span className="font-semibold text-emerald-700">{formatRupiah(item.price)}</span>
                        </div>
                        {cart[item.id] && (
                          <div className="mt-2 ml-6">
                            <label className="text-sm text-gray-600 mr-2">Jumlah:</label>
                            <div className="inline-flex items-center gap-2">
                              <button type="button" onClick={() => updateQuantity(item.id, cart[item.id] - 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">-</button>
                              <span className="w-8 text-center font-medium">{cart[item.id]}</span>
                              <button type="button" onClick={() => updateQuantity(item.id, cart[item.id] + 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">+</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="payment_method" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="accent-emerald-600" />
                        <span className="font-medium text-gray-900">Cash / Tunai</span>
                      </label>
                      <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                        <input type="radio" name="payment_method" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="accent-emerald-600" />
                        <span className="font-medium text-gray-900">Transfer Bank</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Periode Pembayaran</h3>
                    <div className="space-y-2">
                      {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                        <label key={period} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="payment_period" value={period} checked={paymentPeriod === period} onChange={() => setPaymentPeriod(period)} className="accent-emerald-600" />
                          <span className="font-medium text-gray-900">
                            {period === 'daily' ? 'Harian' : period === 'weekly' ? 'Mingguan' : 'Bulanan'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Catatan</h3>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Catatan tambahan..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" rows={3} />
                  </div>
                </div>
              </div>

              {message && <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('Gagal') || message.includes('Pilih') ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{message}</div>}

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky bottom-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-600">Total Pesanan: </span>
                    <span className="text-2xl font-bold text-emerald-700">{formatRupiah(getTotal())}</span>
                    <span className="text-sm text-gray-500 ml-2">({Object.keys(cart).length} item)</span>
                  </div>
                  <button type="submit" disabled={submitting || Object.keys(cart).length === 0} className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 shadow-lg shadow-emerald-200">
                    {submitting ? 'Memproses...' : 'Pesan Sekarang'}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
