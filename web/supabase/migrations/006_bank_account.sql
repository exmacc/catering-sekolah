-- Rekening pembayaran transfer
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
