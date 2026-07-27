-- Jadwal kirim tagihan otomatis (setup admin)
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS billing_auto_enabled BOOLEAN DEFAULT false;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS billing_daily_time TEXT DEFAULT '18:00';
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS billing_weekly_day INTEGER DEFAULT 5; -- 0=Min ... 5=Jum
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS billing_monthly_day INTEGER DEFAULT 1; -- tanggal 1-28
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS billing_wa_template TEXT;

-- Tracking kirim tagihan
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_period TEXT CHECK (payment_period IN ('daily', 'weekly', 'monthly'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS wa_sent_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS wa_phone TEXT;
