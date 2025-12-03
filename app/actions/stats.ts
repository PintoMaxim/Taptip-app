'use server'

import { createClient } from '@/utils/supabase/server'

export interface TipHistory {
  id: string
  amount: number
  created_at: string
}

export interface ReviewHistory {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

// Récupérer les stats de l'utilisateur
export async function getUserStats(userId: string) {
  const supabase = await createClient()

  // Récupérer tous les pourboires reçus
  const { data: tips } = await supabase
    .from('tips')
    .select('amount')
    .eq('user_id', userId)

  // Calculer le total
  const totalReceived = tips?.reduce((sum, tip) => sum + tip.amount, 0) || 0

  // Récupérer les avis
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('user_id', userId)

  const reviewCount = reviews?.length || 0
  const averageRating = reviewCount > 0
    ? Math.round((reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
    : 0

  return {
    totalReceived: totalReceived / 100, // Convertir en euros
    reviewCount,
    averageRating,
  }
}

// Récupérer l'historique des pourboires
export async function getTipHistory(userId: string, limit = 10) {
  const supabase = await createClient()

  const { data: tips } = await supabase
    .from('tips')
    .select('id, amount, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return tips || []
}

// Récupérer l'historique des avis
export async function getReviewHistory(userId: string, limit = 10) {
  const supabase = await createClient()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return reviews || []
}

// Récupérer l'activité combinée (pourboires + avis)
export async function getActivity(userId: string, limit = 10) {
  const [tips, reviews] = await Promise.all([
    getTipHistory(userId, limit),
    getReviewHistory(userId, limit),
  ])

  // Combiner et trier par date
  const activity = [
    ...tips.map(tip => ({
      id: tip.id,
      type: 'tip' as const,
      amount: tip.amount / 100,
      created_at: tip.created_at,
    })),
    ...reviews.map(review => ({
      id: review.id,
      type: 'review' as const,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return activity.slice(0, limit)
}

