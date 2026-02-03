-- Add promo code support to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'stripe';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_description TEXT;

-- Index for promo code usage tracking
CREATE INDEX IF NOT EXISTS idx_orders_promo_code ON orders(promo_code) WHERE promo_code IS NOT NULL;

COMMENT ON COLUMN orders.payment_type IS 'Payment method: stripe, promo, etc.';
COMMENT ON COLUMN orders.promo_code IS 'Promo code used if payment_type is promo';
