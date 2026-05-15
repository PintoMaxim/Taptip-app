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

  const { badge, error } = await getBadgeByCode(code)

  if (error || !badge) notFound()

  // Badge déjà activé + Stripe complet → profil public
  const users = badge.users as { stripe_onboarding_complete?: boolean } | null
  if (badge.user_id && users?.stripe_onboarding_complete) {
    redirect(`/p/${badge.user_id}`)
  }

  // Badge activé mais Stripe pas configuré
  if (badge.user_id && !users?.stripe_onboarding_complete) {
    const { data: { user } } = await supabase.auth.getUser()

    if (user && user.id === badge.user_id) {
      redirect('/dashboard/settings')
    }

    return (
      <div
        className="min-h-[100dvh] flex flex-col items-center justify-center px-6"
        style={{ background: '#050505' }}
      >
        <div className="text-center page-transition">
          <span className="text-6xl mb-6 block">⏳</span>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#f4f4f4' }}>
            Profil en cours de configuration
          </h1>
          <p className="text-sm mb-8" style={{ color: '#8b8b8d' }}>
            Ce badge est activé mais son propriétaire n&apos;a pas encore terminé la configuration.
          </p>
          <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs mb-4" style={{ color: '#4a4a4c' }}>C&apos;est votre badge ?</p>
            <a
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all duration-200 hover:brightness-110"
              style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
            >
              Se connecter à mon espace
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Badge non activé → formulaire d'activation
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-[100dvh] flex justify-center" style={{ background: '#050505' }}>
      <div className="w-full max-w-[390px] min-h-[100dvh] flex flex-col page-transition">

        {/* Header */}
        <header className="px-6 pt-12 pb-6 text-center">
          <Image
            src="/logo.png"
            alt="TapTip Logo"
            width={80}
            height={80}
            className="mx-auto mb-6"
            priority
          />
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#f4f4f4' }}>
            Activez votre badge
          </h1>
          <p className="text-sm" style={{ color: '#8b8b8d' }}>
            Créez votre compte pour commencer à recevoir des pourboires
          </p>
        </header>

        {/* Info badge */}
        <div
          className="mx-6 mb-6 p-4 rounded-xl text-center"
          style={{ background: '#0c0c0d', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p
            className="text-xs mb-1"
            style={{ color: '#4a4a4c', fontFamily: 'var(--font-jetbrains), monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            Code du badge
          </p>
          <code
            className="text-lg font-bold tracking-widest"
            style={{ fontFamily: 'var(--font-jetbrains), monospace', color: '#f4f4f4' }}
          >
            {badge.code}
          </code>
        </div>

        {/* Formulaire */}
        <main className="flex-1 px-6 pb-8">
          <ActivationForm code={badge.code} isLoggedIn={!!user} />
        </main>

        {/* Footer */}
        <footer
          className="py-6 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: '#4a4a4c' }}>
            En activant ce badge, vous acceptez nos{' '}
            <a href="#" className="underline" style={{ color: '#8b8b8d' }}>CGU</a>
          </p>
        </footer>

      </div>
    </div>
  )
}
