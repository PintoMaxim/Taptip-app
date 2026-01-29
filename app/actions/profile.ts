'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProfileData {
  first_name: string
  last_name: string
  job_title: string
  bio: string
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié', profile: null }

  const { data: profile, error } = await supabase.from('users').select('*').eq('id', user.id).single()
  return { profile, error: error?.message || null }
}

export async function updateProfile(data: ProfileData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase.from('users').upsert({
    id: user.id,
    email: user.email,
    first_name: data.first_name,
    last_name: data.last_name,
    job_title: data.job_title,
    bio: data.bio,
    updated_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath(`/p/${user.id}`)
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const file = formData.get('avatar') as File
  if (!file || file.size === 0) return { error: 'Aucun fichier' }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/avatar.${fileExt}`

  await supabase.storage.from('avatars').remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`])
  const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { cacheControl: '3600', upsert: true })
  if (uploadError) return { error: 'Erreur upload' }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
  const avatarUrl = `${publicUrl}?v=${Date.now()}`

  await supabase.from('users').update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() }).eq('id', user.id)
  revalidatePath('/dashboard')
  revalidatePath(`/p/${user.id}`)
  return { success: true, url: avatarUrl }
}
