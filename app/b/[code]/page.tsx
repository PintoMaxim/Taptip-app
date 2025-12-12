import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getBadgeByCode } from '@/app/actions/badges'
import ActivationForm from './ActivationForm'
import Image from 'next/image'

interface PageProps {
  params: Promise<{ code: string }>
}

export default async function BadgeActivationPage({ params }: PageProps) {
  const { code } = await params
  const supabase = await createClient()
  
  // Récupérer le badge
  const { badge, error } = await getBadgeByCode(code)

  // Badge non trouvé
  if (error || !badge) {
    notFound()
  }

  // Badge déjà activé → rediriger vers le profil public
  const users = badge.users as { stripe_onboarding_complete?: boolean } | null
  if (badge.user_id && users?.stripe_onboarding_complete) {
    redirect(`/p/${badge.user_id}`)
  }

  // Badge activé mais Stripe pas configuré → rediriger vers le dashboard
  if (badge.user_id && !users?.stripe_onboarding_complete) {
    // Vérifier si c'est le propriétaire qui scanne
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && user.id === badge.user_id) {
      redirect('/dashboard/settings')
    }
    
    // Sinon, afficher un message d'attente
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <span className="text-6xl mb-6 block">⏳</span>
          <h1 className="text-xl font-bold text-black mb-2">
            Profil en cours de configuration
          </h1>
          <p className="text-gray-500 text-sm">
            Ce badge est activé mais son propriétaire n'a pas encore terminé la configuration.
        </p>
        </div>
      </div>
    )
  }

  // Badge non activé → afficher le formulaire d'activation
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[390px] min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="px-6 pt-12 pb-6 text-center">
          <Image
            src="/logo.png"
            alt="TapTip Logo"
            width={80}
            height={80}
            className="mx-auto mb-6 drop-shadow-sm"
            priority
          />
          <h1 className="text-2xl font-bold text-black mb-2">
            Activez votre badge
          </h1>
          <p className="text-gray-500 text-sm">
            Créez votre compte pour commencer à recevoir des pourboires
          </p>
        </header>

        {/* Badge Info */}
        <div className="mx-6 mb-6 p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-xs text-gray-400 mb-1">Code du badge</p>
          <code className="text-lg font-mono font-bold text-black tracking-wider">
              {badge.code}
          </code>
          </div>

        {/* Formulaire */}
        <main className="flex-1 px-6 pb-8">
          <ActivationForm code={badge.code} isLoggedIn={!!user} />
        </main>

        {/* Footer */}
        <footer className="py-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            En activant ce badge, vous acceptez nos{' '}
            <a href="#" className="underline">CGU</a>
          </p>
        </footer>
      </div>
    </div>
  )
}
