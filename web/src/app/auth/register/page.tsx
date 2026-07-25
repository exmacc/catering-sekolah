'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuth();
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
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Registrasi gagal');
    } else {
      window.location.href = '/order/history';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-emerald-700">Catering Sekolah</Link>
          <p className="text-gray-600 mt-2">Daftar akun baru</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Saya adalah</label>
            <select
              name="customer_type"
              value={form.customer_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="parent">Orang Tua Siswa</option>
              <option value="teacher">Guru</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" name="full_name" value={form.full_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
          </div>

          {form.customer_type === 'parent' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Anak</label>
                <input type="text" name="child_name" value={form.child_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                <input type="text" name="child_class" value={form.child_class} onChange={handleChange} placeholder="Contoh: 5A" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
              </div>
            </>
          )}

          {form.customer_type === 'teacher' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (mata pelajaran, dll)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" rows={2} />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required minLength={6} />
          </div>

          <button type="submit" disabled={loading} className="w-full py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>

          <p className="text-center mt-4 text-sm text-gray-600">
            Sudah punya akun? <Link href="/auth/login" className="text-emerald-600 hover:underline">Masuk</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
