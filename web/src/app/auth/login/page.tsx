'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBranding } from '@/contexts/BrandingContext';
import { BrandLogo } from '@/components/BrandLogo';

function LoginForm() {
  const { login } = useAuth();
  const { branding } = useBranding();
  const searchParams = useSearchParams();
  const router = useRouter();
  const next = searchParams.get('next') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login gagal');
    } else {
      router.replace(next.startsWith('/') ? next : '/');
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex justify-center">
            <BrandLogo size={48} />
          </div>
          <div className="mb-1 text-sm font-semibold text-blue-700">{branding.business_name}</div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Masuk akun</h1>
          <p className="mt-1 text-sm text-slate-500">
            {next.startsWith('/order/')
              ? 'Setelah masuk, Anda kembali ke halaman pesanan'
              : 'Akses menu, pesanan, dan riwayat'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>}

          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="nama@email.com" required />
          </div>

          <div>
            <label className="label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field" placeholder="Minimal 6 karakter" required />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link href={`/auth/register?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-700 hover:underline">
            Daftar
          </Link>
        </p>
        <div className="mt-3 text-center">
          <Link href={next.startsWith('/') ? next : '/'} className="text-sm text-slate-400 hover:text-slate-600">
            ← Kembali
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-wrap text-slate-500">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
