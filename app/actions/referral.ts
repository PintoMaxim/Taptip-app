'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Réclamer un parrainage (Saisie du code par le filleul)
 */
export async function claimReferral(code: string) {
  return { error: 'Le programme de parrainage est temporairement désactivé.' }
  /*
  const supabase = await createClient()
  // ... rest of the code
  */
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
  return { stats: { pending: 0, available: 0, paid: 0, totalCount: 0 }, referrals: [] }
  /*
  const supabase = await createClient()
  // ... rest of the code
  */
}

