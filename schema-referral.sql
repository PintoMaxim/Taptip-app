-- Mise à jour pour le système de parrainage
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Index pour accélérer la recherche par code de parrainage
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

