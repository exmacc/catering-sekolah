'use client';

import { useState } from 'react';

const SQL = `-- =============================================
-- WAJIB DIJALANKAN di Supabase SQL Editor
-- Project: catering-sekolah
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  category TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_period TEXT CHECK (payment_period IN ('daily', 'weekly', 'monthly', 'other')) DEFAULT 'daily',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS catalog_item_id UUID REFERENCES catalog_items(id) ON DELETE SET NULL;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_period ON expenses(payment_period);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_categories" ON categories;
DROP POLICY IF EXISTS "service_catalog" ON catalog_items;
DROP POLICY IF EXISTS "service_expenses" ON expenses;
DROP POLICY IF EXISTS "public_read_categories" ON categories;
DROP POLICY IF EXISTS "public_read_catalog" ON catalog_items;

CREATE POLICY "service_categories" ON categories FOR ALL USING (true);
CREATE POLICY "service_catalog" ON catalog_items FOR ALL USING (true);
CREATE POLICY "service_expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_catalog" ON catalog_items FOR SELECT USING (is_available = true);

INSERT INTO categories (name, description, sort_order)
VALUES
  ('Makanan', 'Menu makanan utama', 1),
  ('Minuman', 'Menu minuman', 2)
ON CONFLICT (name) DO NOTHING;

-- Branding (nama + logo)
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  business_name TEXT NOT NULL DEFAULT 'Catering Sekolah',
  tagline TEXT DEFAULT 'Pesan mudah • Bayar fleksibel',
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES users(id)
);

INSERT INTO app_settings (id, business_name, tagline)
VALUES ('main', 'Catering Sekolah', 'Pesan mudah • Bayar fleksibel')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_settings" ON app_settings;
DROP POLICY IF EXISTS "service_settings" ON app_settings;
CREATE POLICY "public_read_settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "service_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- Foto item master menu
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS image_url TEXT;
`;

export default function AdminSetupPage() {
  const [copied, setCopied] = useState(false);
  const [checkResult, setCheckResult] = useState<string>('');

  async function copySql() {
    await navigator.clipboard.writeText(SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function checkTables() {
    setCheckResult('Mengecek...');
    const [c, i, e, s] = await Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/catalog').then((r) => r.json()),
      fetch('/api/expenses').then((r) => r.json()),
      fetch('/api/settings').then((r) => r.json()),
    ]);
    const settingsOk = s.success && !s.warning;
    if (c.success && i.success && e.success && settingsOk) {
      setCheckResult('✅ Semua tabel siap! (Kategori, Catalog, Keuangan, Nama & Logo)');
    } else {
      setCheckResult(
        `❌ Belum siap.\nKategori: ${c.error || 'OK'}\nCatalog: ${i.error || 'OK'}\nExpenses: ${e.error || 'OK'}\nSettings: ${s.warning || s.error || 'OK'}\n\nJalankan SQL di Supabase dulu (klik Salin SQL).`
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="mb-1 text-sm font-medium text-blue-700">Pengaturan → Setup Database</p>
        <h1 className="page-title">Setup Database</h1>
        <p className="page-sub">
          Error <b>Could not find the table public.categories</b> artinya tabel belum dibuat di Supabase.
        </p>
      </div>

      <section className="card space-y-4 border-amber-200 bg-amber-50 p-5">
        <h2 className="font-bold text-amber-900">Langkah 3 menit</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-amber-950">
          <li>
            Buka{' '}
            <a
              className="font-semibold text-blue-700 underline"
              href="https://supabase.com/dashboard/project/fevvypxymwmgscsirpfg/sql/new"
              target="_blank"
              rel="noreferrer"
            >
              Supabase SQL Editor (klik di sini)
            </a>
          </li>
          <li>Klik tombol <b>Salin SQL</b> di bawah</li>
          <li>Paste di SQL Editor → klik <b>Run</b> (pojok kanan)</li>
          <li>Kembali ke sini → klik <b>Cek tabel</b></li>
          <li>Kalau ✅, buka menu <b>Kategori</b> / <b>Daftar Menu</b> / <b>Keuangan</b></li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copySql} className="btn btn-primary">
            {copied ? 'SQL disalin ✓' : 'Salin SQL'}
          </button>
          <button type="button" onClick={checkTables} className="btn btn-secondary">
            Cek tabel
          </button>
          <a
            className="btn btn-secondary"
            href="https://supabase.com/dashboard/project/fevvypxymwmgscsirpfg/sql/new"
            target="_blank"
            rel="noreferrer"
          >
            Buka Supabase SQL
          </a>
        </div>
        {checkResult && (
          <pre className="whitespace-pre-wrap rounded-xl bg-white/80 p-3 text-sm text-slate-700">{checkResult}</pre>
        )}
      </section>

      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-900">SQL yang harus di-run</h2>
        <textarea className="field min-h-[320px] font-mono text-xs" readOnly value={SQL} />
      </section>
    </div>
  );
}
