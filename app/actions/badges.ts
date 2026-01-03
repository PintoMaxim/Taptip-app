'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Génère un code unique de 12 caractères (A-Z, 0-9)
function generateBadgeCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Génère un code de parrainage unique (6 caractères + 2 chiffres)
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // Sans I, O pour éviter confusion
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += Math.floor(10 + Math.random() * 89) // 2 chiffres (10-99)
  return code
}

// Vérifie si l'utilisateur est admin
async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false
  
  const adminEmail = process.env.ADMIN_EMAIL || 'contact.taptip@gmail.com'
  return user.email === adminEmail
}

// Crée plusieurs badges d'un coup
export async function createBadges(count: number) {
  // Vérifier que l'utilisateur est admin
  if (!(await isAdmin())) {
    return { error: 'Non autorisé' }
  }

  if (count < 1 || count > 100) {
    return { error: 'Nombre de badges invalide (1-100)' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const badges = []
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  // Générer les codes uniques (badge + parrainage)
  for (let i = 0; i < count; i++) {
    let badgeCode = generateBadgeCode()
    let referralCode = generateReferralCode()
    let attempts = 0
    
    // S'assurer que le code badge est unique
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('badges')
        .select('code')
        .eq('code', badgeCode)
        .single()
      
      if (!existing) break
      
      badgeCode = generateBadgeCode()
      attempts++
    }

    // S'assurer que le code parrainage est unique
    attempts = 0
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from('badges')
        .select('referral_code')
        .eq('referral_code', referralCode)
        .single()
      
      if (!existing) break
      
      referralCode = generateReferralCode()
      attempts++
    }

    badges.push({
      code: badgeCode,
      referral_code: referralCode,
      created_by: user?.id,
    })
  }

  // Insérer tous les badges
  const { data, error } = await supabase
    .from('badges')
    .insert(badges)
    .select()

  if (error) {
    console.error('Erreur création badges:', error)
    return { error: 'Erreur lors de la création des badges' }
  }

  // Formater les résultats avec les URLs
  const result = data.map(badge => ({
    id: badge.id,
    code: badge.code,
    referral_code: badge.referral_code,
    url: `${baseUrl}/b/${badge.code}`,
    created_at: badge.created_at,
  }))

  revalidatePath('/admin/badges')
  
  return { badges: result }
}

// Récupère tous les badges (pour l'admin)
export async function getAllBadges() {
  if (!(await isAdmin())) {
    return { error: 'Non autorisé', badges: [] }
  }

  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const { data: badges, error } = await supabase
    .from('badges')
    .select(`
      id,
      code,
      referral_code,
      user_id,
      activated_at,
      created_at,
      users (
        first_name,
        last_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur récupération badges:', error)
    return { error: 'Erreur lors de la récupération', badges: [] }
  }

  const result = badges.map(badge => ({
    ...badge,
    url: `${baseUrl}/b/${badge.code}`,
    isActivated: !!badge.user_id,
  }))

  return { badges: result }
}

// Récupère un badge par son code
export async function getBadgeByCode(code: string) {
  const supabase = await createClient()

  const { data: badge, error } = await supabase
    .from('badges')
    .select(`
      id,
      code,
      user_id,
      activated_at,
      users (
        id,
        first_name,
        last_name,
        stripe_onboarding_complete
      )
    `)
    .eq('code', code.toUpperCase())
    .single()

  if (error || !badge) {
    return { error: 'Badge non trouvé', badge: null }
  }

  return { badge }
}

// Active un badge pour l'utilisateur connecté
export async function activateBadge(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Vérifier que le badge existe et n'est pas déjà activé
  const { data: badge } = await supabase
    .from('badges')
    .select('id, user_id, referral_code')
    .eq('code', code.toUpperCase())
    .single()

  if (!badge) {
    return { error: 'Badge non trouvé' }
  }

  if (badge.user_id) {
    return { error: 'Ce badge est déjà activé' }
  }

  // Activer le badge
  const { error } = await supabase
    .from('badges')
    .update({
      user_id: user.id,
      activated_at: new Date().toISOString(),
    })
    .eq('code', code.toUpperCase())

  if (error) {
    console.error('Erreur activation badge:', error)
    return { error: 'Erreur lors de l\'activation' }
  }

  // Créer/mettre à jour le profil utilisateur avec le code de parrainage du badge
  await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      referral_code: badge.referral_code, // Le code du badge est transféré à l'utilisateur
      updated_at: new Date().toISOString(),
    })

  revalidatePath(`/b/${code}`)
  
  return { success: true }
}

// Récupère les stats des badges (pour l'admin)
export async function getBadgeStats() {
  if (!(await isAdmin())) {
    return { error: 'Non autorisé' }
  }

  const supabase = await createClient()

  const { data: badges } = await supabase
    .from('badges')
    .select('id, user_id')

  const total = badges?.length || 0
  const activated = badges?.filter(b => b.user_id).length || 0
  const available = total - activated

  return {
    total,
    activated,
    available,
  }
}
