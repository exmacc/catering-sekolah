'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
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
      window.location.href = '/';
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-xl text-white shadow-lg shadow-violet-500/25">🍱</div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Masuk akun</h1>
          <p className="mt-1 text-sm text-slate-500">Akses menu, pesanan, dan riwayat pembayaran</p>
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
          Belum punya akun? <Link href="/auth/register" className="font-semibold text-violet-700 hover:underline">Daftar</Link>
        </p>
        <div className="mt-3 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">← Kembali ke beranda</Link>
        </div>
      </div>
    </div>
  );
}
