'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';

export default function OrderPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [paymentPeriod, setPaymentPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchMenu();
  }, [user]);

  async function fetchMenu() {
    const res = await fetch(`/api/menus/${params.menuId}`);
    const result = await res.json();
    if (result.success) setMenu(result.data);
    setLoading(false);
  }

  function toggleItem(itemId: string) {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId]) delete next[itemId];
      else next[itemId] = 1;
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

    if (result.success) router.push('/order/history?success=1');
    else setMessage(result.error || 'Gagal memesan');
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <CustomerHeader />
        <Loading />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen">
        <CustomerHeader />
        <div className="shell py-16 text-center text-slate-500">Menu tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <CustomerHeader />

      <main className="shell py-6">
        <div className="mb-6">
          <Badge tone="info">{formatDateShort(menu.available_date)}</Badge>
          <h1 className="page-title mt-2">{menu.name}</h1>
          {menu.description && <p className="page-sub">{menu.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-5">
          <section className="card p-5 sm:p-6">
            <h2 className="font-bold text-slate-900 mb-4">Pilih item</h2>
            <div className="space-y-3">
              {menu.items?.filter((i) => i.is_available).map((item) => {
                const selected = !!cart[item.id];
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition ${selected ? 'border-violet-500 bg-violet-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={() => toggleItem(item.id)}>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={selected} onChange={() => toggleItem(item.id)} className="mt-1 accent-violet-600" />
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="mt-1">
                            <Badge tone={item.category === 'food' ? 'warning' : 'info'}>
                              {item.category === 'food' ? 'Makanan' : 'Minuman'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-violet-700">{formatRupiah(item.price)}</div>
                    </div>

                    {selected && (
                      <div className="mt-3 ml-7 flex items-center gap-3">
                        <span className="text-sm text-slate-500">Jumlah</span>
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
                          <button type="button" onClick={() => updateQuantity(item.id, cart[item.id] - 1)} className="h-8 w-8 rounded-lg hover:bg-slate-50">-</button>
                          <span className="w-8 text-center font-semibold">{cart[item.id]}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, cart[item.id] + 1)} className="h-8 w-8 rounded-lg hover:bg-slate-50">+</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">Metode pembayaran</h3>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'cash', label: 'Cash', desc: 'Bayar di tempat' },
                  { id: 'transfer', label: 'Transfer', desc: 'Auto via VA' },
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`rounded-2xl border p-3 text-left transition ${paymentMethod === opt.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <div className="font-semibold text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">Periode pembayaran</h3>
              <div className="space-y-2">
                {([
                  { id: 'daily', label: 'Harian' },
                  { id: 'weekly', label: 'Mingguan' },
                  { id: 'monthly', label: 'Bulanan' },
                ] as const).map((opt) => (
                  <label key={opt.id} className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer ${paymentPeriod === opt.id ? 'border-violet-500 bg-violet-50' : 'border-slate-200'}`}>
                    <input type="radio" name="payment_period" checked={paymentPeriod === opt.id} onChange={() => setPaymentPeriod(opt.id)} className="accent-violet-600" />
                    <span className="font-medium text-slate-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="card p-5">
              <h3 className="font-bold text-slate-900 mb-3">Catatan</h3>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="field" rows={3} placeholder="Contoh: pedas level 1, tanpa cabe..." />
            </section>
          </aside>

          {message && (
            <div className="lg:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
          )}

          <div className="lg:col-span-2 sticky bottom-4">
            <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-violet-100 bg-white/95 backdrop-blur">
              <div>
                <div className="text-sm text-slate-500">Total pesanan ({Object.keys(cart).length} item)</div>
                <div className="text-2xl font-extrabold text-violet-700">{formatRupiah(getTotal())}</div>
              </div>
              <button type="submit" disabled={submitting || Object.keys(cart).length === 0} className="btn btn-primary min-w-[180px]">
                {submitting ? 'Memproses...' : 'Konfirmasi pesanan'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
