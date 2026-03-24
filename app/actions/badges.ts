'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

function generateBadgeCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += Math.floor(10 + Math.random() * 89)
  return code
}

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const adminEmail = process.env.ADMIN_EMAIL || 'contact.taptip@gmail.com'
  return user.email === adminEmail
}

export async function createBadges(count: number) {
  if (!(await isAdmin())) return { error: 'Non autorisé' }
  if (count < 1 || count > 100) return { error: 'Nombre de badges invalide (1-100)' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const badges = []
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  for (let i = 0; i < count; i++) {
    let badgeCode = generateBadgeCode()
    let referralCode = generateReferralCode()
    badges.push({
      code: badgeCode,
      referral_code: referralCode,
      created_by: user?.id,
      status: 'available'
    })
  }

  const { data, error } = await supabase.from('badges').insert(badges).select()
  if (error) return { error: 'Erreur lors de la création des badges' }

  revalidatePath('/admin/badges')
  return { badges: data.map(b => ({ ...b, url: `${baseUrl}/b/${b.code}` })) }
}

export async function getAllBadges() {
  if (!(await isAdmin())) return { error: 'Non autorisé', badges: [] }
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const { data: badges, error } = await supabase
    .from('badges')
    .select('*, users(first_name, last_name, email)')
    .order('created_at', { ascending: false })

  if (error) return { error: 'Erreur lors de la récupération', badges: [] }
  
  return { 
    badges: badges.map(b => ({ 
      ...b, 
      url: `${baseUrl}/b/${b.code}`, 
      isActivated: !!b.user_id 
    })) 
  }
}

export async function updateBadgeStatus(code: string, status: 'available' | 'pending') {
  if (!(await isAdmin())) return { error: 'Non autorisé' }
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('badges')
    .update({ status })
    .eq('code', code.toUpperCase())

  if (error) return { error: 'Erreur lors de la mise à jour' }
  
  revalidatePath('/admin/badges')
  return { success: true }
}

export async function getBadgeByCode(code: string) {
  const supabase = await createClient()
  const { data: badge, error } = await supabase.from('badges').select('*, users(id, first_name, last_name, stripe_onboarding_complete)').eq('code', code.toUpperCase()).single()
  if (error || !badge) return { error: 'Badge non trouvé', badge: null }
  return { badge }
}

export async function activateBadge(code: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { data: badge } = await supabase.from('badges').select('id, user_id, referral_code').eq('code', code.toUpperCase()).single()
  if (!badge) return { error: 'Badge non trouvé' }
  if (badge.user_id) return { error: 'Ce badge est déjà activé' }

  const { error } = await supabase.from('badges').update({ 
    user_id: user.id, 
    activated_at: new Date().toISOString(),
    status: 'activated'
  }).eq('code', code.toUpperCase())
  
  if (error) return { error: 'Erreur lors de l\'activation' }

  revalidatePath(`/b/${code}`)
  revalidatePath('/admin/badges')
  return { success: true }
}

export async function getBadgeStats() {
  if (!(await isAdmin())) return { error: 'Non autorisé' }
  const supabase = await createClient()
  const { data: badges } = await supabase.from('badges').select('status, user_id')
  
  if (!badges) return { total: 0, activated: 0, pending: 0, available: 0 }

  const total = badges.length
  const activated = badges.filter(b => b.user_id || b.status === 'activated').length
  const pending = badges.filter(b => b.status === 'pending' && !b.user_id).length
  const available = badges.filter(b => (b.status === 'available' || !b.status) && !b.user_id).length

  return { total, activated, pending, available }
}
