-- Gambar untuk master catalog items
ALTER TABLE catalog_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- menu_items.image_url sudah ada di schema awal
