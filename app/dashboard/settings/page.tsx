import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { checkStripeStatus } from '@/app/actions/stripe'
import { getProfile } from '@/app/actions/profile'
import StripeConnectButton from '../StripeConnectButton'
import LogoutButton from '../LogoutButton'
import BottomNav from '../BottomNav'
import CopyProfileLink from './CopyProfileLink'
import Link from 'next/link'
import Image from 'next/image'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [stripeStatus, profileResult] = await Promise.all([
    checkStripeStatus(),
    getProfile()
  ])

  const profile = profileResult.profile
  const referralCode = profile?.referral_code || ''

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
          {/* Section Paiements */}
          <section>
            <h2 className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Paiements
            </h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
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
              {!stripeStatus.isComplete && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                    <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center bg-blue-600 text-white rounded-full text-[10px]">?</span>
                      Guide d'activation rapide
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <span className="text-blue-600 font-bold text-xs mt-0.5">1.</span>
                        <div>
                          <p className="text-[11px] font-bold text-blue-900 mb-0.5">Type de structure</p>
                          <p className="text-[10px] text-blue-700 leading-relaxed">Choisissez <span className="font-bold">"Particulier"</span> ou <span className="font-bold">"Entreprise individuelle"</span>. Pas besoin de SIRET pour débuter.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-blue-600 font-bold text-xs mt-0.5">2.</span>
                        <div>
                          <p className="text-[11px] font-bold text-blue-900 mb-0.5">Site Internet</p>
                          <p className="text-[10px] text-blue-700 leading-relaxed mb-2">Copiez votre lien TapTip et collez-le chez Stripe :</p>
                          <CopyProfileLink userId={user.id} />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="text-blue-600 font-bold text-xs mt-0.5">3.</span>
                        <div>
                          <p className="text-[11px] font-bold text-blue-900 mb-0.5">Validation</p>
                          <p className="text-[10px] text-blue-700 leading-relaxed">Renseignez votre <span className="font-bold">RIB</span> et prenez une photo de votre <span className="font-bold">pièce d'identité</span>.</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-blue-100/50">
                      <p className="text-[9px] text-blue-500 italic text-center">
                        Compte actif immédiatement après ces étapes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
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
