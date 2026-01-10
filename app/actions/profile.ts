'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProfileData {
  first_name: string
  last_name: string
  job_title: string
  bio: string
}

// Récupérer le profil de l'utilisateur connecté
export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié', profile: null }
  }

  let { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return { error: error.message, profile: null }
  }

  // Si l'utilisateur n'a pas encore de code de parrainage, on lui en génère un
  if (profile && !profile.referral_code) {
    const code = await generateReferralCode(profile.first_name || 'TIP')
    const { data: updatedProfile } = await supabase
      .from('users')
      .update({ referral_code: code })
      .eq('id', user.id)
      .select()
      .single()
    
    if (updatedProfile) profile = updatedProfile
  }

  return { profile, error: null }
}

// Génère un code de parrainage unique basé sur le prénom ou aléatoire
async function generateReferralCode(firstName?: string): Promise<string> {
  const supabase = await createClient()
  const base = (firstName || 'TIP').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
  
  let code = base
  let exists = true
  let attempts = 0

  while (exists && attempts < 10) {
    if (attempts > 0) {
      code = `${base}${Math.floor(Math.random() * 999)}`
    }
    
    const { data } = await supabase
      .from('users')
      .select('referral_code')
      .eq('referral_code', code)
      .single()
    
    if (!data) exists = false
    attempts++
  }
  
  return code
}

// Mettre à jour le profil
export async function updateProfile(data: ProfileData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email,
      first_name: data.first_name,
      last_name: data.last_name,
      job_title: data.job_title,
      bio: data.bio,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Erreur mise à jour profil:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/p/${user.id}`)
  
  return { success: true }
}

// Upload de l'avatar
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const file = formData.get('avatar') as File
  
  if (!file || file.size === 0) {
    return { error: 'Aucun fichier sélectionné' }
  }

  // Vérifier le type de fichier
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }
  }

  // Vérifier la taille (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { error: 'Image trop lourde. Maximum 2MB.' }
  }

  // Générer un nom de fichier unique
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/avatar.${fileExt}`

  // Supprimer l'ancien avatar s'il existe
  await supabase.storage
    .from('avatars')
    .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`])

  // Upload du nouveau fichier
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Erreur upload:', uploadError)
    return { error: 'Erreur lors de l\'upload' }
  }

  // Récupérer l'URL publique avec timestamp pour éviter le cache
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Ajouter un timestamp à l'URL pour forcer le rafraîchissement du cache
  const avatarUrlWithCache = `${publicUrl}?v=${Date.now()}`

  // Mettre à jour SEULEMENT l'avatar_url (pas upsert qui écrase tout)
  const { error: updateError } = await supabase
    .from('users')
    .update({
      avatar_url: avatarUrlWithCache,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Erreur mise à jour avatar_url:', updateError)
    return { error: 'Erreur lors de la sauvegarde' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  revalidatePath(`/p/${user.id}`)

  return { success: true, url: avatarUrlWithCache }
}

