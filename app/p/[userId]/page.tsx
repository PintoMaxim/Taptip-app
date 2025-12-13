import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { getReviewStats } from '@/app/actions/reviews'
import TipButtons from './TipButtons'
import ReviewSection from './ReviewSection'

interface PageProps {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { userId } = await params
  const { success, canceled } = await searchParams
  
  const supabase = await createClient()

  // Récupérer les infos de l'utilisateur
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  // Vérifier si l'utilisateur existe ET a configuré Stripe
  if (!userData || !userData.stripe_account_id || !userData.stripe_onboarding_complete) {
    notFound()
  }

  // Récupérer les stats des avis
  const reviewStats = await getReviewStats(userId)

  // Construire le nom d'affichage
  const displayName = userData.first_name && userData.last_name 
    ? `${userData.first_name} ${userData.last_name}`
    : userData.first_name || 'Utilisateur'

  // Initiale pour l'avatar
  const initial = userData.first_name?.[0]?.toUpperCase() || userData.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Message de succès */}
      {success && (
        <div className="fixed top-4 left-4 right-4 bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center shadow-lg z-50 animate-in fade-in slide-in-from-top duration-300">
          <span className="text-3xl">🎉</span>
          <p className="text-green-700 font-semibold mt-2">Merci pour votre pourboire !</p>
        </div>
      )}

      {/* Message d'annulation */}
      {canceled && (
        <div className="fixed top-4 left-4 right-4 bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-center z-50">
          <p className="text-gray-600">Paiement annulé</p>
        </div>
      )}

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Avatar */}
        <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-xl border-4 border-white">
          {userData.avatar_url ? (
            <img
              src={userData.avatar_url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-bold text-gray-400">
              {initial}
            </span>
          )}
        </div>

        {/* Nom */}
        <h1 className="text-2xl font-bold text-black mt-5 text-center">
          {displayName}
        </h1>

        {/* Métier */}
        {userData.job_title && (
          <p className="text-gray-500 text-base mt-1">
            {userData.job_title}
          </p>
        )}

        {/* Note et avis */}
        {reviewStats.count > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-black font-semibold">{reviewStats.average}</span>
            <span className="text-gray-400 text-sm">/5</span>
            <span className="text-gray-300 mx-1">•</span>
            <span className="text-gray-500 text-sm">{reviewStats.count} avis</span>
          </div>
        )}

        {/* Bio */}
        {userData.bio && (
          <p className="text-gray-400 text-sm text-center max-w-xs mt-4 leading-relaxed italic">
            &ldquo;{userData.bio}&rdquo;
          </p>
        )}

        {/* Boutons de pourboire */}
        <div className="mt-8 w-full max-w-xs">
          <TipButtons 
            userId={userId} 
            stripeAccountId={userData.stripe_account_id} 
          />
        </div>

        {/* Section Avis */}
        <ReviewSection userId={userId} />
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-gray-300">
          Propulsé par <span className="font-bold text-gray-400">TapTip</span>
        </p>
      </footer>
    </div>
  )
}
