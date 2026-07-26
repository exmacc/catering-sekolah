-- Master kategori (CRUD admin)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Master menu/item + harga (CRUD admin)
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

-- Pengeluaran (kas keluar)
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

-- Link daily menu_items ke catalog (opsional)
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

-- Service role bypasses RLS; allow authenticated admin ops via service key from API
CREATE POLICY "service_categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_catalog" ON catalog_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "public_read_catalog" ON catalog_items FOR SELECT USING (is_available = true);

-- Seed kategori default
INSERT INTO categories (name, description, sort_order)
VALUES
  ('Makanan', 'Menu makanan utama', 1),
  ('Minuman', 'Menu minuman', 2)
ON CONFLICT (name) DO NOTHING;

-- Sync role admin ke auth metadata (manual via app)
