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

const sectionLabel: React.CSSProperties = {
  fontSize: '10px',
  fontFamily: 'var(--font-jetbrains), monospace',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#4a4a4c',
  marginBottom: '8px',
  marginLeft: '4px',
}

const card: React.CSSProperties = {
  background: '#0c0c0d',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [stripeStatus, profileResult] = await Promise.all([
    checkStripeStatus(),
    getProfile()
  ])

  const profile = profileResult.profile

  const { data: firstBadge } = await supabase
    .from('badges')
    .select('activated_at')
    .eq('user_id', user.id)
    .order('activated_at', { ascending: true })
    .limit(1)
    .single()

  return (
    <div className="min-h-[100dvh] flex justify-center" style={{ background: '#050505' }}>
      <div className="w-full max-w-[390px] min-h-[100dvh]" style={{ background: '#050505' }}>

        {/* Header */}
        <header
          className="px-5 py-4 flex items-center gap-3 sticky top-0 z-10"
          style={{
            background: 'rgba(5,5,5,0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Image src="/logo.png" alt="Logo" width={28} height={28} />
          <h1 className="text-base font-semibold" style={{ color: '#f4f4f4' }}>Paramètres</h1>
        </header>

        <main className="px-5 py-5 space-y-6">

          {/* Section Paiements */}
          <section>
            <p style={sectionLabel}>Paiements</p>
            <div style={card} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <span className="text-base">💳</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#f4f4f4' }}>Stripe Connect</p>
                  <p className="text-[10px]" style={{ color: stripeStatus.isComplete ? 'oklch(0.78 0.18 155)' : '#8b8b8d' }}>
                    {stripeStatus.isComplete ? '● Compte connecté' : 'Non configuré'}
                  </p>
                </div>
                {stripeStatus.isComplete ? (
                  <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.12)', color: '#f4f4f4' }}
                  >
                    Gérer
                  </a>
                ) : (
                  <StripeConnectButton />
                )}
              </div>

              {/* Guide d'activation Stripe */}
              {!stripeStatus.isComplete && (
                <div
                  className="mt-4 pt-4 rounded-xl p-4"
                  style={{
                    background: 'oklch(0.78 0.18 155 / 0.06)',
                    border: '1px solid oklch(0.78 0.18 155 / 0.2)',
                    marginTop: '12px',
                  }}
                >
                  <h3
                    className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
                    style={{ color: 'oklch(0.78 0.18 155)' }}
                  >
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: 'oklch(0.78 0.18 155)', color: '#000' }}
                    >
                      ?
                    </span>
                    Guide d&rsquo;activation rapide
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        n: '1.',
                        title: 'Type de structure',
                        text: <>Choisissez <strong>&quot;Particulier&quot;</strong> ou <strong>&quot;Entreprise individuelle&quot;</strong>. Pas besoin de SIRET pour débuter.</>,
                      },
                      {
                        n: '2.',
                        title: 'Site Internet',
                        text: <>Copiez votre lien TapTip et collez-le chez Stripe :<br /><span className="mt-2 inline-block"><CopyProfileLink userId={user.id} /></span></>,
                      },
                      {
                        n: '3.',
                        title: 'Validation & Sécurité',
                        text: <>Renseignez votre <strong>RIB</strong> et votre <strong>pièce d&rsquo;identité</strong>. Pour la sécurité, choisissez l&rsquo;option <strong>&quot;SMS&quot;</strong> (plus simple que l&rsquo;application).</>,
                      },
                    ].map(({ n, title, text }) => (
                      <div key={n} className="flex gap-3">
                        <span
                          className="font-bold text-xs mt-0.5"
                          style={{ color: 'oklch(0.78 0.18 155)', fontFamily: 'var(--font-jetbrains), monospace' }}
                        >
                          {n}
                        </span>
                        <div>
                          <p className="text-[11px] font-bold mb-0.5" style={{ color: '#f4f4f4' }}>{title}</p>
                          <p className="text-[10px] leading-relaxed" style={{ color: '#8b8b8d' }}>{text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3" style={{ borderTop: '1px solid oklch(0.78 0.18 155 / 0.15)' }}>
                    <p className="text-[9px] text-center italic" style={{ color: '#4a4a4c' }}>
                      Compte actif immédiatement après ces étapes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section Profil */}
          <section>
            <p style={sectionLabel}>Profil</p>
            <Link
              href="/dashboard/profile"
              className="block p-4 active:scale-[0.98] transition-all duration-200"
              style={{ ...card, display: 'block' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#f4f4f4' }}>Modifier mon profil</p>
                  <p className="text-[10px]" style={{ color: '#8b8b8d' }}>Photo, nom, métier…</p>
                </div>
                <span style={{ color: '#4a4a4c' }}>→</span>
              </div>
            </Link>
          </section>

          {/* Section Compte */}
          <section>
            <p style={sectionLabel}>Compte</p>
            <div style={{ ...card, overflow: 'hidden' }}>
              <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-medium" style={{ color: '#f4f4f4' }}>Email</p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: '#8b8b8d', fontFamily: 'var(--font-jetbrains), monospace' }}
                >
                  {user.email}
                </p>
              </div>
              <div className="p-4">
                <LogoutButton />
              </div>
            </div>
          </section>

          {/* Section Admin */}
          {user.email === (process.env.ADMIN_EMAIL || 'contact.taptip@gmail.com') && (
            <section>
              <p style={{ ...sectionLabel, color: 'oklch(0.78 0.18 155)' }}>Administration</p>
              <Link
                href="/admin/badges"
                className="block p-4 active:scale-[0.98] transition-all duration-200"
                style={{
                  ...card,
                  display: 'block',
                  background: 'oklch(0.78 0.18 155 / 0.06)',
                  border: '1px solid oklch(0.78 0.18 155 / 0.2)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#f4f4f4' }}>🏷️ Gestion des badges</p>
                    <p className="text-[10px]" style={{ color: '#8b8b8d' }}>Générer et suivre les badges NFC</p>
                  </div>
                  <span style={{ color: 'oklch(0.78 0.18 155)' }}>→</span>
                </div>
              </Link>
            </section>
          )}

          <p
            className="text-center text-[10px] pt-2"
            style={{ color: '#4a4a4c', fontFamily: 'var(--font-jetbrains), monospace' }}
          >
            TapTip v1.0
          </p>

          <div className="h-20" />
        </main>

        <BottomNav />
      </div>
    </div>
  )
}
