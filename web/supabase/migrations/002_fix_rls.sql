-- Fix RLS: allow public read for menus & menu_items
-- Allow authenticated users to read their own users/customers row

DROP POLICY IF EXISTS "customer_view_menus" ON menus;
DROP POLICY IF EXISTS "customer_view_menu_items" ON menu_items;

CREATE POLICY "public_view_active_menus" ON menus
  FOR SELECT USING (status = 'active');

CREATE POLICY "public_view_menu_items" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "customers_read_own" ON customers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "customers_update_own" ON customers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "customers_insert_own" ON customers
  FOR INSERT WITH CHECK (auth.uid() = id);
