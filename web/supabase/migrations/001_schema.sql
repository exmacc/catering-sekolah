-- ============================================
-- CATATAN KEUANGAN CATERING SEKOLAH
-- Supabase PostgreSQL Schema
-- ============================================

-- 1. USERS (shared for admin & customers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. CUSTOMERS (extended data for parents/teachers)
CREATE TABLE customers (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('parent', 'teacher')),
  child_name TEXT,
  child_class TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. MENUS (daily menu set)
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  available_date DATE NOT NULL,
  order_deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MENU_ITEMS (individual food/drink items)
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('food', 'drink')),
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. ORDERS
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  menu_id UUID REFERENCES menus(id) NOT NULL,
  order_date TIMESTAMPTZ DEFAULT now(),
  delivery_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer')),
  payment_period TEXT NOT NULL CHECK (payment_period IN ('daily', 'weekly', 'monthly')),
  notes TEXT,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. ORDER_ITEMS
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES menu_items(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. INVOICES (weekly/monthly billing)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'partially_paid', 'cancelled')),
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. PAYMENTS
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  order_id UUID REFERENCES orders(id),
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer')),
  payment_period TEXT NOT NULL CHECK (payment_period IN ('daily', 'weekly', 'monthly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  paid_at TIMESTAMPTZ,
  transaction_id TEXT,
  confirmed_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. PAYMENT_LOGS (Midtrans/webhook audit trail)
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  gateway TEXT NOT NULL,
  gateway_transaction_id TEXT,
  event_type TEXT,
  raw_response JSONB,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_menus_available_date ON menus(available_date);
CREATE INDEX idx_menus_status ON menus(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_menu_id ON orders(menu_id);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_payments_customer_id ON payments(customer_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payment_logs_payment_id ON payment_logs(payment_id);

-- ============================================
-- AUTO UPDATE UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menus_updated_at
  BEFORE UPDATE ON menus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (Supabase)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Admin can see all data
CREATE POLICY "admin_all_users" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_all_customers" ON customers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_all_menus" ON menus FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_all_menu_items" ON menu_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_all_orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_all_order_items" ON order_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_all_invoices" ON invoices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_all_payments" ON payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_all_payment_logs" ON payment_logs FOR ALL USING (auth.role() = 'service_role');

-- Customers can see their own data
CREATE POLICY "customer_own_orders" ON orders FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "customer_own_order_items" ON order_items FOR ALL USING (
  order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
);
CREATE POLICY "customer_own_invoices" ON invoices FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "customer_own_payments" ON payments FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "customer_view_menus" ON menus FOR SELECT USING (status = 'active');
CREATE POLICY "customer_view_menu_items" ON menu_items FOR SELECT USING (true);

-- Insert admin user function (for setup)
CREATE OR REPLACE FUNCTION create_admin(email TEXT, password TEXT, full_name TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  INSERT INTO users (email, password_hash, full_name, role)
  VALUES (email, crypt(password, gen_salt('bf')), full_name, 'admin')
  RETURNING id INTO user_id;
  RETURN user_id;
END;
$$ LANGUAGE plpgsql;
