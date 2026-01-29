import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { getReviewStats, getLatestReviews } from '@/app/actions/reviews'
import TipButtons from './TipButtons'
import ReviewSection from './ReviewSection'
import SuccessAnimation from './SuccessAnimation'

interface PageProps {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function ProfilePage({ params, searchParams }: PageProps) {
  const { userId } = await params
  const { success, canceled } = await searchParams
  
  const supabase = await createClient()

  // On vérifie si c'est un UUID pour éviter les erreurs SQL si un vieux slug traîne
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
  
  if (!isUUID) {
    notFound()
  }

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (!userData || !userData.stripe_account_id || !userData.stripe_onboarding_complete) {
    notFound()
  }

  const [reviewStats, latestReviews] = await Promise.all([
    getReviewStats(userId),
    getLatestReviews(userId, 3)
  ])

  const displayName = userData.first_name && userData.last_name 
    ? `${userData.first_name} ${userData.last_name}`
    : userData.first_name || 'Utilisateur'

  const initial = userData.first_name?.[0]?.toUpperCase() || userData.email?.[0]?.toUpperCase() || '?'

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col">
      {success && <SuccessAnimation />}
      {canceled && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[350px] bg-black rounded-2xl p-4 text-center shadow-xl z-50 animate-fade-in-up">
          <p className="text-white text-sm">Paiement annulé</p>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center px-5 pt-8 pb-8">
        <div className="w-full max-w-[380px] bg-white rounded-3xl shadow-[0_4px_40px_rgba(0,0,0,0.08)] p-6 mb-6 animate-fade-in-up border border-gray-50">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center ring-4 ring-white shadow-xl">
                {userData.avatar_url ? (
                  <img src={userData.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-gray-400">{initial}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-black mt-4 text-center">{displayName}</h1>
          {userData.job_title && <p className="text-gray-500 text-sm mt-0.5 text-center">{userData.job_title}</p>}

          {reviewStats.count > 0 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-black font-bold text-sm">{reviewStats.average}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500 text-sm">{reviewStats.count} avis</span>
            </div>
          )}

          {userData.bio && <p className="text-gray-400 text-sm text-center mt-4 leading-relaxed">"{userData.bio}"</p>}
        </div>

        <div className="w-full max-w-[380px] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="text-center mb-5">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-medium">Laisser un pourboire</p>
          </div>
          <TipButtons userId={userId} stripeAccountId={userData.stripe_account_id} />
        </div>

        <ReviewSection userId={userId} latestReviews={latestReviews} />
      </main>

      <footer className="py-5 text-center">
        <p className="text-[11px] text-gray-300 tracking-wide">Propulsé par <span className="font-semibold text-gray-400">TapTip</span></p>
      </footer>
    </div>
  )
}
