'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ReviewData {
  userId: string
  rating: number
  comment?: string
}

// Soumettre un avis
export async function submitReview(data: ReviewData) {
  const supabase = await createClient()

  if (data.rating < 1 || data.rating > 5) {
    return { error: 'Note invalide' }
  }

  const { error } = await supabase
    .from('reviews')
    .insert({
      user_id: data.userId,
      rating: data.rating,
      comment: data.comment || null,
      created_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Erreur création avis:', error)
    return { error: 'Erreur lors de l\'envoi' }
  }

  revalidatePath(`/p/${data.userId}`)
  
  return { success: true }
}

// Récupérer les stats des avis
export async function getReviewStats(userId: string) {
  const supabase = await createClient()

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('user_id', userId)

  if (error || !reviews) {
    return { average: 0, count: 0 }
  }

  if (reviews.length === 0) {
    return { average: 0, count: 0 }
  }

  const total = reviews.reduce((sum, r) => sum + r.rating, 0)
  const average = Math.round((total / reviews.length) * 10) / 10

  return { average, count: reviews.length }
}

// Récupérer les derniers avis
export async function getLatestReviews(userId: string, limit = 3) {
  const supabase = await createClient()

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at')
    .eq('user_id', userId)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erreur récupération avis:', error)
    return []
  }

  return reviews
}
