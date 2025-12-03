-- ============================================
-- TAPTIP - SCHÉMA DE BASE DE DONNÉES SUPABASE
-- ============================================
-- À exécuter dans Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

-- ============================================
-- TABLE: users (mise à jour si elle existe déjà)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  job_title TEXT,
  bio TEXT,
  avatar_url TEXT,
  stripe_account_id TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche par email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs peuvent voir/modifier leur propre profil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique: tout le monde peut voir les profils publics (pour /p/[userId])
CREATE POLICY "Public profiles are viewable" ON users
  FOR SELECT USING (stripe_onboarding_complete = TRUE);

-- ============================================
-- TABLE: badges (NOUVEAU)
-- ============================================
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(12) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index pour recherche rapide par code
CREATE INDEX idx_badges_code ON badges(code);
CREATE INDEX idx_badges_user_id ON badges(user_id);

-- RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Politique: tout le monde peut lire les badges (pour vérifier si activé)
CREATE POLICY "Badges are publicly readable" ON badges
  FOR SELECT USING (TRUE);

-- Politique: seul l'admin peut créer des badges
CREATE POLICY "Admin can create badges" ON badges
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = 'contact.taptip@gmail.com'
  );

-- Politique: les utilisateurs peuvent activer un badge (update user_id)
CREATE POLICY "Users can activate badges" ON badges
  FOR UPDATE USING (
    user_id IS NULL OR auth.uid() = user_id
  );

-- ============================================
-- TABLE: tips (pourboires)
-- ============================================
CREATE TABLE IF NOT EXISTS tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Montant en centimes
  stripe_payment_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tips_user_id ON tips(user_id);
CREATE INDEX IF NOT EXISTS idx_tips_created_at ON tips(created_at);

-- RLS
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs peuvent voir leurs propres pourboires
CREATE POLICY "Users can view own tips" ON tips
  FOR SELECT USING (auth.uid() = user_id);

-- Politique: le service (webhook) peut insérer des pourboires
CREATE POLICY "Service can insert tips" ON tips
  FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- TABLE: reviews (avis)
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Politique: tout le monde peut voir les avis
CREATE POLICY "Reviews are publicly readable" ON reviews
  FOR SELECT USING (TRUE);

-- Politique: tout le monde peut créer un avis (anonyme)
CREATE POLICY "Anyone can create reviews" ON reviews
  FOR INSERT WITH CHECK (TRUE);

-- ============================================
-- STORAGE: bucket pour les avatars
-- ============================================
-- À créer manuellement dans Supabase Dashboard:
-- Storage > New Bucket > "avatars" (public)

-- ============================================
-- FIN DU SCHÉMA
-- ============================================

