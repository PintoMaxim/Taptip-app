-- ============================================
-- TAPTIP - SCHÉMA DE BASE DE DONNÉES
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- ============================================
-- TABLE: users (mise à jour si nécessaire)
-- ============================================
-- Cette table devrait déjà exister, mais voici la structure complète

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  job_title VARCHAR(100),
  bio TEXT,
  avatar_url TEXT,
  stripe_account_id VARCHAR(255),
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: badges
-- ============================================
-- Stocke les badges NFC avec leur code unique

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(12) UNIQUE NOT NULL,           -- Code unique du badge (ex: K7XM4PQ9WN2F)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- NULL = non activé
  activated_at TIMESTAMPTZ,                   -- Date d'activation
  created_at TIMESTAMPTZ DEFAULT NOW(),       -- Date de création
  created_by UUID REFERENCES users(id)        -- Admin qui a créé le badge
);

-- Index pour recherche rapide par code
CREATE INDEX IF NOT EXISTS idx_badges_code ON badges(code);

-- Index pour trouver les badges d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);

-- ============================================
-- TABLE: tips (pourboires)
-- ============================================
-- Stocke tous les pourboires reçus

CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Qui reçoit le pourboire
  amount INTEGER NOT NULL,                    -- Montant en centimes
  stripe_payment_intent_id VARCHAR(255),      -- ID du paiement Stripe
  stripe_session_id VARCHAR(255),             -- ID de la session Checkout
  status VARCHAR(50) DEFAULT 'completed',     -- completed, refunded, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les stats d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_tips_user_id ON tips(user_id);

-- ============================================
-- TABLE: reviews (avis)
-- ============================================
-- Stocke les avis laissés aux utilisateurs

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- Qui reçoit l'avis
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),   -- Note de 1 à 5
  comment TEXT,                               -- Commentaire optionnel
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les avis d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- ============================================
-- TABLE: admins
-- ============================================
-- Liste des emails autorisés à accéder à /admin

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter l'admin principal
INSERT INTO admins (email) VALUES ('contact.taptip@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Policies pour users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Policies pour badges
CREATE POLICY "Admins can manage badges" ON badges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Users can activate badges" ON badges
  FOR UPDATE USING (user_id IS NULL OR auth.uid() = user_id);

-- Policies pour tips
CREATE POLICY "Users can view their own tips" ON tips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert tips" ON tips
  FOR INSERT WITH CHECK (true);

-- Policies pour reviews
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- Policies pour admins
CREATE POLICY "Admins can view admin list" ON admins
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')
  );

-- ============================================
-- STORAGE BUCKET (pour les avatars)
-- ============================================
-- À exécuter séparément dans Supabase Storage

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT DO NOTHING;

