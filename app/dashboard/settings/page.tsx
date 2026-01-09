import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkStripeStatus } from '@/app/actions/stripe'
import { getProfile } from '@/app/actions/profile'
import { getReferralStats } from '@/app/actions/referral'
import ReferralClaim from './ReferralClaim'
import ReferralCard from '../ReferralCard'
import StripeConnectButton from '../StripeConnectButton'
import LogoutButton from '../LogoutButton'
import BottomNav from '../BottomNav'
import Link from 'next/link'
import Image from 'next/image'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [stripeStatus, profileResult, referralData] = await Promise.all([
    checkStripeStatus(),
    getProfile(),
    getReferralStats()
  ])

  const profile = profileResult.profile
  const referralCode = profile?.referral_code || ''
  const referralCount = referralData.stats?.totalCount || 0
  const pendingAmount = referralData.stats?.pending || 0
  const availableAmount = referralData.stats?.available || 0

  // Récupérer la date du premier badge activé pour le délai de 7 jours
  const { data: firstBadge } = await supabase
    .from('badges')
    .select('activated_at')
    .eq('user_id', user.id)
    .order('activated_at', { ascending: true })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-white flex justify-center">
      {/* Container mobile fixe */}
      <div className="w-full max-w-[390px] min-h-screen bg-white">
        {/* Header */}
        <header className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
          <Image
            src="/logo.png"
            alt="Logo"
            width={28}
            height={28}
          />
          <h1 className="text-base font-semibold text-black">Paramètres</h1>
        </header>

        <main className="px-5 py-5 space-y-5">
          {/* Section Parrainage */}
          <section>
            <h2 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Parrainage
            </h2>
            
            {/* Carte Parrain : SEULEMENT si Stripe est configuré */}
            {referralCode && stripeStatus.isComplete && (
              <div className="mb-3">
                <ReferralCard 
                  referralCode={referralCode} 
                  referralCount={referralCount}
                  pendingAmount={pendingAmount}
                  availableAmount={availableAmount}
                />
              </div>
            )}
            
            {/* Formulaire Filleul (avec cadenas si Stripe pas configuré) */}
            <ReferralClaim 
              isStripeComplete={stripeStatus.isComplete}
              hasAlreadyClaimed={!!profile?.referred_by}
              firstBadgeActivationDate={firstBadge?.activated_at}
            />
          </section>

          {/* Section Paiements */}
          <section>
            <h2 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Paiements
            </h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                  <span className="text-white text-base">💳</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">Stripe Connect</p>
                  <p className="text-[10px] text-gray-400">
                    {stripeStatus.isComplete 
                      ? 'Compte connecté' 
                      : 'Non configuré'}
                  </p>
                </div>
                {stripeStatus.isComplete ? (
                  <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-gray-200 text-black text-xs font-medium rounded-lg"
                  >
                    Gérer
                  </a>
                ) : (
                  <StripeConnectButton />
                )}
              </div>
            </div>
          </section>

          {/* Section Profil */}
          <section>
            <h2 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Profil
            </h2>
            <Link
              href="/dashboard/profile"
              className="block bg-gray-50 rounded-xl p-4 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">Modifier mon profil</p>
                  <p className="text-[10px] text-gray-400">Photo, nom, métier...</p>
                </div>
                <span className="text-gray-300 text-sm">→</span>
              </div>
            </Link>
          </section>

          {/* Section Compte */}
          <section>
            <h2 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Compte
            </h2>
            <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
              <div className="p-4">
                <p className="text-sm font-medium text-black">Email</p>
                <p className="text-[10px] text-gray-400">{user.email}</p>
              </div>
              <div className="p-4">
                <LogoutButton />
              </div>
            </div>
          </section>

          {/* Section Admin (seulement pour l'admin) */}
          {user.email === (process.env.ADMIN_EMAIL || 'contact.taptip@gmail.com') && (
            <section>
              <h2 className="text-[10px] text-yellow-600 uppercase tracking-wider mb-2 ml-1">
                Administration
              </h2>
              <Link
                href="/admin/badges"
                className="block bg-yellow-50 border border-yellow-200 rounded-xl p-4 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-black">🏷️ Gestion des badges</p>
                    <p className="text-[10px] text-gray-500">Générer et suivre les badges NFC</p>
                  </div>
                  <span className="text-yellow-500 text-sm">→</span>
                </div>
              </Link>
            </section>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] text-gray-300 pt-4">
            TapTip v1.0
          </p>

          {/* Espace pour la barre de navigation */}
          <div className="h-20" />
        </main>

        {/* Barre de navigation */}
        <BottomNav />
      </div>
    </div>
  )
}
