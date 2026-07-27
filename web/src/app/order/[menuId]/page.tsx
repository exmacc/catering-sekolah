'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from '@/types';
import { formatRupiah, formatDateShort } from '@/lib/utils';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';

export default function OrderPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const menuId = String(params.menuId || '');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [paymentPeriod, setPaymentPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (menuId) fetchMenu();
  }, [menuId]);

  async function fetchMenu() {
    setLoading(true);
    const res = await fetch(`/api/menus/${menuId}`);
    const result = await res.json();
    if (result.success) setMenu(result.data);
    else setMenu(null);
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

  const returnUrl = `/order/${menuId}`;
  const loginHref = `/auth/login?next=${encodeURIComponent(returnUrl)}`;
  const registerHref = `/auth/register?next=${encodeURIComponent(returnUrl)}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push(loginHref);
      return;
    }
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
        customer_id: user.id,
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen">
        <CustomerHeader />
        <Loading label="Memuat menu pesanan..." />
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen">
        <CustomerHeader />
        <div className="shell py-16 text-center">
          <h1 className="page-title">Menu tidak ditemukan</h1>
          <p className="page-sub mb-4">Link mungkin salah, atau menu sudah ditutup admin.</p>
          <Link href="/" className="btn btn-primary">Lihat menu tersedia</Link>
        </div>
      </div>
    );
  }

  if (menu.status !== 'active') {
    return (
      <div className="min-h-screen">
        <CustomerHeader />
        <div className="shell py-16 text-center">
          <h1 className="page-title">Menu belum dibuka</h1>
          <p className="page-sub mb-4">Menu ini belum dipublish / sudah ditutup. Hubungi admin catering.</p>
          <Link href="/" className="btn btn-primary">Kembali ke beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <CustomerHeader />

      <main className="shell py-6">
        <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Anda membuka <b>link pesanan langsung</b> dari admin. Pilih item, lalu konfirmasi pesanan.
          {!user && ' Login/daftar sekali — data tersimpan untuk pesanan berikutnya.'}
        </div>

        <div className="mb-6">
          <Badge tone="info">{formatDateShort(menu.available_date)}</Badge>
          <h1 className="page-title mt-2">{menu.name}</h1>
          {menu.description && <p className="page-sub">{menu.description}</p>}
        </div>

        {!user && (
          <div className="card mb-5 flex flex-col gap-3 border-blue-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-bold text-slate-900">Login dulu untuk kirim pesanan</div>
              <div className="text-sm text-slate-500">Setelah masuk, Anda kembali ke halaman ini otomatis.</div>
            </div>
            <div className="flex gap-2">
              <Link href={loginHref} className="btn btn-secondary">Masuk</Link>
              <Link href={registerHref} className="btn btn-primary">Daftar</Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 font-bold text-slate-900">Pilih item</h2>
            <div className="space-y-3">
              {menu.items?.filter((i) => i.is_available).map((item) => {
                const selected = !!cart[item.id];
                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition ${selected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                  >
                    <div className="flex cursor-pointer items-start justify-between gap-3" onClick={() => toggleItem(item.id)}>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={selected} onChange={() => toggleItem(item.id)} className="mt-1 accent-blue-600" />
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blue-50">
                          {item.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xl text-blue-300">🍽️</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="mt-1">
                            <Badge tone={item.category === 'food' ? 'warning' : 'info'}>
                              {item.category === 'food' ? 'Makanan' : 'Minuman'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-blue-700">{formatRupiah(item.price)}</div>
                    </div>

                    {selected && (
                      <div className="ml-7 mt-3 flex items-center gap-3">
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
              <h3 className="mb-3 font-bold text-slate-900">Metode pembayaran</h3>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: 'cash', label: 'Cash', desc: 'Bayar di tempat' },
                  { id: 'transfer', label: 'Transfer', desc: 'Via rekening/VA' },
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`rounded-2xl border p-3 text-left transition ${paymentMethod === opt.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    <div className="font-semibold text-slate-900">{opt.label}</div>
                    <div className="text-xs text-slate-500">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="card p-5">
              <h3 className="mb-3 font-bold text-slate-900">Periode pembayaran</h3>
              <div className="space-y-2">
                {([
                  { id: 'daily', label: 'Harian' },
                  { id: 'weekly', label: 'Mingguan' },
                  { id: 'monthly', label: 'Bulanan' },
                ] as const).map((opt) => (
                  <label key={opt.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${paymentPeriod === opt.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}>
                    <input type="radio" name="payment_period" checked={paymentPeriod === opt.id} onChange={() => setPaymentPeriod(opt.id)} className="accent-blue-600" />
                    <span className="font-medium text-slate-800">{opt.label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="card p-5">
              <h3 className="mb-1 font-bold text-slate-900">Catatan pesanan</h3>
              <p className="mb-3 text-xs text-slate-500">Opsional — contoh: tanpa daun bawang, tanpa cabe, antarkan ke kelas 5A</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="field"
                rows={4}
                maxLength={500}
                placeholder="Tulis permintaan khusus di sini..."
              />
              <div className="mt-1 text-right text-[11px] text-slate-400">{notes.length}/500</div>
            </section>
          </aside>

          {message && (
            <div className="lg:col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
          )}

          <div className="sticky bottom-4 lg:col-span-2">
            <div className="card flex flex-col gap-4 border-blue-100 bg-white/95 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <div className="text-sm text-slate-500">Total pesanan ({Object.keys(cart).length} item)</div>
                <div className="text-2xl font-extrabold text-blue-700">{formatRupiah(getTotal())}</div>
              </div>
              {user ? (
                <button type="submit" disabled={submitting || Object.keys(cart).length === 0} className="btn btn-primary min-w-[180px]">
                  {submitting ? 'Memproses...' : 'Konfirmasi pesanan'}
                </button>
              ) : (
                <Link href={loginHref} className="btn btn-primary min-w-[180px]">
                  Masuk untuk pesan
                </Link>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
