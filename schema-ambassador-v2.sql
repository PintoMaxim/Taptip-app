-- MISE À JOUR : SYSTÈME AMBASSADEUR PREMIUM

-- 0. Ajouter la colonne referral_code à la table badges
-- Chaque badge a son propre code de parrainage pré-généré
ALTER TABLE badges
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_badges_referral_code ON badges(referral_code);

-- 1. Mise à jour de la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS referral_claimed_at TIMESTAMPTZ; -- Pour savoir quand il a saisi le code

-- 2. Table des parrainages (Le Grand Livre)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id), -- Celui qui gagne 10€
  referee_id UUID NOT NULL REFERENCES users(id),  -- Celui qui a été parrainé
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'paid')),
  amount INTEGER DEFAULT 1000, -- 1000 centimes = 10€
  created_at TIMESTAMPTZ DEFAULT NOW(),
  available_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'), -- Sécurité 14 jours
  stripe_transfer_id TEXT, -- Pour la traçabilité du paiement
  UNIQUE(referee_id) -- Un filleul ne peut être parrainé qu'une fois
);

-- 3. Index pour la performance
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- 4. RLS (Sécurité)
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Policy SELECT : Parrain ET Filleul peuvent voir leurs parrainages
CREATE POLICY "Users can view their referrals" ON referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

-- Policy INSERT : Nécessaire pour créer des parrainages
CREATE POLICY "Authenticated users can insert referrals" ON referrals
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

