import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getUserStats, getActivity } from '@/app/actions/stats'
import { getProfile } from '@/app/actions/profile'
import { checkStripeStatus } from '@/app/actions/stripe'
import ShareButton from './ShareButton'
import ActivityList from './ActivityList'
import Link from 'next/link'
import Image from 'next/image'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [profileResult, stripeStatus, stats, activities] = await Promise.all([
    getProfile(),
    checkStripeStatus(),
    getUserStats(user.id),
    getActivity(user.id, 10),
  ])

  const profile = profileResult.profile
  const firstName = profile?.first_name || 'Utilisateur'

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= Math.round(rating) ? 'text-white' : 'text-gray-600'}>
          ★
        </span>
      )
    }
    return stars
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Container mobile fixe */}
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {/* Header */}
        <header className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              priority
            />
            <span className="text-base font-semibold text-black">
              Bonjour, {firstName}
            </span>
          </div>
          
          <Link href="/dashboard/profile" className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-sm font-bold">
                  {firstName[0]}
                </span>
              </div>
            )}
          </Link>
        </header>

        <main className="px-5 py-5 space-y-5">
          {/* Carte Stats */}
          <div className="bg-black rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-10">
              <Image
                src="/logo.png"
                alt=""
                width={80}
                height={80}
                className="invert"
              />
            </div>

            <div className="relative z-10">
              <p className="text-gray-400 text-xs mb-1">Total reçu</p>
              <p className="text-3xl font-bold mb-5">
                {stats.totalReceived.toFixed(2)}€
              </p>

              <div className="flex gap-6">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Note moyenne</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold">{stats.averageRating || '-'}</span>
                    <div className="flex text-xs">
                      {renderStars(stats.averageRating)}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">Avis reçus</p>
                  <span className="text-lg font-bold">{stats.reviewCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <ShareButton userId={user.id} />
            
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-16 flex flex-col items-center justify-center gap-1 bg-gray-50 rounded-xl border border-gray-100 active:scale-[0.98] transition-transform"
            >
              <span className="text-xl">💳</span>
              <span className="text-xs font-medium text-black">Virements</span>
            </a>
          </div>

          {/* Alerte Stripe */}
          {!stripeStatus.isComplete && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-base">⚡</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-black">Configurez vos paiements</p>
                  <p className="text-[10px] text-gray-500">Pour recevoir des pourboires</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded-lg"
                >
                  Configurer
                </Link>
              </div>
            </div>
          )}

          {/* Activité */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-black">Activité récente</h2>
              {activities.length > 0 && (
                <button className="text-xs text-gray-400">Tout voir</button>
              )}
            </div>
            
            <ActivityList activities={activities} />
          </section>

          {/* Paramètres */}
          <Link
            href="/dashboard/settings"
            className="block w-full text-center py-3 text-gray-400 text-xs"
          >
            ⚙️ Paramètres
          </Link>
        </main>
      </div>
    </div>
  )
}
