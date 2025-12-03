-- ============================================
-- TAPTIP - SCRIPT DE RÉPARATION
-- ============================================

-- Supprimer la table badges si elle existe (pour repartir proprement)
DROP TABLE IF EXISTS badges CASCADE;

-- Créer la table badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(12) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Index pour recherche rapide
CREATE INDEX idx_badges_code ON badges(code);
CREATE INDEX idx_badges_user_id ON badges(user_id);

-- Activer RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Policies pour badges
CREATE POLICY "Badges are publicly readable" ON badges
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin can create badges" ON badges
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Users can activate badges" ON badges
  FOR UPDATE USING (TRUE);

-- ============================================
-- TABLE TIPS (si n'existe pas déjà)
-- ============================================
CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  stripe_payment_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tips_user_id ON tips(user_id);
CREATE INDEX IF NOT EXISTS idx_tips_created_at ON tips(created_at);

ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tips" ON tips;
DROP POLICY IF EXISTS "Service can insert tips" ON tips;

CREATE POLICY "Users can view own tips" ON tips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert tips" ON tips
  FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- TABLE REVIEWS (si n'existe pas déjà)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are publicly readable" ON reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON reviews;

CREATE POLICY "Reviews are publicly readable" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can create reviews" ON reviews
  FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- TERMINÉ !
-- ============================================

