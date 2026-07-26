-- ============================================================================
-- Migration: 20260101000000_initial_schema
-- Description: Initial schema — profiles, categories, transactions, RLS, trigger, seed
-- ============================================================================

-- 0. ENUMS -------------------------------------------------------------------
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- 1. TABLES ------------------------------------------------------------------

CREATE TABLE profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  avatar_url  TEXT,
  currency    TEXT DEFAULT 'MMK' CHECK (char_length(currency) = 3),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        transaction_type NOT NULL,
  icon        TEXT,
  color       TEXT,
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_user_category_name UNIQUE (user_id, name)
);

CREATE TABLE transactions (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount            NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type              transaction_type NOT NULL,
  payment_method    TEXT DEFAULT 'Cash',
  description       TEXT,
  receipt_url       TEXT,
  transaction_date  TIMESTAMPTZ DEFAULT NOW(),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INDEXES -----------------------------------------------------------------

CREATE INDEX idx_categories_user_id      ON categories(user_id);
CREATE INDEX idx_categories_type         ON categories(type);
CREATE INDEX idx_transactions_user_id    ON transactions(user_id);
CREATE INDEX idx_transactions_date       ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type       ON transactions(type);
CREATE INDEX idx_transactions_category   ON transactions(category_id);
CREATE INDEX idx_transactions_description_fts
  ON transactions USING GIN (to_tsvector('english', COALESCE(description, '')));

-- 3. ROW LEVEL SECURITY ------------------------------------------------------

-- 3a. profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- 3b. categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id AND is_default = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id AND is_default = FALSE);

-- 3c. transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- 4. AUTO-PROFILE TRIGGER ----------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. SEED DATA — Default categories ------------------------------------------
-- These rows have user_id = NULL so every authenticated user can see them
-- via the RLS policy (auth.uid() = user_id OR user_id IS NULL).

INSERT INTO categories (name, type, icon, color, is_default) VALUES
  -- Expense categories
  ('Food & Dining',      'expense', '🍽️', '#FF6B6B', TRUE),
  ('Transportation',      'expense', '🚗', '#4ECDC4', TRUE),
  ('Utilities',          'expense', '💡', '#45B7D1', TRUE),
  ('Shopping',           'expense', '🛍️', '#96CEB4', TRUE),
  ('Entertainment',      'expense', '🎬', '#FFEAA7', TRUE),
  ('Health',             'expense', '💊', '#DDA0DD', TRUE),
  ('Education',          'expense', '📚', '#98D8C8', TRUE),
  ('Housing',            'expense', '🏠', '#F7DC6F', TRUE),
  ('Insurance',          'expense', '🛡️', '#BB8FCE', TRUE),
  ('Subscriptions',      'expense', '📋', '#85C1E9', TRUE),
  -- Income categories
  ('Salary',             'income',  '💰', '#2ECC71', TRUE),
  ('Freelance',          'income',  '💻', '#3498DB', TRUE),
  ('Investments',        'income',  '📈', '#9B59B6', TRUE),
  ('Gifts',              'income',  '🎁', '#E74C3C', TRUE),
  ('Refunds',            'income',  '↩️', '#1ABC9C', TRUE),
  ('Rental Income',      'income',  '🏘️', '#E67E22', TRUE),
  ('Business',           'income',  '🏢', '#2C3E50', TRUE);
