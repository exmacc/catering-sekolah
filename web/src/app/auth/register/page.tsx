'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { BrandLogo } from '@/components/BrandLogo';

function RegisterForm() {
  const { register } = useAuth();
  const { branding } = useBranding();
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get('next') || '/';
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    customer_type: 'parent' as 'parent' | 'teacher',
    child_name: '',
    child_class: '',
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError('Format email tidak valid');
      return;
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }
    setLoading(true);
    const result = await register({
      ...form,
      email: form.email.trim().toLowerCase(),
      full_name: form.full_name.trim(),
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Registrasi gagal');
    } else {
      router.replace(next.startsWith('/') ? next : '/');
    }
  }

  return (
    <div className="auth-wrap py-8">
      <div className="auth-card" style={{ width: 'min(520px, 100%)' }}>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex justify-center">
            <BrandLogo size={48} />
          </div>
          <div className="mb-1 text-sm font-semibold text-blue-700">{branding.business_name}</div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Daftar akun</h1>
          <p className="mt-1 text-sm text-slate-500">
            {next.startsWith('/order/')
              ? 'Daftar sekali, lalu lanjut pesan dari link admin'
              : 'Data cukup diisi sekali, pesanan berikutnya lebih cepat'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}

          <div>
            <label className="label">Saya adalah</label>
            <div className="grid grid-cols-2 gap-2">
              {(['parent', 'teacher'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, customer_type: type })}
                  className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    form.customer_type === type
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type === 'parent' ? 'Orang Tua' : 'Guru'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Nama lengkap</label>
            <input type="text" name="full_name" value={form.full_name} onChange={handleChange} className="field" required />
          </div>

          {form.customer_type === 'parent' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Nama anak</label>
                <input type="text" name="child_name" value={form.child_name} onChange={handleChange} className="field" required />
              </div>
              <div>
                <label className="label">Kelas</label>
                <input type="text" name="child_class" value={form.child_class} onChange={handleChange} className="field" placeholder="Contoh: 5A" required />
              </div>
            </div>
          ) : (
            <div>
              <label className="label">Catatan (opsional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="field" rows={2} placeholder="Mata pelajaran, dll" />
            </div>
          )}

          <div>
            <label className="label">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="field" required />
          </div>

          <div>
            <label className="label">No. WhatsApp</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="field" placeholder="08xxxxxxxxxx" />
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="field" required minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Memproses...' : 'Buat akun & lanjut pesan'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link href={`/auth/login?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-700 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="auth-wrap text-slate-500">Memuat...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
