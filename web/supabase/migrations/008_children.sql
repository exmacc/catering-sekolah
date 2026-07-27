-- Multi-anak: 1 ortu bisa punya banyak anak
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_children_customer ON children(customer_id);

-- Pesanan terikat ke anak (opsional untuk guru)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_child ON orders(child_id);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_children" ON children;
DROP POLICY IF EXISTS "public_read_children" ON children;
CREATE POLICY "service_children" ON children FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_read_children" ON children FOR SELECT USING (true);

-- Migrasi data anak lama dari customers
INSERT INTO children (customer_id, name, class_name, is_active)
SELECT c.id, c.child_name, c.child_class, true
FROM customers c
WHERE c.customer_type = 'parent'
  AND c.child_name IS NOT NULL
  AND TRIM(c.child_name) <> ''
  AND c.child_class IS NOT NULL
  AND TRIM(c.child_class) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM children ch
    WHERE ch.customer_id = c.id
      AND ch.name = c.child_name
      AND ch.class_name = c.child_class
  );
