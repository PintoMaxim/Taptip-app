'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Réclamer un parrainage (Saisie du code par le filleul)
 */
export async function claimReferral(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Non authentifié' }

  // 1. Récupérer les infos de l'utilisateur (filleul)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, stripe_onboarding_complete, referred_by')
    .eq('id', user.id)
    .single()

  if (userError || !userData) return { error: 'Profil introuvable' }

  // 2. Barrière de Sécurité n°1 : Stripe doit être configuré
  if (!userData.stripe_onboarding_complete) {
    return { error: 'Veuillez configurer votre compte Stripe avant de réclamer un parrainage.' }
  }

  // 3. Barrière de Sécurité n°2 : Déjà parrainé ?
  if (userData.referred_by) {
    return { error: 'Vous avez déjà utilisé un code de parrainage.' }
  }

  // 4. Barrière de Sécurité n°3 : Délai de 7 jours
  // On récupère la date d'activation du premier badge de l'utilisateur
  const { data: badgeData } = await supabase
    .from('badges')
    .select('activated_at')
    .eq('user_id', user.id)
    .order('activated_at', { ascending: true })
    .limit(1)
    .single()

  if (!badgeData?.activated_at) {
    return { error: 'Aucun badge activé trouvé.' }
  }

  const activatedAt = new Date(badgeData.activated_at)
  const now = new Date()
  const diffDays = Math.ceil((now.getTime() - activatedAt.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays > 7) {
    return { error: 'Le délai de 7 jours pour réclamer votre parrainage est dépassé.' }
  }

  // 5. Vérifier le parrain (le code)
  const { data: referrer, error: refError } = await supabase
    .from('users')
    .select('id, referral_code')
    .eq('referral_code', code.toUpperCase())
    .single()

  if (refError || !referrer) {
    return { error: 'Code de parrainage invalide.' }
  }

  if (referrer.id === user.id) {
    return { error: 'Vous ne pouvez pas vous parrainer vous-même.' }
  }

  // 6. Validation Finale : Création du parrainage et mise à jour de l'utilisateur
  // On utilise une transaction (via plusieurs appels ici, mais idéalement un RPC Supabase)
  
  // A. Marquer l'utilisateur comme parrainé
  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      referred_by: referrer.id,
      referral_claimed_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (updateError) return { error: 'Erreur lors de la validation.' }

  // B. Créer l'entrée dans la table referrals (les 10€ en attente)
  const { error: insertError } = await supabase
    .from('referrals')
    .insert({
      referrer_id: referrer.id,
      referee_id: user.id,
      status: 'pending',
      amount: 1000 // 10€
    })

  if (insertError) {
    console.error('Erreur insertion referral:', insertError)
    // On pourrait annuler l'update précédent ici si besoin
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}

/**
 * Générer un code de parrainage unique pour un utilisateur
 */
export async function generateUserReferralCode(userId: string, firstName?: string) {
  const supabase = await createClient()
  
  // 1. Essayer de générer un code basé sur le prénom
  let baseCode = firstName ? firstName.toUpperCase().substring(0, 6) : 'TAP'
  // Enlever les caractères spéciaux
  baseCode = baseCode.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "")
  
  let code = `${baseCode}${Math.floor(10 + Math.random() * 89)}` // Ex: MAXIM99
  
  // 2. Vérifier l'unicité
  let isUnique = false
  let attempts = 0
  
  while (!isUnique && attempts < 5) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', code)
      .single()
    
    if (!data) {
      isUnique = true
    } else {
      code = `${baseCode}${Math.floor(10 + Math.random() * 89)}`
      attempts++
    }
  }

  // Si toujours pas unique, générer un code aléatoire complet
  if (!isUnique) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // 3. Mettre à jour l'utilisateur
  await supabase
    .from('users')
    .update({ referral_code: code })
    .eq('id', userId)

  return code
}

/**
 * Récupérer les statistiques de parrainage pour le parrain
 */
export async function getReferralStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Non authentifié' }

  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', user.id)

  if (error) return { error: error.message }

  const stats = {
    pending: referrals.filter(r => r.status === 'pending').reduce((acc, r) => acc + r.amount, 0) / 100,
    available: referrals.filter(r => r.status === 'completed').reduce((acc, r) => acc + r.amount, 0) / 100,
    paid: referrals.filter(r => r.status === 'paid').reduce((acc, r) => acc + r.amount, 0) / 100,
    totalCount: referrals.length
  }

  return { stats, referrals }
}

