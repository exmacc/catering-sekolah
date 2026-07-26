-- Branding / pengaturan umum (nama catering + logo)
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
